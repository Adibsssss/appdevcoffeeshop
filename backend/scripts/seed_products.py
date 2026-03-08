"""
scripts/seed_products.py
Seeds MongoDB Atlas with 20 products and creates an admin account.
Run: python scripts/seed_products.py
"""
import os, sys, django
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "brewhaven.settings")
django.setup()

import bcrypt
from brewhaven.mongo import get_collection

PRODUCTS = [
    dict(name="Classic Espresso",             category="espresso", price=120.0, emoji="☕",  badge=None,         available=True,  featured=False, description="Rich, bold single shot of our signature espresso blend."),
    dict(name="Caramel Latte",                category="espresso", price=175.0, emoji="🍮",  badge="bestseller", available=True,  featured=True,  description="Smooth espresso with steamed milk and house caramel drizzle."),
    dict(name="Vanilla Cappuccino",           category="espresso", price=165.0, emoji="🫧",  badge=None,         available=True,  featured=False, description="Velvety foam, espresso, and a hint of Madagascar vanilla."),
    dict(name="Hazelnut Flat White",          category="espresso", price=180.0, emoji="🌰",  badge="new",        available=True,  featured=True,  description="Double ristretto with silky hazelnut-infused microfoam."),
    dict(name="Iced Brown Sugar Oat Latte",   category="cold",     price=195.0, emoji="🧋",  badge="bestseller", available=True,  featured=True,  description="Cold brew over oat milk with brown sugar cinnamon foam."),
    dict(name="Cold Brew Original",           category="cold",     price=160.0, emoji="🖤",  badge=None,         available=True,  featured=False, description="Steeped 20 hours. Smooth, bold, zero bitterness."),
    dict(name="Mango Refresher",              category="cold",     price=145.0, emoji="🥭",  badge="seasonal",   available=True,  featured=False, description="Tropical mango with sparkling water and a citrus kick."),
    dict(name="Strawberry Lemonade",          category="cold",     price=140.0, emoji="🍓",  badge=None,         available=True,  featured=False, description="Fresh strawberry puree with house-squeezed lemonade."),
    dict(name="Matcha Latte",                 category="tea",      price=185.0, emoji="🍵",  badge="popular",    available=True,  featured=True,  description="Ceremonial grade matcha whisked with steamed oat milk."),
    dict(name="Taro Milk Tea",                category="tea",      price=175.0, emoji="💜",  badge="new",        available=True,  featured=False, description="Creamy taro with jasmine tea and tapioca pearls."),
    dict(name="Hojicha Latte",                category="tea",      price=170.0, emoji="🍂",  badge=None,         available=True,  featured=False, description="Roasted Japanese green tea with warm steamed milk."),
    dict(name="Java Chip Frappe",             category="frappe",   price=210.0, emoji="🍫",  badge="bestseller", available=True,  featured=True,  description="Blended coffee with chocolate chips and whipped cream."),
    dict(name="Cookies & Cream Frappe",       category="frappe",   price=205.0, emoji="🍪",  badge=None,         available=True,  featured=False, description="Oreo-blended frappe with extra cookie crumble on top."),
    dict(name="Strawberry Cheesecake Frappe", category="frappe",   price=215.0, emoji="🍰",  badge="new",        available=True,  featured=False, description="Strawberry, cream cheese blend topped with graham cracker."),
    dict(name="Butter Croissant",             category="pastry",   price=95.0,  emoji="🥐",  badge=None,         available=True,  featured=False, description="Flaky, golden, freshly baked French-style croissant."),
    dict(name="Cinnamon Roll",                category="pastry",   price=110.0, emoji="🌀",  badge="popular",    available=True,  featured=True,  description="Warm cinnamon swirl drizzled with cream cheese frosting."),
    dict(name="Blueberry Muffin",             category="pastry",   price=90.0,  emoji="🫐",  badge=None,         available=True,  featured=False, description="Bursting with fresh blueberries, lemon zest sugar crust."),
    dict(name="Avocado Toast",                category="snacks",   price=165.0, emoji="🥑",  badge="popular",    available=True,  featured=False, description="Sourdough toast, smashed avocado, chili flakes, sea salt."),
    dict(name="Cheese Panini",                category="snacks",   price=175.0, emoji="🥪",  badge=None,         available=True,  featured=False, description="Pressed sourdough with three-cheese blend and herbs."),
    dict(name="Granola Bowl",                 category="snacks",   price=155.0, emoji="🥣",  badge="healthy",    available=True,  featured=False, description="House granola, Greek yogurt, fresh berries, honey drizzle."),
]


def seed_products():
    col = get_collection("products")
    if col.count_documents({}) > 0:
        print(f"  Products already seeded ({col.count_documents({})} found). Skipping.")
        return
    now = datetime.now(timezone.utc)
    for p in PRODUCTS:
        p["created_at"] = now
        p["updated_at"] = now
    col.insert_many(PRODUCTS)
    print(f"  Seeded {len(PRODUCTS)} products.")


def seed_admin():
    users = get_collection("users")

    # Prompt for admin credentials
    print("\n--- Create Admin Account ---")
    name     = input("Admin name (default: Admin User): ").strip() or "Admin User"
    email    = input("Admin email (default: admin@brewhaven.com): ").strip() or "admin@brewhaven.com"
    password = input("Admin password (default: admin123): ").strip() or "admin123"

    if users.find_one({"email": email.lower()}):
        print(f"  Admin {email} already exists. Skipping.")
        return

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users.insert_one({
        "name":       name,
        "email":      email.lower(),
        "password":   hashed,
        "role":       "admin",
        "created_at": datetime.now(timezone.utc),
    })
    print(f"  Admin account created: {email}")


if __name__ == "__main__":
    print("\nSeeding MongoDB Atlas...")
    print("\n[1/2] Products:")
    seed_products()
    print("\n[2/2] Admin User:")
    seed_admin()
    print("\nDone! You can now run: python manage.py runserver")
