from rest_framework import viewsets, mixins, permissions
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(mixins.CreateModelMixin, 
                   mixins.RetrieveModelMixin, 
                   mixins.ListModelMixin,
                   mixins.UpdateModelMixin,
                   viewsets.GenericViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        if user.is_authenticated:
            return Order.objects.filter(user=user).order_by('-created_at')
        
        # For guests, allow retrieval of a specific order by ID to facilitate payment flow.
        # List action is still restricted.
        if getattr(self, 'action', None) == 'list':
            return Order.objects.none()
        return Order.objects.all()
    
    def perform_update(self, serializer):
        instance = serializer.save()
        
        # Send Status Update Email if status changed (implied by this being a patch to status)
        # In a real app we'd check if 'status' was in validated_data and diff it.
        # Here we assume any update to this viewset might be a status update or we check explicitly.
        if 'status' in serializer.validated_data:
             from utils.email_service import EmailService
             EmailService.send_order_status_update(instance)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            # Save the order first
            order = serializer.save(user=self.request.user)
            
            # --- Smart Coupon Logic: Order Amount Trigger ---
            try:
                from django.utils import timezone
                from apps.store.models import CouponRule, UserCouponHistory
                from utils.email_service import EmailService

                now = timezone.now()
                # Find active order amount rules
                order_rules = CouponRule.objects.filter(
                    trigger_event='ORDER_OVER_AMOUNT',
                    is_active=True,
                    start_date__lte=now,
                    end_date__gte=now,
                    min_amount__lte=order.total_price # Check logic in DB query
                )

                for rule in order_rules:
                    # Check if already sent (optional: allow multiple times for order rules? usually yes, but let's stick to history check for spam prevention or maybe allow once per day? 
                    # For now, let's allow it if they haven't received THIS specific rule before. 
                    # If we want recurring, we would need a more complex history check or a recurring flag.
                    # Assuming "One-time reward per campaign" for now directly from UserCouponHistory logic.
                    if not UserCouponHistory.objects.filter(user=self.request.user, rule=rule).exists():
                         UserCouponHistory.objects.create(user=self.request.user, rule=rule)
                         
                         subject = f"Big Spender Reward: {rule.name}"
                         message = f"Hi {order.full_name},\n\nThank you for your purchase of {order.total_price}! You've qualified for a special reward:\n\nCode: {rule.coupon.code}\nDiscount: {rule.coupon.discount_value} ({rule.coupon.discount_type})\n\nUse it on your next order!\nLuxStore Team"
                         EmailService.send_email(subject, message, [order.email])
            except Exception as e:
                print(f"Coupon Rule Order Error: {e}")
            # ------------------------------------------------

            # Auto-save Address Logic
            try:
                from apps.accounts.models import Address
                
                # Check for existing duplicate address
                address_exists = Address.objects.filter(
                    user=self.request.user,
                    street_address=order.address_line_1,
                    city=order.city,
                    postal_code=order.postal_code,
                    country=order.country
                ).exists()
                
                if not address_exists:
                    # Check if user already has a default address
                    has_default = Address.objects.filter(user=self.request.user, is_default=True).exists()
                    
                    Address.objects.create(
                        user=self.request.user,
                        street_address=order.address_line_1,
                        city=order.city,
                        state=order.state,
                        postal_code=order.postal_code,
                        country=order.country,
                        is_default=not has_default # Set as default if no default exists
                    )
            except Exception as e:
                # Log error but don't fail the order creation
                pass
        
            # Send Order Confirmation Email
            from utils.email_service import EmailService
            EmailService.send_order_confirmation(order)
            
        else:
            serializer.save()


from .models import ReturnRequest
from .serializers import ReturnRequestSerializer

class ReturnRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ReturnRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return ReturnRequest.objects.all().order_by('-created_at')
        return ReturnRequest.objects.filter(user=user).order_by('-created_at')

        return ReturnRequest.objects.filter(user=user).order_by('-created_at')

    def perform_update(self, serializer):
        instance = serializer.save()
        if 'status' in serializer.validated_data:
            from utils.email_service import EmailService
            EmailService.send_return_status_update(instance)

    def perform_create(self, serializer):
        from django.utils import timezone
        from apps.store.models import SiteSettings
        from rest_framework.exceptions import ValidationError

        order = serializer.validated_data['order']
        
        # Check if order belongs to user
        if order.user != self.request.user:
            raise ValidationError("You can only request returns for your own orders.")

        # Check order status - must be Delivered
        if order.status != 'Delivered':
             raise ValidationError("Order must be delivered before requesting a return.")

        # Check return window
        settings = SiteSettings.load()
        window_days = settings.return_window_days
        
        # specific logic: assuming order.updated_at is delivery time if status is Delivered, 
        # or we might need a specific 'delivered_at' field. For now using updated_at as proxy for status change.
        # Ideally we should have a delivered_at field. Let's stick to updated_at for now.
        delta = timezone.now() - order.updated_at
        if delta.days > window_days:
            raise ValidationError(f"Return period of {window_days} days has expired.")

        serializer.save(user=self.request.user)
# --- SSLCommerz Payment Views ---

import uuid
import requests
from django.conf import settings
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([AllowAny])
def init_payment(request):
    order_id = request.data.get('order_id')
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)

    # Base URL for callbacks (assuming localhost for dev, needs update for prod)
    base_url = request.build_absolute_uri('/')[:-1] # Remove trailing slash
    
    post_body = {
        'store_id': settings.SSL_STORE_ID,
        'store_passwd': settings.SSL_STORE_PASSWORD,
        'total_amount': str(order.total_price),
        'currency': 'BDT',
        'tran_id': f"txn_{order.id}_{uuid.uuid4().hex[:6]}",
        'success_url': f"{base_url}/api/payment/success/",
        'fail_url': f"{base_url}/api/payment/fail/",
        'cancel_url': f"{base_url}/api/payment/cancel/",
        'emi_option': 0,
        'cus_name': order.full_name,
        'cus_email': order.email,
        'cus_phone': order.phone,
        'cus_add1': order.address_line_1,
        'cus_city': order.city,
        'cus_country': order.country,
        'shipping_method': 'NO', 
        'product_name': 'Items',
        'product_category': 'General',
        'product_profile': 'general',
    }

    url = 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php' if settings.SSL_IS_SANDBOX else 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'

    try:
        response = requests.post(url, data=post_body)
        data = response.json()
        
        if data.get('status') == 'SUCCESS':
            return Response({'gateway_url': data.get('GatewayPageURL')})
        else:
            return Response({'error': 'Failed to initiate payment', 'details': data}, status=400)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_success(request):
    payload = request.POST
    tran_id = payload.get('tran_id')
    # val_id = payload.get('val_id') 
    
    # Ideally verify payment with val_id here calling SSLCommerz validation API
    
    # Extract Order ID from tran_id (assuming format txn_{order_id}_{uuid})
    try:
        parts = tran_id.split('_')
        order_id = parts[1]
        order = Order.objects.get(id=order_id)
        order.is_paid = True
        order.payment_method = 'SSLCommerz'
        order.status = 'Processing' # Advance status
        order.save()
        
        # Redirect to frontend success page
        return redirect(f"{settings.FRONTEND_URL}/payment/status?status=success")
    except Exception as e:
        # Log error in production
        return redirect(f"{settings.FRONTEND_URL}/payment/status?status=error")

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_fail(request):
    return redirect(f"{settings.FRONTEND_URL}/payment/status?status=fail")

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def payment_cancel(request):
    return redirect(f"{settings.FRONTEND_URL}/payment/status?status=cancel")
