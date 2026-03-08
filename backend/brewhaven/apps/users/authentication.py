"""
Custom JWT authentication that loads user from MongoDB instead of Django ORM.
Drop-in replacement for JWTAuthentication.
"""
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from bson import ObjectId
from brewhaven.mongo import get_collection


class MongoUser:
    """Lightweight user object returned from MongoDB — mimics Django's request.user."""
    is_authenticated = True

    def __init__(self, doc):
        self.id    = str(doc["_id"])
        self.name  = doc.get("name", "")
        self.email = doc.get("email", "")
        self.role  = doc.get("role", "customer")

    # DRF checks these on permission classes
    @property
    def is_active(self):
        return True

    def __str__(self):
        return f"{self.name} <{self.email}>"


class MongoJWTAuthentication(JWTAuthentication):
    """
    Overrides get_user() to look up the user_id claim in MongoDB
    instead of Django's ORM.
    """
    def get_user(self, validated_token):
        try:
            user_id = validated_token["user_id"]
            oid     = ObjectId(user_id)
        except Exception:
            raise InvalidToken("Token contained invalid user_id.")

        doc = get_collection("users").find_one({"_id": oid})
        if not doc:
            raise AuthenticationFailed("User not found.", code="user_not_found")

        return MongoUser(doc)
