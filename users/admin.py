from django.contrib import admin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "is_approved", "is_staff", "is_active")
    list_filter = ("role", "is_approved", "is_staff", "is_active")
    search_fields = ("username", "email")