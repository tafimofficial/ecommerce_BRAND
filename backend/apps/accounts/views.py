from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token
from .models import Address
from .serializers import UserSerializer, RegisterSerializer, AddressSerializer

User = get_user_model()

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(username=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            
            # --- Smart Coupon Logic: Login Trigger ---
            try:
                from django.utils import timezone
                from apps.store.models import CouponRule, UserCouponHistory
                from utils.email_service import EmailService

                now = timezone.now()
                # Find active login rules
                login_rules = CouponRule.objects.filter(
                    trigger_event='LOGIN',
                    is_active=True,
                    start_date__lte=now,
                    end_date__gte=now
                )

                for rule in login_rules:
                    # Check if already sent
                    if not UserCouponHistory.objects.filter(user=user, rule=rule).exists():
                        # Record history first to prevent race usage (simple lock)
                        UserCouponHistory.objects.create(user=user, rule=rule)
                        
                        # Send Email
                        # We need a new method in email service or use generic send
                        subject = f"You've unlocked a reward: {rule.name}"
                        message = f"Hi {user.full_name},\n\nThanks for logging in! As a special treat, here is a coupon code just for you:\n\nCode: {rule.coupon.code}\nDiscount: {rule.coupon.discount_value} ({rule.coupon.discount_type})\n\nEnjoy shopping!\nLuxStore Team"
                        EmailService.send_email(subject, message, [user.email])
            except Exception as e:
                print(f"Coupon Rule Error: {e}")
            # -----------------------------------------

            return Response({'token': token.key, 'user': UserSerializer(user).data})
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            
            # Send Welcome Email
            from utils.email_service import EmailService
            EmailService.send_welcome_email(user)
            
            return Response({'token': token.key, 'user': UserSerializer(user).data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
