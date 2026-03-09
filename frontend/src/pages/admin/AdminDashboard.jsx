import { useState, useEffect } from "react";
import { Navigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { reportsAPI, ordersAPI } from "../../utils/api";
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

const STATUS_STYLES = {
  completed: "bg-green-100 text-green-700",
  preparing: "bg-amber-100 text-amber-700",
  pending: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  ready: "bg-purple-100 text-purple-700",
};

function Overview({ onTabChange }) {
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecent] = useState([]);
  const [topProducts, setTop] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sum, orders, top] = await Promise.all([
          reportsAPI.summary(),
          ordersAPI.adminOrders(),
          reportsAPI.topProducts(3),
        ]);
        setSummary(sum);
        const list = Array.isArray(orders) ? orders : orders.results || [];
        setRecent(list.slice(0, 5));
        setTop(Array.isArray(top) ? top : []);
      } catch (e) {
        console.error("Dashboard load error:", e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        <div className="text-5xl animate-float mb-4">☕</div>
        <p className="font-display text-xl text-[#3C1810]">
          Loading dashboard...
        </p>
      </div>
    );

  const stats = summary
    ? [
        {
          label: "Total Products",
          value: summary.total.products,
          color: "from-amber-400 to-orange-500",
        },
        {
          label: "Today's Orders",
          value: summary.today.orders,
          color: "from-blue-400 to-indigo-500",
        },
        {
          label: "Revenue Today",
          value: `₱${Number(summary.today.revenue).toLocaleString()}`,
          color: "from-green-400 to-emerald-500",
        },
        {
          label: "Total Customers",
          value: summary.total.customers,
          color: "from-pink-400 to-rose-500",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} rounded-3xl p-5 text-white animate-pop-in`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-2 py-1 rounded-full">
                Today
              </span>
            </div>
            <p className="font-display text-3xl text-white mb-1">
              {stat.value}
            </p>
            <p className="text-white/80 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F5E6D3]">
          <h3 className="font-display text-xl text-[#3C1810]">Recent Orders</h3>
          <span className="text-sm text-[#D4956A] font-semibold">
            {recentOrders.length} shown
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF8F0] text-left text-xs font-bold text-[#8B4513] uppercase tracking-wider">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 hidden sm:table-cell">Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-[#8B4513]/50"
                  >
                    No orders yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-sm font-bold text-[#D4956A]">
                      {order.reference}
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#3C1810] text-sm">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#3C1810]">
                      ₱{Number(order.total_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          STATUS_STYLES[order.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#8B4513]/60 text-sm hidden sm:table-cell capitalize">
                      {order.payment_method}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
          <h4 className="font-display text-lg text-[#3C1810] mb-4">
            Top Sellers
          </h4>
          {topProducts.length === 0 ? (
            <p className="text-[#8B4513]/40 text-sm">No sales data yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.product_id} className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#F5E6D3] rounded-full flex items-center justify-center text-xs font-bold text-[#8B4513]">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#3C1810] flex-1 truncate">
                    {p.name}
                  </span>
                  <span className="text-sm font-bold text-[#D4956A]">
                    ₱{Number(p.total_revenue).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "overview"
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-[#3C1810]">
              Admin Dashboard
            </h1>
            <p className="text-[#8B4513]/60 mt-1">
              Welcome back, {user.name.split(" ")[0]}!
            </p>
          </div>
          <Link
            to="/menu"
            className="text-sm text-[#D4956A] font-semibold hover:underline"
          >
            View Live Menu →
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4956A] text-white shadow-md"
                  : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <div key={activeTab} className="animate-slide-up">
          {activeTab === "overview" && <Overview onTabChange={setActiveTab} />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "reports" && <AdminReports />}
        </div>
      </div>
    </Layout>
  );
}
