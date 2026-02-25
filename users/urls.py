from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, CustomerViewSet

router = DefaultRouter()
router.register(r'vendors', VendorViewSet, basename="vendor")
router.register(r'customers', CustomerViewSet, basename="customer")

urlpatterns = router.urls
