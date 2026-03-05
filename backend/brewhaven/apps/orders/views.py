import uuid
from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from brewhaven.mongo import get_collection
from brewhaven.apps.products.permissions import IsAdmin
from .serializers import PlaceOrderSerializer


def _ref():
    return "BH-" + uuid.uuid4().hex[:6].upper()


def _to_doc(doc):
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


class PlaceOrderView(APIView):
    """POST /api/v1/orders/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data           = serializer.validated_data
        products_col   = get_collection("products")
        items_out      = []
        total          = 0.0

        for item in data["items"]:
            try:
                oid = ObjectId(item["product_id"])
            except (InvalidId, Exception):
                return Response(
                    {"error": f"Invalid product ID: {item['product_id']}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            product = products_col.find_one({"_id": oid, "available": True})
            if not product:
                return Response(
                    {"error": f"Product {item['product_id']} not found or unavailable."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            subtotal = float(product["price"]) * item["quantity"]
            total   += subtotal
            items_out.append({
                "product_id":    str(product["_id"]),
                "product_name":  product["name"],
                "product_emoji": product.get("emoji", "☕"),
                "unit_price":    float(product["price"]),
                "quantity":      item["quantity"],
                "subtotal":      subtotal,
            })

        now   = datetime.now(timezone.utc)
        order = {
            "reference":      _ref(),
            "customer_id":    request.user.id,
            "customer_name":  request.user.name,
            "customer_email": request.user.email,
            "status":         "pending",
            "payment_method": data["payment_method"],
            "total_amount":   round(total, 2),
            "notes":          data.get("notes", ""),
            "items":          items_out,
            "created_at":     now,
            "updated_at":     now,
        }

        result = get_collection("orders").insert_one(order)
        order["id"] = str(result.inserted_id)
        order.pop("_id", None)

        return Response(
            {"order": order, "message": f"Order {order['reference']} placed successfully!"},
            status=status.HTTP_201_CREATED,
        )


class MyOrdersView(APIView):
    """GET /api/v1/orders/my/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        docs = list(
            get_collection("orders")
            .find({"customer_id": request.user.id})
            .sort("created_at", -1)
        )
        return Response([_to_doc(d) for d in docs])


class AdminOrderListView(APIView):
    """GET /api/v1/orders/admin/?status=pending"""
    permission_classes = [IsAdmin]

    def get(self, request):
        query  = {}
        fstatus = request.query_params.get("status")
        if fstatus:
            query["status"] = fstatus
        docs = list(get_collection("orders").find(query).sort("created_at", -1))
        return Response([_to_doc(d) for d in docs])


class OrderDetailView(APIView):
    """GET /api/v1/orders/<id>/"""
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            oid = ObjectId(pk)
        except Exception:
            return Response({"error": "Invalid order ID."}, status=status.HTTP_400_BAD_REQUEST)

        query = {"_id": oid}
        if request.user.role != "admin":
            query["customer_id"] = request.user.id

        doc = get_collection("orders").find_one(query)
        if not doc:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(_to_doc(doc))


class UpdateOrderStatusView(APIView):
    """PATCH /api/v1/orders/<id>/status/"""
    permission_classes = [IsAdmin]

    VALID_STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"]

    def patch(self, request, pk):
        new_status = request.data.get("status")
        if new_status not in self.VALID_STATUSES:
            return Response(
                {"error": f"Invalid status. Choose from: {', '.join(self.VALID_STATUSES)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            oid = ObjectId(pk)
        except Exception:
            return Response({"error": "Invalid order ID."}, status=status.HTTP_400_BAD_REQUEST)

        result = get_collection("orders").update_one(
            {"_id": oid},
            {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}},
        )
        if result.matched_count == 0:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"id": pk, "status": new_status})
