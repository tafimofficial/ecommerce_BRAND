from rest_framework import viewsets, permissions
from .models import Category, SubCategory, Product, ProductImage, Banner, SiteSettings, Coupon, FooterSection, FooterLink, ShippingLocation, CouponRule
from .serializers import (
    CategorySerializer, SubCategorySerializer, ProductSerializer, BannerSerializer, 
    SiteSettingsSerializer, CouponSerializer, FooterLinkSerializer, FooterSectionSerializer, ShippingLocationSerializer,
    ReviewSerializer, CouponRuleSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class FooterLinkViewSet(viewsets.ModelViewSet):
    queryset = FooterLink.objects.all()
    serializer_class = FooterLinkSerializer
    permission_classes = [IsAdminOrReadOnly]

class FooterSectionViewSet(viewsets.ModelViewSet):
    queryset = FooterSection.objects.all()
    serializer_class = FooterSectionSerializer
    permission_classes = [IsAdminOrReadOnly]


from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response

class SiteSettingsViewSet(viewsets.GenericViewSet):
    serializer_class = SiteSettingsSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return SiteSettings.objects.filter(pk=1)

    def list(self, request):
        settings = SiteSettings.load()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        settings = SiteSettings.load()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

from django.utils import timezone

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [IsAdminOrReadOnly]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def apply(self, request):
        code = request.data.get('code')
        amount = request.data.get('amount', 0)
        
        try:
            coupon = Coupon.objects.get(code=code, is_active=True)
            
            # Check expiry
            if coupon.expiry_date < timezone.now():
                return Response({'error': 'Coupon has expired.'}, status=400)
            
            # Check min purchase
            if float(amount) < float(coupon.min_purchase):
                return Response({'error': f'Minimum purchase of ৳{coupon.min_purchase} required.'}, status=400)
            
            return Response({
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'discount_value': coupon.discount_value
            })
            
        except Coupon.DoesNotExist:
            return Response({'error': 'Invalid coupon code.'}, status=404)

class CouponRuleViewSet(viewsets.ModelViewSet):
    queryset = CouponRule.objects.all().order_by('-created_at')
    serializer_class = CouponRuleSerializer
    permission_classes = [IsAdminOrReadOnly]


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all().order_by('-created_at')
    serializer_class = BannerSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

class SubCategoryViewSet(viewsets.ModelViewSet):
    queryset = SubCategory.objects.all()
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name')
        slug = slugify(name)
        if SubCategory.objects.filter(slug=slug).exists():
            slug = f"{slug}-{SubCategory.objects.count()}"
        serializer.save(slug=slug)

from django.utils.text import slugify

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminOrReadOnly]

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name')
        slug = slugify(name)
        if Product.objects.filter(slug=slug).exists():
            slug = f"{slug}-{Product.objects.count()}"
        product = serializer.save(slug=slug)
        
        # Handle multiple images
        images = self.request.FILES.getlist('uploaded_images')
        for image in images:
            ProductImage.objects.create(product=product, image=image)

    def perform_update(self, serializer):
        product = serializer.save()
        images = self.request.FILES.getlist('uploaded_images')
        for image in images:
            ProductImage.objects.create(product=product, image=image)

class ShippingLocationViewSet(viewsets.ModelViewSet):
    queryset = ShippingLocation.objects.all().order_by('name')
    serializer_class = ShippingLocationSerializer
    permission_classes = [IsAdminOrReadOnly]

from apps.orders.models import Order
from .models import Review

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None # Show all reviews

    def get_queryset(self):
        product_slug = self.request.query_params.get('product_slug')
        if product_slug:
            return Review.objects.filter(product__slug=product_slug)
        return Review.objects.all()

    def perform_create(self, serializer):
        product_slug = self.request.data.get('product_slug')
        if not product_slug:
             raise serializers.ValidationError({"product_slug": "This field is required."})
             
        try:
            product = Product.objects.get(slug=product_slug)
        except Product.DoesNotExist:
             raise serializers.ValidationError({"product_slug": "Invalid product slug."})

        user = self.request.user

        # Check for verified purchase
        has_purchased = Order.objects.filter(
            user=user, 
            items__product=product, 
            status='Delivered'
        ).exists()

        if not has_purchased:
            raise permissions.PermissionDenied("You must purchase and receive this product to review it.")
        
        # Check if already reviewed
        if Review.objects.filter(user=user, product=product).exists():
            raise permissions.PermissionDenied("You have already reviewed this product.")

        serializer.save(user=user, product=product)
