# BrewHaven Backend — Django + MongoDB Atlas

## Architecture

- **Django 4.2** — handles auth (JWT), routing, DRF serializers
- **SQLite** — stores only Django internals: User accounts, sessions
- **MongoDB Atlas (PyMongo 4.6)** — stores all app data: products, orders
- **No djongo** — uses PyMongo directly, which is stable and well-maintained

## Setup

### 1. Create virtual environment
```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure .env
```bash
copy .env.example .env      # Windows
cp .env.example .env        # Mac/Linux
```

Edit `.env`:
```
SECRET_KEY=any-long-random-string-here
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/brewhaven?retryWrites=true&w=majority
MONGO_DB_NAME=brewhaven
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Run migrations (creates SQLite for users)
```bash
python manage.py migrate
```

### 5. Create admin account
```bash
python manage.py createsuperuser
# Email: admin@brewhaven.com
# Name: Admin User
# Password: (your choice)
```

### 6. Seed products into MongoDB Atlas
```bash
python scripts/seed_products.py
```

### 7. Start server
```bash
python manage.py runserver
# API: http://localhost:8000/api/v1/
```

## Deploying to Render

1. Push to GitHub
2. New Web Service on Render
3. **Build Command:** `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
4. **Start Command:** `gunicorn brewhaven.wsgi:application`
5. Environment Variables:
   ```
   DJANGO_ENV=production
   SECRET_KEY=<strong random key>
   MONGO_URI=<your Atlas URI>
   MONGO_DB_NAME=brewhaven
   ALLOWED_HOSTS=your-app.onrender.com
   CORS_ALLOWED_ORIGINS=https://brewhaven.vercel.app
   ```

## API Endpoints

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/v1/auth/register/` | None | Register |
| POST | `/api/v1/auth/login/` | None | Login → JWT tokens |
| POST | `/api/v1/auth/logout/` | JWT | Logout |
| GET | `/api/v1/auth/profile/` | JWT | My profile |
| GET | `/api/v1/products/` | None | List products |
| POST | `/api/v1/products/` | Admin | Create product |
| PATCH | `/api/v1/products/<id>/` | Admin | Update product |
| DELETE | `/api/v1/products/<id>/` | Admin | Delete product |
| PATCH | `/api/v1/products/<id>/toggle/` | Admin | Toggle available |
| POST | `/api/v1/orders/` | Customer | Place order |
| GET | `/api/v1/orders/my/` | Customer | My orders |
| GET | `/api/v1/orders/admin/` | Admin | All orders |
| PATCH | `/api/v1/orders/<id>/status/` | Admin | Update status |
| GET | `/api/v1/reports/summary/` | Admin | KPI summary |
| GET | `/api/v1/reports/daily/` | Admin | Daily data |
| GET | `/api/v1/reports/monthly/` | Admin | Monthly data |
| GET | `/api/v1/reports/top-products/` | Admin | Top sellers |
