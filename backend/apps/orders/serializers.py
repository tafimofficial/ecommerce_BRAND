from rest_framework import serializers
from .models import Order, OrderItem
from apps.store.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_slug = serializers.CharField(write_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['product_slug', 'product_name', 'product_image', 'price', 'quantity', 'size', 'color']

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'full_name', 'email', 'phone', 
            'address_line_1', 'address_line_2', 'city', 'state', 
            'postal_code', 'country', 'items', 'total_price', 
            'shipping_price', 'discount_amount', 'coupon_code',
            'status', 'payment_method', 'is_paid', 'created_at'
        ]
        read_only_fields = ['user']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # 1. Pre-validation: Ensure all items have sufficient stock
        order_items_to_create = []
        for item_data in items_data:
            product_slug = item_data.get('product_slug')
            try:
                product = Product.objects.get(slug=product_slug)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with slug '{product_slug}' does not exist.")
            
            quantity = item_data['quantity']
            if product.stock < quantity:
                raise serializers.ValidationError(f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {quantity}")
            
            order_items_to_create.append({
                'product': product,
                'quantity': quantity,
                'price': product.price, # Take current price
                'size': item_data.get('size'),
                'color': item_data.get('color')
            })

        # 2. Create the Order
        shipping_price = validated_data.get('shipping_price', 0)
        discount_amount = validated_data.get('discount_amount', 0)
        order = Order.objects.create(**validated_data)
        
        # 3. Process items and decrement stock
        total_items_price = 0
        for item in order_items_to_create:
            product = item['product']
            quantity = item['quantity']
            price = item['price']
            
            # Create OrderItem
            OrderItem.objects.create(
                order=order, 
                product=product, 
                price=price, 
                quantity=quantity,
                size=item.get('size'),
                color=item.get('color')
            )
            
            # Decrement Stock
            product.stock -= quantity
            product.save()
            
            total_items_price += price * quantity
        
        # 4. Finalize order totals
        order.total_price = total_items_price + shipping_price - discount_amount
        order.save()
        return order

from .models import ReturnRequest

class ReturnRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReturnRequest
        fields = ['id', 'order', 'user', 'reason', 'image', 'status', 'admin_note', 'created_at']
        read_only_fields = ['user', 'created_at']
