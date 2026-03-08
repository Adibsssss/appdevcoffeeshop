import bcrypt
from datetime import datetime, timezone
from bson import ObjectId

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from brewhaven.mongo import get_collection
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


def _users():
    return get_collection("users")


def _to_doc(doc):
    doc["id"] = str(doc.pop("_id"))
    return doc


def _get_tokens(user_id: str, role: str):
    """Generate JWT access + refresh tokens with user_id and role in payload."""
    token = RefreshToken()
    token["user_id"] = user_id
    token["role"]    = role
    return {
        "access":  str(token.access_token),
        "refresh": str(token),
    }


class RegisterView(APIView):
    """POST /api/v1/auth/register/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data  = serializer.validated_data
        email = data["email"].lower().strip()

        if _users().find_one({"email": email}):
            return Response({"email": "This email is already registered."}, status=status.HTTP_400_BAD_REQUEST)

        hashed = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
        now    = datetime.now(timezone.utc)

        doc = {
            "name":       data["name"].strip(),
            "email":      email,
            "password":   hashed,
            "role":       "customer",
            "created_at": now,
        }
        result  = _users().insert_one(doc)
        user_id = str(result.inserted_id)
        tokens  = _get_tokens(user_id, "customer")

        return Response({
            "user":    {"id": user_id, "name": doc["name"], "email": email, "role": "customer"},
            "tokens":  tokens,
            "message": "Account created successfully.",
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/v1/auth/login/"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data  = serializer.validated_data
        email = data["email"].lower().strip()

        doc = _users().find_one({"email": email})
        if not doc:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        if not bcrypt.checkpw(data["password"].encode(), doc["password"].encode()):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        user_id = str(doc["_id"])
        tokens  = _get_tokens(user_id, doc["role"])

        return Response({
            "user":   {"id": user_id, "name": doc["name"], "email": doc["email"], "role": doc["role"]},
            "tokens": tokens,
        })


class LogoutView(APIView):
    """POST /api/v1/auth/logout/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # SimpleJWT stateless — just return success; frontend clears tokens
        return Response({"message": "Logged out successfully."})


class ProfileView(APIView):
    """GET /api/v1/auth/profile/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        doc = _users().find_one({"_id": ObjectId(request.user.id)})
        if not doc:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        doc = _to_doc(doc)
        doc.pop("password", None)
        return Response(doc)


class TokenRefreshView(APIView):
    """POST /api/v1/auth/refresh/"""
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token  = RefreshToken(refresh_token)
            return Response({"access": str(token.access_token)})
        except Exception:
            return Response({"error": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)
