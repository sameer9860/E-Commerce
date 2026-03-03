from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Order, Cart, CartItem, Payment
from .serializers import OrderSerializer, CartSerializer, CartItemSerializer
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.response import Response
import requests



class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Customers only see their own orders
        if user.role == "customer":
            return Order.objects.filter(customer=user)
        # Vendors/Admins see all orders
        return Order.objects.all()

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
        if user.role == "customer":
            raise PermissionDenied("Customers cannot update order status.")
        serializer.save()



class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != "customer":
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
        cart = Cart.objects.get(customer=self.request.user)
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




def initiate_esewa_payment(request, order_id):
    # only authenticated customers can initiate payment
    if not request.user.is_authenticated:
        from django.http import HttpResponseForbidden
        return HttpResponseForbidden("Authentication required")

    try:
        order = Order.objects.get(id=order_id, customer=request.user)
    except Order.DoesNotExist:
        from django.http import HttpResponseNotFound
        return HttpResponseNotFound("Order not found")

    if order.status != "Pending":
        from django.http import HttpResponseBadRequest
        return HttpResponseBadRequest("Order is not in a payable state")

    # recalc amount from the order itself (single-product model)
    amount = order.product.price * order.quantity

    # create a pending payment record
    payment = Payment.objects.create(order=order, amount=amount)
    payment.save()

    # sandbox endpoint for development (rc.esewa.com.np is the sandbox host)
    # switch to https://esewa.com.np/epay/main for production
    esewa_url = "https://rc.esewa.com.np/"
    params = {
        "amt": amount,
        "pid": str(order.id),  # order ID
        "scd": settings.ESEWA_MERCHANT_ID,
        "su": settings.ESEWA_SUCCESS_URL,
        "fu": settings.ESEWA_FAILURE_URL,
    }

    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return redirect(f"{esewa_url}?{query_string}")


from django.http import JsonResponse, HttpResponse

def esewa_success(request):
    # eSewa returns pid parameter for the order id when redirecting back
    oid = request.GET.get("pid") or request.GET.get("oid")
    amt = request.GET.get("amt")
    refId = request.GET.get("refId")

    data = {
        "amt": amt,
        "scd": settings.ESEWA_MERCHANT_ID,
        "pid": oid,
        "rid": refId,
    }

    response = requests.post(settings.ESEWA_VERIFY_URL, data=data)

    if "Success" in response.text:
        order = Order.objects.get(id=oid)
        order.status = "Confirmed"
        order.save()
        order.payment.status = "Success"
        order.payment.esewa_transaction_id = refId
        order.payment.save()
        return JsonResponse({"message": "Payment successful"})
    else:
        return JsonResponse({"error": "Payment verification failed"}, status=400)


def esewa_failure(request):
    return JsonResponse({"error": "Payment failed"}, status=400)
