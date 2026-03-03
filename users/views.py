from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import CreateAPIView
from .models import CustomUser
from .serializers import (
    VendorSerializer,
    CustomerSerializer,
    UserSerializer,
    CustomerRegisterSerializer,
    VendorRegisterSerializer,
    AdminUserSerializer,
    ProfileSerializer,
)


class VendorViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role="vendor")
    serializer_class = VendorSerializer
    permission_classes = [permissions.IsAdminUser]


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.filter(role="customer")
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data)

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CustomerRegisterView(CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomerRegisterSerializer


class VendorRegisterView(CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = VendorRegisterSerializer
