from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    image_display = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"
        extra_kwargs = {"vendor": {"read_only": True}}

    def get_image_display(self, obj):
        """Return the absolute URL for the uploaded image, or image_url fallback."""
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return obj.image_url or None
