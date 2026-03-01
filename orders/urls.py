from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CartViewSet, CartItemViewSet

from django.urls import path
from .views import initiate_esewa_payment, esewa_success, esewa_failure

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'carts', CartViewSet) 
router.register(r'cart-items', CartItemViewSet)

urlpatterns = router.urls



urlpatterns = [
    path("payment/<int:order_id>/", initiate_esewa_payment, name="initiate_esewa_payment"),
    path("payment/success/", esewa_success, name="esewa_success"),
    path("payment/failure/", esewa_failure, name="esewa_failure"),
]
