from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "customer":
            raise PermissionDenied("Only customers can place orders.")
        serializer.save(customer=user)
