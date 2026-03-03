from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Order, Cart, CartItem, Payment
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer, PaymentSerializer
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.response import Response
import requests
from django.http import JsonResponse
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate





class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Order.objects.all()
        # Customers only see their own orders
        if user.role == "customer":
            return Order.objects.filter(customer=user)
        # Vendors only see orders for their products
        if user.role == "vendor":
            return Order.objects.filter(product__vendor=user)
        return Order.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "customer":
            raise PermissionDenied("Only customers can place orders.")
        # check stock before saving
        product = serializer.validated_data.get("product")
        qty = serializer.validated_data.get("quantity", 1)
        if product.stock < qty:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Not enough stock for this product.")

        order = serializer.save(customer=user)

        # create payment
        Payment.objects.create(
            order=order,
            amount=order.product.price * qty,
            status="Success",
        )

        # deduct inventory
        product.stock -= qty
        product.save()

        # optionally clear cart items related to this product
        try:
            cart = Cart.objects.get(customer=user)
            CartItem.objects.filter(cart=cart, product=product).delete()
        except Cart.DoesNotExist:
            pass

    def perform_update(self, serializer):
        user = self.request.user
        # Only vendors/admins can update status
        if user.role == "customer" and not (user.is_staff or user.is_superuser):
            raise PermissionDenied("Customers cannot update order status.")
        if user.role == "vendor" and hasattr(user, "is_approved") and not user.is_approved:
            raise PermissionDenied("Vendor account is not approved yet.")
        if user.role == "vendor" and serializer.instance.product.vendor_id != user.id:
            raise PermissionDenied("You can only update orders for your own products.")
        serializer.save()



class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user
        if getattr(user, "role", None) != "customer":
            raise PermissionDenied("Only customers can have carts.")
        cart, created = Cart.objects.get_or_create(customer=user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=201 if created else 200)

    def perform_create(self, serializer):
        # create() is overridden to ensure one cart per customer
        user = self.request.user
        if getattr(user, "role", None) != "customer":
            raise PermissionDenied("Only customers can have carts.")
        serializer.save(customer=user)

    def get_queryset(self):
        # customers should only see their own cart
        user = self.request.user
        if user.role == "customer":
            return Cart.objects.filter(customer=user)
        # allow admins to view all carts if desired
        return Cart.objects.all()


class CartItemViewSet(viewsets.ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) != "customer":
            raise PermissionDenied("Only customers can add cart items.")

        cart, _created = Cart.objects.get_or_create(customer=user)
        product = serializer.validated_data.get("product")
        qty = serializer.validated_data.get("quantity", 1)
        if product.stock < qty:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Not enough stock for this product.")
        serializer.save(cart=cart)

    def get_queryset(self):
        # customers only see items in their own cart
        user = self.request.user
        if user.role == "customer":
            try:
                cart = Cart.objects.get(customer=user)
                return CartItem.objects.filter(cart=cart)
            except Cart.DoesNotExist:
                return CartItem.objects.none()
        return CartItem.objects.all()


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = Payment.objects.select_related("order", "order__product", "order__customer")
        if user.is_staff or user.is_superuser:
            return base
        if user.role == "customer":
            return base.filter(order__customer=user)
        if user.role == "vendor":
            return base.filter(order__product__vendor=user)
        return base.none()


class VendorAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "vendor":
            raise PermissionDenied("Only vendors can view analytics.")
        if hasattr(user, "is_approved") and not user.is_approved:
            raise PermissionDenied("Vendor account is not approved yet.")

        paid = Payment.objects.filter(order__product__vendor=user, status="Success")
        total_revenue = paid.aggregate(total=Sum("amount"))["total"] or 0
        total_paid_orders = paid.count()

        revenue_by_product = list(
            paid.values("order__product__id", "order__product__name")
            .annotate(revenue=Sum("amount"), payments=Count("id"))
            .order_by("-revenue")
        )

        revenue_by_day = list(
            paid.annotate(day=TruncDate("order__created_at"))
            .values("day")
            .annotate(revenue=Sum("amount"), payments=Count("id"))
            .order_by("day")
        )

        orders = Order.objects.filter(product__vendor=user)
        status_breakdown = (
            orders.values("status").annotate(count=Count("id")).order_by("status")
        )

        return Response(
            {
                "total_revenue": str(total_revenue),
                "total_paid_orders": total_paid_orders,
                "revenue_by_product": revenue_by_product,
                "revenue_by_day": revenue_by_day,
                "status_breakdown": list(status_breakdown),
            }
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def initiate_esewa_payment(request, order_id):
    try:
        order = Order.objects.get(id=order_id, customer=request.user)
    except Order.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=404)

    if order.status != "Pending":
        return JsonResponse({"error": "Order is not in a payable state"}, status=400)

    amount = float(order.product.price * order.quantity)

    Payment.objects.get_or_create(order=order, defaults={"amount": amount})

    # eSewa sandbox payment URL from settings
    esewa_url = settings.ESEWA_PAYMENT_URL

    # Build absolute success/failure URLs
    success_url = request.build_absolute_uri(reverse("esewa-success"))
    failure_url = request.build_absolute_uri(reverse("esewa-failure"))

    import time
    # eSewa requires a unique pid for each transaction in sandbox
    unique_pid = f"{order.id}-{int(time.time())}"

    params = {
        "amt": amount,
        "pdc": 0,
        "psc": 0,
        "txAmt": 0,
        "tAmt": amount,
        "pid": unique_pid,
        "scd": settings.ESEWA_MERCHANT_CODE,
        "su": success_url,
        "fu": failure_url,
    }

    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    payment_url = f"{esewa_url}?{query_string}"
    
    return JsonResponse({"payment_url": payment_url})



def esewa_success(request):
    pid = request.GET.get("pid") or request.GET.get("oid")
    amt = request.GET.get("amt")
    refId = request.GET.get("refId")

    if not pid:
        return JsonResponse({"error": "Missing pid"}, status=400)

    # Extract original order ID
    order_id = pid.split('-')[0]

    data = {
        "amt": amt,
        "scd": settings.ESEWA_MERCHANT_CODE,
        "pid": pid,
        "rid": refId,
    }

    try:
        response = requests.post(settings.ESEWA_VERIFY_URL, data=data)
        # eSewa V1 returns XML. Check for "Success" status.
        if "Success" in response.text or "<status>success</status>" in response.text.lower():
            order = Order.objects.get(id=order_id)
            order.status = "Confirmed"
            order.save()
            
            payment = order.payment
            payment.status = "Success"
            payment.esewa_transaction_id = refId
            payment.save()
            return redirect("http://localhost:5173/customer?payment=success")
        else:
            return redirect("http://localhost:5173/customer?payment=failed")
    except Exception:
        return redirect("http://localhost:5173/customer?payment=error")
    

def esewa_failure(request):
    return JsonResponse({"message": "Payment failed"}, status=400)