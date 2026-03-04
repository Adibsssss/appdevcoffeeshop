# BrewHaven ☕ — Coffee Shop Online Ordering System

A full-featured coffee shop online ordering and management system built with React + Tailwind CSS.

## 🗂️ File Structure

```
brewhaven/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminProducts.jsx   # CRUD product management
│   │   │   ├── AdminOrders.jsx     # Order tracking & status updates
│   │   │   └── AdminReports.jsx    # Sales charts & reports
│   │   ├── auth/                   # (reserved for auth guards)
│   │   ├── cart/
│   │   │   └── CartDrawer.jsx      # Slide-out cart panel
│   │   ├── layout/
│   │   │   ├── Layout.jsx          # Page wrapper
│   │   │   ├── Navbar.jsx          # Sticky navigation
│   │   │   └── Footer.jsx          # Site footer
│   │   ├── menu/
│   │   │   ├── ProductCard.jsx     # Individual product card
│   │   │   └── CategoryFilter.jsx  # Category tab bar
│   │   └── ui/
│   │       ├── Button.jsx          # Reusable button (multiple variants)
│   │       ├── Input.jsx           # Reusable input field
│   │       ├── Badge.jsx           # Product badge labels
│   │       ├── Modal.jsx           # Reusable modal dialog
│   │       └── Toast.jsx           # Toast notification system
│   ├── context/
│   │   ├── AuthContext.jsx         # Auth state (login/register/logout)
│   │   └── CartContext.jsx         # Cart state (add/remove/update)
│   ├── data/
│   │   └── products.js             # Mock product data (20 items)
│   ├── hooks/                      # (reserved for custom hooks)
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx  # Admin panel with tabs
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx       # Login with demo accounts
│   │   │   └── RegisterPage.jsx    # Registration with pw strength
│   │   └── customer/
│   │       ├── HomePage.jsx        # Landing page
│   │       ├── MenuPage.jsx        # Menu with filter/search
│   │       └── CheckoutPage.jsx    # Checkout with fake payment
│   ├── utils/                      # (reserved for helpers)
│   ├── App.jsx                     # Router + providers
│   └── index.js                    # Entry point
├── tailwind.config.js
├── vercel.json
└── package.json
```

## 🚀 Setup

```bash
npm install
npm start
```

## 🔑 Demo Accounts

| Role     | Email                    | Password   |
|----------|--------------------------|------------|
| Admin    | admin@brewhaven.com      | admin123   |
| Customer | jane@email.com           | password123|

## 🛠️ Tech Stack

- **Frontend**: React 18 + React Router 6
- **Styling**: Tailwind CSS v4
- **Backend**: MongoDB Atlas (connect in `/src/utils/api.js`)
- **Deploy**: Vercel (`vercel.json` included)

## 📡 Connecting to MongoDB Atlas

Create `/src/utils/api.js` and replace mock data/context functions with real API calls to your backend (Express/Node or Next.js API routes).

## 💳 Payment

Currently uses simulated/fake payment flow. To enable real payments, integrate with PayMongo (PH) or Stripe via your backend.
