from django.db import models
from django.conf import settings

class Review(models.Model):
    product = models.ForeignKey('Product', related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField()
    image = models.ImageField(upload_to='review_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.user} on {self.product}"


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    category = models.ForeignKey(Category, related_name='subcategories', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    
    class Meta:
        verbose_name_plural = 'Sub Categories'
    
    def __str__(self):
        return f"{self.category.name} > {self.name}"

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    subcategory = models.ForeignKey(SubCategory, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    image = models.ImageField(upload_to='products/')
    sizes = models.JSONField(default=list, blank=True)
    colors = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='product_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

class Banner(models.Model):
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='banners/')
    link = models.CharField(max_length=500, blank=True, default='/shop')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or f"Banner {self.id}"

class SiteSettings(models.Model):
    brand_name = models.CharField(max_length=100, default='BRAND.')
    about_text = models.TextField(default='Defining modern luxury through meticulous craftsmanship and ethical sourcing.')
    footer_address = models.CharField(max_length=255, default='123 Luxury Ave, DHAKA')
    footer_phone = models.CharField(max_length=50, default='+880 123 456 789')
    footer_email = models.EmailField(default='contact@brand.com')
    instagram_url = models.URLField(blank=True, default='https://instagram.com')
    twitter_url = models.URLField(blank=True, default='https://twitter.com')
    facebook_url = models.URLField(blank=True, default='https://facebook.com')
    facebook_url = models.URLField(blank=True, default='https://facebook.com')
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    return_window_days = models.PositiveIntegerField(default=14, help_text="Number of days after delivery that a return can be requested.")
    
    class Meta:
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'

    def save(self, *args, **kwargs):
        self.pk = 1 # Ensure only one record exists
        super(SiteSettings, self).save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Global Site Settings"

class Coupon(models.Model):
    DISCOUNT_CHOICES = (
        ('FLAT', 'Flat Amount'),
        ('PERCENTAGE', 'Percentage'),
    )
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_CHOICES, default='FLAT')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    expiry_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code

class CouponRule(models.Model):
    TRIGGER_CHOICES = (
        ('LOGIN', 'On User Login'),
        ('ORDER_OVER_AMOUNT', 'Order Value Exceeds'),
    )
    name = models.CharField(max_length=100)
    trigger_event = models.CharField(max_length=20, choices=TRIGGER_CHOICES)
    min_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="For Order Value trigger")
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserCouponHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rule = models.ForeignKey(CouponRule, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'rule') # Prevent duplicate sending

    def __str__(self):
        return f"{self.user} - {self.rule}"


class FooterSection(models.Model):
    name = models.CharField(max_length=100)
    priority = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['priority']

    def __str__(self):
        return self.name

class FooterLink(models.Model):
    section = models.ForeignKey(FooterSection, related_name='links', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    url = models.CharField(max_length=500)
    priority = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['priority']

    def __str__(self):
        return f"{self.section.name} > {self.name}"

class ShippingLocation(models.Model):
    name = models.CharField(max_length=100)
    charge = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
