from django.urls import path, include

urlpatterns = [
    path("api/v1/auth/",     include("brewhaven.apps.users.urls")),
    path("api/v1/products/", include("brewhaven.apps.products.urls")),
    path("api/v1/orders/",   include("brewhaven.apps.orders.urls")),
    path("api/v1/reports/",  include("brewhaven.apps.reports.urls")),
]