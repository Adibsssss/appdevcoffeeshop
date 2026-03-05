from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

from brewhaven.mongo import get_collection
from .serializers import ProductSerializer
from .permissions import IsAdminOrReadOnly, IsAdmin


def _to_doc(doc):
    """Convert MongoDB doc to JSON-safe dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


def _get_collection():
    return get_collection("products")


class ProductListCreateView(APIView):
    """
    GET  /api/v1/products/   - public, supports ?category= ?available= ?search= ?featured=
    POST /api/v1/products/   - admin only
    """
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def get(self, request):
        col      = _get_collection()
        query    = {}
        category = request.query_params.get("category")
        search   = request.query_params.get("search")
        featured = request.query_params.get("featured")
        available = request.query_params.get("available")

        if category and category != "all":
            query["category"] = category
        if featured:
            query["featured"] = featured.lower() == "true"

        # Public users only see available products
        is_admin = request.user.is_authenticated and request.user.role == "admin"
        if not is_admin:
            query["available"] = True
        elif available:
            query["available"] = available.lower() == "true"

        if search:
            query["$or"] = [
                {"name":        {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
            ]

        docs = list(col.find(query).sort("name", 1))
        return Response([_to_doc(d) for d in docs])

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        now  = datetime.now(timezone.utc)
        data = serializer.validated_data
        data.update({"created_at": now, "updated_at": now})

        result = _get_collection().insert_one(data)
        data["id"] = str(result.inserted_id)
        data.pop("_id", None)
        return Response(data, status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    """GET / PATCH / DELETE /api/v1/products/<id>/"""
    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdmin()]

    def _get_or_404(self, pk):
        try:
            oid = ObjectId(pk)
        except (InvalidId, Exception):
            return None
        return _get_collection().find_one({"_id": oid})

    def get(self, request, pk):
        doc = self._get_or_404(pk)
        if not doc:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(_to_doc(doc))

    def patch(self, request, pk):
        doc = self._get_or_404(pk)
        if not doc:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        updates = serializer.validated_data
        updates["updated_at"] = datetime.now(timezone.utc)
        _get_collection().update_one({"_id": ObjectId(pk)}, {"$set": updates})

        updated = _get_collection().find_one({"_id": ObjectId(pk)})
        return Response(_to_doc(updated))

    def delete(self, request, pk):
        try:
            oid = ObjectId(pk)
        except Exception:
            return Response({"error": "Invalid ID."}, status=status.HTTP_400_BAD_REQUEST)
        result = _get_collection().delete_one({"_id": oid})
        if result.deleted_count == 0:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ToggleAvailabilityView(APIView):
    """PATCH /api/v1/products/<id>/toggle/"""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            oid = ObjectId(pk)
        except Exception:
            return Response({"error": "Invalid ID."}, status=status.HTTP_400_BAD_REQUEST)

        col = _get_collection()
        doc = col.find_one({"_id": oid})
        if not doc:
            return Response({"error": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

        new_val = not doc.get("available", True)
        col.update_one({"_id": oid}, {"$set": {"available": new_val, "updated_at": datetime.now(timezone.utc)}})
        return Response({
            "id":        pk,
            "available": new_val,
            "message":   f"{'Shown' if new_val else 'Hidden'} on menu.",
        })
