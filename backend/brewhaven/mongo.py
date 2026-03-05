"""
brewhaven/mongo.py
Singleton PyMongo client. Import `get_db()` in any view.
"""
from pymongo import MongoClient
from django.conf import settings

_client = None
_db     = None


def get_db():
    """Returns the MongoDB database instance (lazy singleton)."""
    global _client, _db
    if _db is None:
        _client = MongoClient(settings.MONGO_URI)
        _db     = _client[settings.MONGO_DB_NAME]
    return _db


def get_collection(name: str):
    """Shortcut: get_collection('products') → db.products"""
    return get_db()[name]
