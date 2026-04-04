# BrewHaven ☕ — Full-Stack Coffee Shop Ordering System

A full-featured online ordering and management system for a coffee shop, built with **React + Vite** on the frontend and **Django + MongoDB Atlas** on the backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Authentication](#authentication)
- [Admin Dashboard](#admin-dashboard)
- [Deployment](#deployment)
  - [Backend — Render](#backend--render)
  - [Frontend — Vercel](#frontend--vercel)
- [Known Issues & Notes](#known-issues--notes)

---

## Overview

BrewHaven is a coffee shop ordering platform where customers can browse a menu, add items to a cart, and place orders online. Admins have a separate dashboard to manage products, track and update order statuses, and view sales reports with CSV export.

All data lives exclusively in **MongoDB Atlas** — no SQL database is used anywhere in the project.

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| React Router | 6 | Client-side routing |
| Tailwind CSS | 4 | Styling |
| Vite | 5 | Build tool & dev server |
| Lucide React | 0.263 | Icons |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Django | 4.2 | Web framework |
| Django REST Framework | 3.14 | API layer |
| PyMongo | 4.6 | MongoDB driver |
| MongoDB Atlas | — | Primary database |
| SimpleJWT | 5.3 | JWT authentication |
| bcrypt | 4.1 | Password hashing |
| django-cors-headers | 4.3 | CORS handling |
| Gunicorn | 21.2 | Production WSGI server |
| WhiteNoise | 6.6 | Static file serving |

---

## Project Structure

```
appdevcoffeeshop/
├── backend/
│   ├── brewhaven/
│   │   ├── apps/
│   │   │   ├── orders/         # Order placement & management
│   │   │   │   ├── models.py   # Schema docs (PyMongo, no ORM)
│   │   │   │   ├── serializers.py
│   │   │   │   ├── views.py
│   │   │   │   └── urls.py
│   │   │   ├── products/       # Product CRUD & availability toggle
│   │   │   │   ├── models.py
│   │   │   │   ├── serializers.py
│   │   │   │   ├── views.py
│   │   │   │   ├── permissions.py
│   │   │   │   └── urls.py
│   │   │   ├── reports/        # Sales analytics endpoints
│   │   │   │   ├── views.py
│   │   │   │   └── urls.py
│   │   │   └── users/          # Auth: register, login, JWT
│   │   │       ├── authentication.py  # Custom MongoJWTAuthentication
│   │   │       ├── serializers.py
│   │   │       ├── views.py
│   │   │       └── urls.py
│   │   ├── settings/
│   │   │   ├── base.py         # Shared settings
│   │   │   ├── development.py  # Local overrides
│   │   │   └── production.py   # Production overrides
│   │   ├── mongo.py            # PyMongo singleton client
│   │   ├── urls.py             # Root URL config
│   │   └── wsgi.py
│   ├── scripts/
│   │   └── seed_products.py    # Seeds 20 products + creates admin account
│   ├── manage.py
│   ├── requirements.txt
│   └── render-build.sh
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   ├── AdminProducts.jsx     # Product CRUD table
    │   │   │   ├── AdminOrders.jsx       # Order list + status updates
    │   │   │   ├── AdminReports.jsx      # Charts + CSV export
    │   │   │   └── AdminCreateOrder.jsx  # Counter/walk-in order creation
    │   │   ├── cart/
    │   │   │   └── CartDrawer.jsx        # Slide-out cart panel
    │   │   ├── layout/
    │   │   │   ├── Layout.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Footer.jsx
    │   │   ├── menu/
    │   │   │   ├── ProductCard.jsx
    │   │   │   └── CategoryFilter.jsx
    │   │   └── ui/
    │   │       ├── Button.jsx
    │   │       ├── Input.jsx
    │   │       ├── Badge.jsx
    │   │       ├── Modal.jsx
    │   │       └── Toast.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Login, register, logout, token storage
    │   │   └── CartContext.jsx   # Cart state management
    │   ├── data/
    │   │   └── products.js       # Category list + badge style definitions
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.jsx    # Tabbed admin panel
    │   │   ├── auth/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── RegisterPage.jsx
    │   │   └── customer/
    │   │       ├── HomePage.jsx          # Landing page with featured items
    │   │       ├── MenuPage.jsx          # Full menu with search + filter
    │   │       └── CheckoutPage.jsx      # Checkout + simulated payment
    │   ├── utils/
    │   │   └── api.js            # Central API client with auto JWT refresh
    │   ├── App.jsx               # Router + context providers
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── vercel.json
```

---

## Features

### Customer
- Browse the full menu filtered by category (Espresso, Cold Drinks, Tea & Matcha, Frappes, Pastries, Snacks)
- Search products by name or description
- Add items to a persistent cart (slide-out drawer)
- Register and log in with JWT-based authentication
- Checkout with simulated payment methods: Credit/Debit Card, GCash, Maya, Cash on Pickup
- View an order confirmation with a unique reference number (e.g. `BH-A3F2C1`)

### Admin
- **Overview tab** — at-a-glance stats: total products, today's orders, today's revenue, total customers, pending orders, recent order table, top-selling products
- **Products tab** — full CRUD (add, edit, delete), availability toggle, badge management, paginated table with search and category filter
- **Orders tab** — view all orders, filter by status, update order status inline or from a detail panel
- **Reports tab** — daily / weekly / monthly revenue and order count line charts, top products by revenue, one-click CSV export for daily, weekly, and monthly reports
- **Create Order tab** — walk-in / counter order creation with product browser and cart

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and **npm** 8+
- A **MongoDB Atlas** cluster (free tier works fine)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/appdevcoffeeshop.git
cd appdevcoffeeshop
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env   # macOS/Linux
copy .env.example .env  # Windows
```

Edit `.env` — see [Environment Variables](#environment-variables) below.

```bash
# Seed the database (products + admin account — interactive)
python scripts/seed_products.py
```

> ⚠️ **No `python manage.py migrate` needed.** All data lives in MongoDB. The only reason Django migrations exist at all is because `django.contrib.auth` is included as a dependency of SimpleJWT — it is never actually used.

### 3. Frontend Setup

```bash
cd ../frontend

npm install

# Copy environment file
cp .env.example .env   # or create manually — see below
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SECRET_KEY` | ✅ | Django secret key — any long random string |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/brewhaven?retryWrites=true&w=majority` |
| `MONGO_DB_NAME` | ✅ | Database name, e.g. `brewhaven` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Comma-separated list of allowed frontend origins, e.g. `http://localhost:5173` |
| `DJANGO_ENV` | ❌ | Set to `production` on Render; defaults to `development` |
| `ALLOWED_HOSTS` | ❌ | Comma-separated hostnames for production |
| `ACCESS_TOKEN_LIFETIME_MINUTES` | ❌ | JWT access token lifetime in minutes (default: `60`) |
| `REFRESH_TOKEN_LIFETIME_DAYS` | ❌ | JWT refresh token lifetime in days (default: `7`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the Django API, e.g. `http://localhost:8000/api/v1` |

---

## Database Seeding

The seed script does two things interactively:

```bash
cd backend
python scripts/seed_products.py
```

1. **Seeds 20 products** across all categories into the `products` collection (skipped if products already exist).
2. **Creates an admin account** — prompts you for name, email, and password.

Default values if you press Enter:
- Name: `Admin User`
- Email: `admin@brewhaven.com`
- Password: `admin123`

> The script is safe to re-run — it skips seeding if data already exists.

---

## Running the Application

### Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
# API available at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm run dev
# App available at http://localhost:5173
```

Open `http://localhost:5173` in your browser. Log in with your seeded admin credentials or register a new customer account.

---

## API Reference

All endpoints are prefixed with `/api/v1/`.

### Auth — `/api/v1/auth/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `register/` | Public | Create a new customer account |
| POST | `login/` | Public | Authenticate and receive JWT tokens |
| POST | `logout/` | Required | Invalidate session (client clears tokens) |
| POST | `refresh/` | Public | Exchange refresh token for new access token |
| GET | `profile/` | Required | Get current user profile |

### Products — `/api/v1/products/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List available products. Supports `?category=`, `?search=`, `?featured=`, `?available=` |
| POST | `/` | Admin | Create a new product |
| GET | `<id>/` | Public | Get a single product |
| PATCH | `<id>/` | Admin | Update a product |
| DELETE | `<id>/` | Admin | Delete a product |
| PATCH | `<id>/toggle/` | Admin | Toggle product availability on/off |

### Orders — `/api/v1/orders/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Required | Place a new order |
| GET | `my/` | Required | List the current user's orders |
| GET | `admin/` | Admin | List all orders. Supports `?status=` filter |
| GET | `<id>/` | Required | Get a single order |
| PATCH | `<id>/status/` | Admin | Update order status |

**Order statuses:** `pending` → `preparing` → `ready` → `completed` / `cancelled`

**Payment methods:** `card`, `gcash`, `maya`, `cash`

### Reports — `/api/v1/reports/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `summary/` | Admin | Dashboard KPIs: today's orders, revenue, customer count, totals |
| GET | `daily/?days=7` | Admin | Daily revenue + order count for the last N days |
| GET | `weekly/?weeks=4` | Admin | Weekly aggregation |
| GET | `monthly/?months=12` | Admin | Monthly aggregation |
| GET | `top-products/?limit=5` | Admin | Top products by revenue (current month) |

---

## Authentication

The app uses **stateless JWT authentication** with access and refresh tokens.

- Tokens are stored in `sessionStorage` (cleared when the browser tab closes).
- The API client in `frontend/src/utils/api.js` automatically attaches the `Authorization: Bearer <token>` header to every request.
- On a `401` response, the client attempts a silent token refresh using the stored refresh token. If that also fails, the user is redirected to `/login`.
- The backend uses a custom `MongoJWTAuthentication` class that looks up the `user_id` claim directly in MongoDB instead of using Django's ORM.

---

## Admin Dashboard

Navigate to `/admin` after logging in with an admin account. The dashboard has five tabs:

| Tab | Description |
|---|---|
| **Overview** | Summary stats, recent orders table, top-selling products |
| **Products** | Paginated product table with search, filter, add, edit, delete, and availability toggle |
| **Orders** | Full order list with status filter, inline status update dropdown, and a detail side panel |
| **Reports** | Line charts for orders and revenue (daily/weekly/monthly), top products bar chart, CSV export |
| **Create Order** | POS-style product browser with a cart panel for placing walk-in counter orders |

---

## Deployment

### Backend — Render

1. Push the `backend/` directory to a GitHub repo (or the whole monorepo).
2. Create a new **Web Service** on [render.com](https://render.com).
3. Set the following:
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn brewhaven.wsgi:application`
4. Add all required environment variables in the Render dashboard (see [Environment Variables](#environment-variables)):
   - `DJANGO_ENV=production`
   - `SECRET_KEY`
   - `MONGO_URI`
   - `MONGO_DB_NAME`
   - `ALLOWED_HOSTS` — your Render subdomain, e.g. `brewhaven-api.onrender.com`
   - `CORS_ALLOWED_ORIGINS` — your Vercel frontend URL

### Frontend — Vercel

1. Import the `frontend/` directory into [vercel.com](https://vercel.com).
2. Vercel auto-detects Vite. The `vercel.json` already configures SPA rewrites.
3. Add the environment variable:
   - `VITE_API_URL=https://your-render-service.onrender.com/api/v1`
4. Deploy — Vercel handles the rest.

---

## Known Issues & Notes

- **Simulated payments only.** The checkout flow accepts card, GCash, Maya, and cash inputs but does not process real transactions. To enable real payments, integrate [PayMongo](https://www.paymongo.com/) (Philippines) or Stripe via the backend.
- **Product images.** `ProductCard.jsx` maps product names to image paths under `/images/products/`. These images are not included in the repository. Place your own `.jpg` files in `frontend/public/images/products/` using the filenames defined in the `PRODUCT_IMAGES` map, or the cards will display a placeholder icon.
- **Sessions are tab-scoped.** Tokens are kept in `sessionStorage`, so users are logged out when all tabs are closed. Change to `localStorage` in `frontend/src/utils/api.js` if you want persistent sessions.
- **No email verification.** Registration is open and immediate. Add an email verification step before deploying to a real production environment.
- **Django migrations.** Running `python manage.py migrate` is harmless but creates an unused SQLite `:memory:` database. It is not required and does not affect MongoDB data.
