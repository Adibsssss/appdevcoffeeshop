# BrewHaven Backend — Django + MongoDB Atlas (100% MongoDB)

## Architecture

- **Django 4.2 + DRF** — routing, serializers, JWT middleware only
- **MongoDB Atlas (PyMongo 4.6)** — ALL data: users, products, orders
- **bcrypt** — password hashing
- **No SQLite. No Django ORM. No migrations. Ever.**

## Collections in MongoDB Atlas

| Collection | Contents |
|---|---|
| `users` | name, email, bcrypt password hash, role |
| `products` | name, category, price, emoji, badge, availability |
| `orders` | reference, customer info, items snapshot, status, payment |

## Setup

```bash
# 1. Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# 2. Install
pip install -r requirements.txt

# 3. Configure
copy .env.example .env       # Windows
cp .env.example .env         # Mac/Linux
# Fill in MONGO_URI and SECRET_KEY

# 4. Seed (creates products + admin account interactively)
python scripts/seed_products.py

# 5. Run
python manage.py runserver
```

**No `python manage.py migrate` needed — ever.**

## .env values

```
SECRET_KEY=any-long-random-string
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/brewhaven?retryWrites=true&w=majority
MONGO_DB_NAME=brewhaven
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Render Deployment

- **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command:** `gunicorn brewhaven.wsgi:application`
- **Environment Variables:** DJANGO_ENV=production, SECRET_KEY, MONGO_URI, MONGO_DB_NAME, ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS
