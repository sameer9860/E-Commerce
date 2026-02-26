from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]  # Require login


    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "vendor":
            raise PermissionDenied("Only vendors can add products.")
        serializer.save(vendor=user)
