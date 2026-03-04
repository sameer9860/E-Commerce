from rest_framework import serializers
from .models import Order, Cart, CartItem, Payment

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price", max_digits=10, decimal_places=2, read_only=True
    )
    customer_username = serializers.CharField(source="customer.username", read_only=True)
    vendor_id = serializers.IntegerField(source="product.vendor_id", read_only=True)
    product_image = serializers.URLField(source="product.image_url", read_only=True)

    payment_status = serializers.SerializerMethodField()
    payment_amount = serializers.SerializerMethodField()
    esewa_transaction_id = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = "__all__"
        extra_kwargs = {"customer": {"read_only": True}}

    def get_payment_status(self, obj):
        try:
            return obj.payment.status
        except Payment.DoesNotExist:
            return None

    def get_payment_amount(self, obj):
        try:
            return str(obj.payment.amount)
        except Payment.DoesNotExist:
            return None

    def get_esewa_transaction_id(self, obj):
        try:
            return obj.payment.esewa_transaction_id
        except Payment.DoesNotExist:
            return None


class CartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity"]

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "customer", "items", "created_at"]



class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    customer_username = serializers.CharField(source="order.customer.username", read_only=True)
    product_name = serializers.CharField(source="order.product.name", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "order_id",
            "amount",
            "status",
            "esewa_transaction_id",
            "customer_username",
            "product_name",
        ]
