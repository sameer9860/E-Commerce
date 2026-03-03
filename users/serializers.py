from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
  class Meta:
      model = CustomUser
      fields = ["id", "username", "email", "role", "is_approved", "is_staff", "is_superuser"]


class VendorSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        extra_kwargs = {"role": {"default": "vendor"}}


class CustomerSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        extra_kwargs = {"role": {"default": "customer"}}


class _RegisterBaseSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CustomerRegisterSerializer(_RegisterBaseSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        validated_data["role"] = "customer"
        validated_data["is_approved"] = True
        return super().create(validated_data)


class VendorRegisterSerializer(_RegisterBaseSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        validated_data["role"] = "vendor"
        validated_data["is_approved"] = False
        return super().create(validated_data)


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_approved",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email", "first_name", "last_name", "role", "is_approved"]
        read_only_fields = ["id", "username", "role", "is_approved"]
