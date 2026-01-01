from rest_framework.routers import DefaultRouter
from apps.store.views import (
    CategoryViewSet, ProductViewSet, SubCategoryViewSet, BannerViewSet, 
    SiteSettingsViewSet, CouponViewSet, FooterSectionViewSet, FooterLinkViewSet, ShippingLocationViewSet,
    ReviewViewSet, CouponRuleViewSet
)
from apps.orders.views import OrderViewSet, ReturnRequestViewSet
from apps.accounts.views import AuthViewSet, AddressViewSet, UserViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'banners', BannerViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'subcategories', SubCategoryViewSet)
router.register(r'site-settings', SiteSettingsViewSet, basename='site-settings')
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'returns', ReturnRequestViewSet, basename='returns')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='users')
router.register(r'addresses', AddressViewSet, basename='addresses')
router.register(r'coupons', CouponViewSet)
router.register(r'coupon-rules', CouponRuleViewSet)
router.register(r'footer-sections', FooterSectionViewSet)
router.register(r'footer-links', FooterLinkViewSet)
router.register(r'shipping-locations', ShippingLocationViewSet)
router.register(r'reviews', ReviewViewSet, basename='reviews')

urlpatterns = router.urls
