from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]  # default

    def get_permissions(self):
        """
        Allow anyone to list/retrieve products, but require authentication for
        create/update/delete.
        """
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "vendor":
            raise PermissionDenied("Only vendors can add products.")
        if hasattr(user, "is_approved") and not user.is_approved:
            raise PermissionDenied("Vendor account is not approved yet.")
        serializer.save(vendor=user)

    def get_queryset(self):
        # if vendor, only list own products (admins can see all)
        user = self.request.user
        if getattr(user, "is_authenticated", False) and getattr(user, "role", None) == "vendor":
            return Product.objects.filter(vendor=user)
        return Product.objects.all()

    def perform_update(self, serializer):
        user = self.request.user
        if user.role != "vendor":
            raise PermissionDenied("Only vendors can update products.")
        if hasattr(user, "is_approved") and not user.is_approved:
            raise PermissionDenied("Vendor account is not approved yet.")
        # ensure the vendor owns this product
        if serializer.instance.vendor != user:
            raise PermissionDenied("You can only modify your own products.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if user.role != "vendor":
            raise PermissionDenied("Only vendors can delete products.")
        if hasattr(user, "is_approved") and not user.is_approved:
            raise PermissionDenied("Vendor account is not approved yet.")
        if instance.vendor != user:
            raise PermissionDenied("You can only delete your own products.")
        instance.delete()
