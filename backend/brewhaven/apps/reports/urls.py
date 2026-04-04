from django.urls import path
from .views import (
    DashboardSummaryView,
    DailyReportView,
    WeeklyReportView,
    MonthlyReportView,
    YearlyReportView,
    TopProductsView,
)

urlpatterns = [
    path("summary/",      DashboardSummaryView.as_view(), name="report-summary"),
    path("daily/",        DailyReportView.as_view(),      name="report-daily"),
    path("weekly/",       WeeklyReportView.as_view(),     name="report-weekly"),
    path("monthly/",      MonthlyReportView.as_view(),    name="report-monthly"),
    path("yearly/",       YearlyReportView.as_view(),     name="report-yearly"),
    path("top-products/", TopProductsView.as_view(),      name="report-top-products"),
]