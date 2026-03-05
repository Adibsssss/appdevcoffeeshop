"""
brewhaven/urls.py — Root URL configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),

    # API v1
    path("api/v1/auth/",     include("brewhaven.apps.users.urls")),
    path("api/v1/products/", include("brewhaven.apps.products.urls")),
    path("api/v1/orders/",   include("brewhaven.apps.orders.urls")),
    path("api/v1/reports/",  include("brewhaven.apps.reports.urls")),
]
