from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, CartViewSet, CartItemViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)
router.register(r'carts', CartViewSet) 
router.register(r'cart-items', CartItemViewSet)

urlpatterns = router.urls


