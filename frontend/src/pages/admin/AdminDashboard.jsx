import { useState } from "react";
import { Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PRODUCTS } from "../../data/products";
import Layout from "../../components/layout/Layout";
import AdminProducts from "../../components/admin/AdminProducts";
import AdminOrders from "../../components/admin/AdminOrders";
import AdminReports from "../../components/admin/AdminReports";

const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "products", label: "Products", icon: "☕" },
  { id: "orders", label: "Orders", icon: "📦" },
  { id: "reports", label: "Reports", icon: "📈" },
];

const STATS = [
  { label: "Total Products", value: PRODUCTS.length, icon: "☕", color: "from-amber-400 to-orange-500" },
  { label: "Today's Orders", value: "24", icon: "📦", color: "from-blue-400 to-indigo-500" },
  { label: "Revenue Today", value: "₱4,850", icon: "💰", color: "from-green-400 to-emerald-500" },
  { label: "Active Users", value: "132", icon: "👥", color: "from-pink-400 to-rose-500" },
];

const RECENT_ORDERS = [
  { id: "BH-001", customer: "Maria Santos", items: "Caramel Latte, Croissant", total: 270, status: "completed", time: "9:30 AM" },
  { id: "BH-002", customer: "Juan Dela Cruz", items: "Iced Brown Sugar Oat Latte", total: 195, status: "preparing", time: "9:45 AM" },
  { id: "BH-003", customer: "Ana Reyes", items: "Matcha Latte x2, Cinnamon Roll", total: 480, status: "pending", time: "10:00 AM" },
  { id: "BH-004", customer: "Carlos Mendoza", items: "Java Chip Frappe, Muffin", total: 300, status: "completed", time: "10:15 AM" },
  { id: "BH-005", customer: "Grace Villanueva", items: "Cold Brew, Avocado Toast", total: 325, status: "preparing", time: "10:30 AM" },
];

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  preparing: "bg-amber-100 text-amber-700",
  pending: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

function Overview() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-3xl p-5 text-white animate-pop-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">Today</span>
            </div>
            <p className="font-display text-3xl text-white mb-1">{stat.value}</p>
            <p className="text-white/80 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F5E6D3]">
          <h3 className="font-display text-xl text-[#3C1810]">📦 Recent Orders</h3>
          <span className="text-sm text-[#D4956A] font-semibold">{RECENT_ORDERS.length} orders today</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF8F0] text-left text-xs font-bold text-[#8B4513] uppercase tracking-wider">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 hidden md:table-cell">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 hidden sm:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((order, i) => (
                <tr key={order.id} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold text-[#D4956A]">{order.id}</td>
                  <td className="px-6 py-4 font-semibold text-[#3C1810] text-sm">{order.customer}</td>
                  <td className="px-6 py-4 text-[#8B4513]/70 text-xs hidden md:table-cell max-w-xs truncate">{order.items}</td>
                  <td className="px-6 py-4 font-bold text-[#3C1810]">₱{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#8B4513]/60 text-sm hidden sm:table-cell">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
          <h4 className="font-display text-lg text-[#3C1810] mb-4">🏆 Top Sellers</h4>
          <ul className="space-y-3">
            {PRODUCTS.filter((p) => p.badge === "bestseller").slice(0, 3).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-7 h-7 bg-[#F5E6D3] rounded-full flex items-center justify-center text-xs font-bold text-[#8B4513]">
                  {i + 1}
                </span>
                <span className="text-xl">{p.emoji}</span>
                <span className="text-sm font-semibold text-[#3C1810] flex-1 truncate">{p.name}</span>
                <span className="text-sm font-bold text-[#D4956A]">₱{p.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
          <h4 className="font-display text-lg text-[#3C1810] mb-4">📂 By Category</h4>
          <ul className="space-y-2">
            {["espresso", "cold", "tea", "frappe", "pastry"].map((cat) => {
              const count = PRODUCTS.filter((p) => p.category === cat).length;
              const pct = Math.round((count / PRODUCTS.length) * 100);
              return (
                <li key={cat}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium text-[#3C1810]">{cat}</span>
                    <span className="text-[#8B4513]/60">{count} items</span>
                  </div>
                  <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4956A] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
          <h4 className="font-display text-lg text-[#3C1810] mb-4">⚡ Quick Actions</h4>
          <div className="space-y-2">
            {[
              { label: "Add New Product", icon: "➕", color: "bg-green-50 text-green-700 hover:bg-green-100" },
              { label: "View All Orders", icon: "📦", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Generate Report", icon: "📈", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { label: "View Menu", icon: "🍽️", color: "bg-amber-50 text-amber-700 hover:bg-amber-100", href: "/menu" },
            ].map((action) => (
              <button
                key={action.label}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl font-semibold text-sm transition-all ${action.color}`}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-[#3C1810]">
              👑 Admin Dashboard
            </h1>
            <p className="text-[#8B4513]/60 mt-1">Welcome back, {user.name.split(" ")[0]}!</p>
          </div>
          <Link to="/menu" className="text-sm text-[#D4956A] font-semibold hover:underline">
            View Live Menu →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? "bg-[#D4956A] text-white shadow-md"
                  : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div key={activeTab} className="animate-slide-up">
          {activeTab === "overview" && <Overview />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "reports" && <AdminReports />}
        </div>
      </div>
    </Layout>
  );
}
