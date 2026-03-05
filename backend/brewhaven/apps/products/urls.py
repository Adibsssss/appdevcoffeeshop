from django.urls import path
from .views import ProductListCreateView, ProductDetailView, ToggleAvailabilityView

urlpatterns = [
    path("",                 ProductListCreateView.as_view(), name="product-list-create"),
    path("<str:pk>/",        ProductDetailView.as_view(),     name="product-detail"),
    path("<str:pk>/toggle/", ToggleAvailabilityView.as_view(), name="product-toggle"),
]
