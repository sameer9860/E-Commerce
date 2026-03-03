from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from .models import Product, Cart, CartItem, Order, Payment
from django.urls import reverse
from unittest.mock import patch


class PaymentFlowTests(TestCase):
    def setUp(self):
        # create a customer and a vendor
        User = get_user_model()
        self.vendor = User.objects.create_user(username="vend", password="pass", role="vendor")
        self.customer = User.objects.create_user(username="cust", password="pass", role="customer")

        # create a product belonging to vendor
        self.product = Product.objects.create(
            name="Widget",
            description="Test item",
            price=10.00,
            stock=5,
            vendor=self.vendor,
        )

        # give the customer a cart with one item
        self.cart = Cart.objects.create(customer=self.customer)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=1)

        self.client = Client()

    def test_esewa_initiation_and_success(self):
        # log in and create an order
        self.client.force_login(self.customer)
        order = Order.objects.create(customer=self.customer, product=self.product, quantity=1)

        # initiate payment - should redirect to sandbox url
        resp = self.client.get(reverse('initiate_esewa_payment', args=[order.id]))
        self.assertEqual(resp.status_code, 302)
        self.assertIn('rc.esewa.com.np/epay/main', resp['Location'])

        # refresh order so it picks up the payment relationship
        order = Order.objects.get(pk=order.pk)
        self.assertIsNotNone(order.payment)

        # simulate eSewa success callback, mock verify request
        success_data = {'amt': '10.00', 'scd': 'epaytest', 'pid': str(order.id), 'rid': 'ABC123'}
        with patch('orders.views.requests.post') as mock_post:
            mock_post.return_value.text = 'Success'
            resp2 = self.client.get(reverse('esewa_success'), data=success_data)

        # re-fetch from database to observe updates
        order = Order.objects.get(pk=order.pk)
        payment = order.payment
        payment.refresh_from_db()

        self.assertEqual(order.status, 'Confirmed')
        self.assertEqual(payment.status, 'Success')
        self.assertEqual(payment.esewa_transaction_id, 'ABC123')

    def test_initiate_requires_ownership(self):
        # create order for another user and attempt to pay
        other = get_user_model().objects.create_user(username="other", password="pass", role="customer")
        order = Order.objects.create(customer=other, product=self.product, quantity=1)
        self.client.force_login(self.customer)
        resp = self.client.get(reverse('initiate_esewa_payment', args=[order.id]))
        self.assertEqual(resp.status_code, 404)
