from rest_framework import viewsets
from .models import CustomUser
from .serializers import VendorSerializer, CustomerSerializer

class VendorViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role="vendor")
    serializer_class = VendorSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role="customer")
    serializer_class = CustomerSerializer
