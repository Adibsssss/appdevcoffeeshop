from django.urls import path
from .views import (
    PlaceOrderView,
    MyOrdersView,
    AdminOrderListView,
    OrderDetailView,
    UpdateOrderStatusView,
)

urlpatterns = [
    path("",                   PlaceOrderView.as_view(),       name="order-place"),
    path("my/",                MyOrdersView.as_view(),         name="order-my-list"),
    path("admin/",             AdminOrderListView.as_view(),   name="order-admin-list"),
    path("<str:pk>/",          OrderDetailView.as_view(),      name="order-detail"),
    path("<str:pk>/status/",   UpdateOrderStatusView.as_view(), name="order-status-update"),
]
