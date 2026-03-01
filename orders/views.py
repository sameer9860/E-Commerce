from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Order, Cart, CartItem
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer


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
