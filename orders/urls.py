from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CartViewSet, CartItemViewSet, PaymentViewSet, VendorAnalyticsView

from django.urls import path
from .views import initiate_esewa_payment, esewa_success, esewa_failure

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'carts', CartViewSet) 
router.register(r'cart-items', CartItemViewSet)
router.register(r'payments', PaymentViewSet, basename="payments")

urlpatterns = router.urls + [
    path("payment/initiate/<int:order_id>/", initiate_esewa_payment, name="initiate-esewa-payment"),
    path("payment/success/", esewa_success, name="esewa-success"),
    path("payment/failure/", esewa_failure, name="esewa-failure"),
    path("vendor/analytics/", VendorAnalyticsView.as_view(), name="vendor-analytics"),
]
