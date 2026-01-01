from rest_framework import serializers
from rest_framework import serializers
from .models import Category, SubCategory, Product, ProductImage, Banner, SiteSettings, Coupon, FooterSection, FooterLink, ShippingLocation, Review, CouponRule

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'image', 'created_at']
        read_only_fields = ['user']

class FooterLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = FooterLink
        fields = '__all__'

class FooterSectionSerializer(serializers.ModelSerializer):
    links = FooterLinkSerializer(many=True, read_only=True)
    class Meta:
        model = FooterSection
        fields = ['id', 'name', 'priority', 'links']

class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'

class CouponRuleSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(source='coupon.code', read_only=True)
    
    class Meta:
        model = CouponRule
        fields = '__all__'


class SubCategorySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    
    class Meta:
        model = SubCategory
        fields = ['id', 'category', 'category_name', 'name', 'slug']

class CategorySerializer(serializers.ModelSerializer):
    subcategories = SubCategorySerializer(many=True, read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'image', 'subcategories']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    subcategory = SubCategorySerializer(read_only=True)
    subcategory_id = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(), source='subcategory', write_only=True, required=False, allow_null=True
    )
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'name', 'slug', 'description', 
                  'price', 'stock', 'is_available', 'image', 'images', 'sizes', 'colors']
        read_only_fields = ['slug']
class ShippingLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingLocation
        fields = '__all__'
