from datetime import datetime, timezone, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response

from brewhaven.mongo import get_collection, get_db
from brewhaven.apps.products.permissions import IsAdmin


def _fmt_day(dt):
    return dt.strftime("%b") + " " + str(dt.day)


def _fmt_week(monday, sunday):
    if monday.month == sunday.month:
        return f"{monday.strftime('%b')} {monday.day}–{sunday.day}"
    return f"{monday.strftime('%b')} {monday.day}–{sunday.strftime('%b')} {sunday.day}"


def _users_col():
    return get_collection("users")


def _orders():
    return get_collection("orders")


def _products():
    return get_collection("products")


# Reusable filter: all orders except cancelled
NOT_CANCELLED = {"status": {"$nin": ["cancelled"]}}


class DashboardSummaryView(APIView):
    """GET /api/v1/reports/summary/"""
    permission_classes = [IsAdmin]

    def get(self, request):
        now         = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end   = now.replace(hour=23, minute=59, second=59, microsecond=999999)

        today_pipeline = [
            {"$match": {
                **NOT_CANCELLED,
                "created_at": {"$gte": today_start, "$lte": today_end},
            }},
            {"$group": {
                "_id":     None,
                "count":   {"$sum": 1},
                "revenue": {"$sum": "$total_amount"},
                "avg":     {"$avg": "$total_amount"},
            }},
        ]
        today_result = list(_orders().aggregate(today_pipeline))
        today_data   = today_result[0] if today_result else {"count": 0, "revenue": 0.0, "avg": 0.0}

        total_pipeline = [
            {"$match": NOT_CANCELLED},
            {"$group": {"_id": None, "revenue": {"$sum": "$total_amount"}}},
        ]
        total_result  = list(_orders().aggregate(total_pipeline))
        total_revenue = total_result[0]["revenue"] if total_result else 0.0

        today_customers_result = _orders().aggregate([
            {"$match": {
                **NOT_CANCELLED,
                "created_at": {"$gte": today_start, "$lte": today_end},
            }},
            {"$group": {"_id": "$customer_id"}},
            {"$count": "total"},
        ])
        today_customers_list = list(today_customers_result)
        today_customers = today_customers_list[0]["total"] if today_customers_list else 0

        return Response({
            "today": {
                "orders":    today_data.get("count",   0),
                "revenue":   round(today_data.get("revenue", 0.0), 2),
                "avg_order": round(today_data.get("avg",     0.0), 2),
                "customers": today_customers,
            },
            "total": {
                "products":   _products().count_documents({}),
                "customers":  _users_col().count_documents({"role": "customer"}),
                "all_orders": _orders().count_documents({}),
                "revenue":    round(total_revenue, 2),
            },
            "pending_orders": _orders().count_documents({"status": {"$in": ["pending", "preparing"]}}),
        })


class DailyReportView(APIView):
    """GET /api/v1/reports/daily/?days=7"""
    permission_classes = [IsAdmin]

    def get(self, request):
        days  = int(request.query_params.get("days", 7))
        since = datetime.now(timezone.utc) - timedelta(days=days)

        pipeline = [
            {"$match": {**NOT_CANCELLED, "created_at": {"$gte": since}}},
            {"$group": {
                "_id": {
                    "year":  {"$year":  "$created_at"},
                    "month": {"$month": "$created_at"},
                    "day":   {"$dayOfMonth": "$created_at"},
                },
                "revenue": {"$sum": "$total_amount"},
                "orders":  {"$sum": 1},
            }},
            {"$sort": {"_id": 1}},
        ]
        results = list(_orders().aggregate(pipeline))
        data = []
        for r in results:
            d = datetime(r["_id"]["year"], r["_id"]["month"], r["_id"]["day"])
            data.append({
                "day":     _fmt_day(d),
                "date":    d.strftime("%Y-%m-%d"),
                "revenue": round(r["revenue"], 2),
                "orders":  r["orders"],
            })
        return Response(data)


class WeeklyReportView(APIView):
    """GET /api/v1/reports/weekly/?weeks=8"""
    permission_classes = [IsAdmin]

    def get(self, request):
        weeks = int(request.query_params.get("weeks", 8))
        since = datetime.now(timezone.utc) - timedelta(weeks=weeks)

        pipeline = [
            {"$match": {**NOT_CANCELLED, "created_at": {"$gte": since}}},
            {"$group": {
                "_id": {
                    "year": {"$isoWeekYear": "$created_at"},
                    "week": {"$isoWeek":     "$created_at"},
                },
                "revenue":   {"$sum": "$total_amount"},
                "orders":    {"$sum": 1},
                "min_date":  {"$min": "$created_at"},
            }},
            {"$sort": {"_id": 1}},
        ]
        results = list(_orders().aggregate(pipeline))

        data = []
        for r in results:
            anchor     = r["min_date"]
            monday     = anchor - timedelta(days=anchor.weekday())
            sunday     = monday + timedelta(days=6)
            week_label = _fmt_week(monday, sunday)
            data.append({
                "week":    week_label,
                "start":   monday.strftime("%Y-%m-%d"),
                "end":     sunday.strftime("%Y-%m-%d"),
                "revenue": round(r["revenue"], 2),
                "orders":  r["orders"],
            })
        return Response(data)


class MonthlyReportView(APIView):
    """GET /api/v1/reports/monthly/?months=12"""
    permission_classes = [IsAdmin]

    def get(self, request):
        months = int(request.query_params.get("months", 12))
        since  = datetime.now(timezone.utc) - timedelta(days=months * 30)

        pipeline = [
            {"$match": {**NOT_CANCELLED, "created_at": {"$gte": since}}},
            {"$group": {
                "_id": {
                    "year":  {"$year":  "$created_at"},
                    "month": {"$month": "$created_at"},
                },
                "revenue": {"$sum": "$total_amount"},
                "orders":  {"$sum": 1},
            }},
            {"$sort": {"_id": 1}},
        ]
        MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        results = list(_orders().aggregate(pipeline))
        return Response([
            {
                "month":   f"{MONTHS[r['_id']['month'] - 1]} {r['_id']['year']}",
                "date":    f"{r['_id']['year']}-{r['_id']['month']:02d}",
                "revenue": round(r["revenue"], 2),
                "orders":  r["orders"],
            }
            for r in results
        ])


class YearlyReportView(APIView):
    """GET /api/v1/reports/yearly/?years=3"""
    permission_classes = [IsAdmin]

    def get(self, request):
        years = int(request.query_params.get("years", 3))
        since = datetime.now(timezone.utc) - timedelta(days=years * 365)

        pipeline = [
            {"$match": {**NOT_CANCELLED, "created_at": {"$gte": since}}},
            {"$group": {
                "_id":     {"year": {"$year": "$created_at"}},
                "revenue": {"$sum": "$total_amount"},
                "orders":  {"$sum": 1},
            }},
            {"$sort": {"_id": 1}},
        ]
        results = list(_orders().aggregate(pipeline))
        return Response([
            {
                "year":    str(r["_id"]["year"]),
                "date":    str(r["_id"]["year"]),
                "revenue": round(r["revenue"], 2),
                "orders":  r["orders"],
            }
            for r in results
        ])


class TopProductsView(APIView):
    """GET /api/v1/reports/top-products/?limit=5&period=monthly"""
    permission_classes = [IsAdmin]

    def get(self, request):
        limit  = int(request.query_params.get("limit", 5))
        period = request.query_params.get("period", "monthly")

        now = datetime.now(timezone.utc)

        if period == "daily":
            since = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "weekly":
            since = now - timedelta(days=now.weekday())
            since = since.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == "yearly":
            since = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        else:  # monthly
            since = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        pipeline = [
            {"$match": {**NOT_CANCELLED, "created_at": {"$gte": since}}},
            {"$unwind": "$items"},
            {"$group": {
                "_id":           "$items.product_id",
                "name":          {"$first": "$items.product_name"},
                "emoji":         {"$first": "$items.product_emoji"},
                "total_orders":  {"$sum": 1},
                "total_qty":     {"$sum": "$items.quantity"},
                "total_revenue": {"$sum": "$items.subtotal"},
            }},
            {"$sort": {"total_revenue": -1}},
            {"$limit": limit},
        ]
        results = list(_orders().aggregate(pipeline))
        return Response([
            {
                "product_id":    r["_id"],
                "name":          r["name"],
                "emoji":         r["emoji"],
                "total_orders":  r["total_orders"],
                "total_qty":     r["total_qty"],
                "total_revenue": round(r["total_revenue"], 2),
            }
            for r in results
        ])