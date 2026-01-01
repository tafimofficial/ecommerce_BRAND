from django.contrib import admin
from .models import Category, SubCategory, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'slug']
    list_filter = ['category']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'stock', 'category', 'subcategory', 'is_available']
    list_filter = ['is_available', 'category', 'subcategory']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}

from .models import SiteSettings, ShippingLocation

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['brand_name', 'delivery_charge']

@admin.register(ShippingLocation)
class ShippingLocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'charge', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
