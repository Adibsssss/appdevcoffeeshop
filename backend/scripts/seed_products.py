"""
scripts/seed_products.py
Run with: python scripts/seed_products.py
Seeds 20 products into MongoDB Atlas.
"""
import os
import sys
import django
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "brewhaven.settings")
django.setup()

from brewhaven.mongo import get_collection

PRODUCTS = [
    dict(name="Classic Espresso",            category="espresso", price=120.0, emoji="☕",  badge=None,          available=True,  featured=False, description="Rich, bold single shot of our signature espresso blend."),
    dict(name="Caramel Latte",               category="espresso", price=175.0, emoji="🍮",  badge="bestseller",  available=True,  featured=True,  description="Smooth espresso with steamed milk and house caramel drizzle."),
    dict(name="Vanilla Cappuccino",          category="espresso", price=165.0, emoji="🫧",  badge=None,          available=True,  featured=False, description="Velvety foam, espresso, and a hint of Madagascar vanilla."),
    dict(name="Hazelnut Flat White",         category="espresso", price=180.0, emoji="🌰",  badge="new",         available=True,  featured=True,  description="Double ristretto with silky hazelnut-infused microfoam."),
    dict(name="Iced Brown Sugar Oat Latte",  category="cold",     price=195.0, emoji="🧋",  badge="bestseller",  available=True,  featured=True,  description="Cold brew over oat milk with brown sugar cinnamon foam."),
    dict(name="Cold Brew Original",          category="cold",     price=160.0, emoji="🖤",  badge=None,          available=True,  featured=False, description="Steeped 20 hours. Smooth, bold, zero bitterness."),
    dict(name="Mango Refresher",             category="cold",     price=145.0, emoji="🥭",  badge="seasonal",    available=True,  featured=False, description="Tropical mango with sparkling water and a citrus kick."),
    dict(name="Strawberry Lemonade",         category="cold",     price=140.0, emoji="🍓",  badge=None,          available=True,  featured=False, description="Fresh strawberry puree with house-squeezed lemonade."),
    dict(name="Matcha Latte",                category="tea",      price=185.0, emoji="🍵",  badge="popular",     available=True,  featured=True,  description="Ceremonial grade matcha whisked with steamed oat milk."),
    dict(name="Taro Milk Tea",               category="tea",      price=175.0, emoji="💜",  badge="new",         available=True,  featured=False, description="Creamy taro with jasmine tea and tapioca pearls."),
    dict(name="Hojicha Latte",               category="tea",      price=170.0, emoji="🍂",  badge=None,          available=True,  featured=False, description="Roasted Japanese green tea with warm steamed milk."),
    dict(name="Java Chip Frappe",            category="frappe",   price=210.0, emoji="🍫",  badge="bestseller",  available=True,  featured=True,  description="Blended coffee with chocolate chips and whipped cream."),
    dict(name="Cookies & Cream Frappe",      category="frappe",   price=205.0, emoji="🍪",  badge=None,          available=True,  featured=False, description="Oreo-blended frappe with extra cookie crumble on top."),
    dict(name="Strawberry Cheesecake Frappe",category="frappe",   price=215.0, emoji="🍰",  badge="new",         available=True,  featured=False, description="Strawberry, cream cheese blend topped with graham cracker."),
    dict(name="Butter Croissant",            category="pastry",   price=95.0,  emoji="🥐",  badge=None,          available=True,  featured=False, description="Flaky, golden, freshly baked French-style croissant."),
    dict(name="Cinnamon Roll",               category="pastry",   price=110.0, emoji="🌀",  badge="popular",     available=True,  featured=True,  description="Warm cinnamon swirl drizzled with cream cheese frosting."),
    dict(name="Blueberry Muffin",            category="pastry",   price=90.0,  emoji="🫐",  badge=None,          available=True,  featured=False, description="Bursting with fresh blueberries, lemon zest sugar crust."),
    dict(name="Avocado Toast",               category="snacks",   price=165.0, emoji="🥑",  badge="popular",     available=True,  featured=False, description="Sourdough toast, smashed avocado, chili flakes, sea salt."),
    dict(name="Cheese Panini",               category="snacks",   price=175.0, emoji="🥪",  badge=None,          available=True,  featured=False, description="Pressed sourdough with three-cheese blend and herbs."),
    dict(name="Granola Bowl",                category="snacks",   price=155.0, emoji="🥣",  badge="healthy",     available=True,  featured=False, description="House granola, Greek yogurt, fresh berries, honey drizzle."),
]


def run():
    col = get_collection("products")
    existing = col.count_documents({})
    if existing > 0:
        print(f"Warning: {existing} products already exist. Skipping seed.")
        print("   To re-seed, delete the 'products' collection in Atlas first.")
        return

    now = datetime.now(timezone.utc)
    for p in PRODUCTS:
        p["created_at"] = now
        p["updated_at"] = now

    result = col.insert_many(PRODUCTS)
    print(f"\nSeeded {len(result.inserted_ids)} products into MongoDB Atlas.")
    for p in PRODUCTS:
        print(f"  {p['emoji']} {p['name']}")


if __name__ == "__main__":
    run()
