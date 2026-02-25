from rest_framework import serializers
from .models import CustomUser

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "role"]
        extra_kwargs = {"role": {"default": "vendor"}}

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "role"]
        extra_kwargs = {"role": {"default": "customer"}}
