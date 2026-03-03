from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    VendorViewSet,
    CustomerViewSet,
    CurrentUserView,
    CustomerRegisterView,
    VendorRegisterView,
    AdminUserViewSet,
    ProfileView,
)

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename="vendor")
router.register(r'customers', CustomerViewSet, basename="customer")
router.register(r'admin-users', AdminUserViewSet, basename="admin-users")

urlpatterns = router.urls + [
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("auth/register/customer/", CustomerRegisterView.as_view(), name="register-customer"),
    path("auth/register/vendor/", VendorRegisterView.as_view(), name="register-vendor"),
]
