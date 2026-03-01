from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Order, Cart, CartItem, Payment
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer, PaymentSerializer
from django.conf import settings
from django.shortcuts import redirect
import requests
from rest_framework.response import Response



class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Customers only see their own orders
        if user.role == "customer":
            return Order.objects.filter(customer=user)
        # Vendors/Admins see all orders
        return Order.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "customer":
            raise PermissionDenied("Only customers can place orders.")
        serializer.save(customer=user)

    def perform_update(self, serializer):
        user = self.request.user
        # Only vendors/admins can update status
        if user.role == "customer":
            raise PermissionDenied("Customers cannot update order status.")
        serializer.save()



class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "customer":
            raise PermissionDenied("Only customers can have carts.")
        serializer.save(customer=user)

class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        cart = Cart.objects.get(customer=self.request.user)
        serializer.save(cart=cart)
        
        
        

def initiate_esewa_payment(request, order_id):
    order = Order.objects.get(id=order_id)
    amount = sum(item.product.price * item.quantity for item in order.items.all())

    payment = Payment.objects.create(order=order, amount=amount)

    esewa_url = "https://uat.esewa.com.np/epay/main"
    params = {
        "amt": amount,
        "pid": str(order.id),  # order ID
        "scd": settings.ESEWA_MERCHANT_ID,
        "su": settings.ESEWA_SUCCESS_URL,
        "fu": settings.ESEWA_FAILURE_URL,
    }

    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return redirect(f"{esewa_url}?{query_string}")

def esewa_success(request):
    oid = request.GET.get("oid")
    amt = request.GET.get("amt")
    refId = request.GET.get("refId")

    data = {
        "amt": amt,
        "scd": settings.ESEWA_MERCHANT_ID,
        "pid": oid,
        "rid": refId,
    }

    response = requests.post(settings.ESEWA_VERIFY_URL, data=data)

    if "Success" in response.text:
        order = Order.objects.get(id=oid)
        order.status = "Confirmed"
        order.save()
        order.payment.status = "Success"
        order.payment.esewa_transaction_id = refId
        order.payment.save()
        return Response({"message": "Payment successful"})
    else:
        return Response({"error": "Payment verification failed"}, status=400)

def esewa_failure(request):
    return Response({"error": "Payment failed"}, status=400)
       
