import { useState } from "react";

const DAILY_DATA = [
  { day: "Mon", sales: 3200, orders: 18 },
  { day: "Tue", sales: 4100, orders: 23 },
  { day: "Wed", sales: 3750, orders: 21 },
  { day: "Thu", sales: 5200, orders: 29 },
  { day: "Fri", sales: 6800, orders: 38 },
  { day: "Sat", sales: 7500, orders: 42 },
  { day: "Sun", sales: 5900, orders: 33 },
];

const MONTHLY_DATA = [
  { month: "Jul", sales: 82000 },
  { month: "Aug", sales: 95000 },
  { month: "Sep", sales: 88000 },
  { month: "Oct", sales: 102000 },
  { month: "Nov", sales: 118000 },
  { month: "Dec", sales: 145000 },
  { month: "Jan", sales: 98000 },
];

const TOP_PRODUCTS = [
  { name: "Caramel Latte", emoji: "🍮", orders: 148, revenue: 25900 },
  { name: "Iced Brown Sugar Oat Latte", emoji: "🧋", orders: 134, revenue: 26130 },
  { name: "Java Chip Frappe", emoji: "🍫", orders: 121, revenue: 25410 },
  { name: "Matcha Latte", emoji: "🍵", orders: 109, revenue: 20165 },
  { name: "Cinnamon Roll", emoji: "🌀", orders: 98, revenue: 10780 },
];

function BarChart({ data, valueKey, maxValue, color = "#D4956A" }) {
  const max = maxValue || Math.max(...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const height = Math.max(4, (item[valueKey] / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative w-full flex flex-col items-center">
              <div
                className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
                style={{ height: `${height}%`, backgroundColor: color, minHeight: "4px" }}
              />
            </div>
            <span className="text-xs text-[#8B4513]/60 font-medium">{item.day || item.month}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminReports() {
  const [period, setPeriod] = useState("weekly");

  const totalRevenue = MONTHLY_DATA.reduce((s, d) => s + d.sales, 0);
  const totalOrders = DAILY_DATA.reduce((s, d) => s + d.orders, 0);
  const avgOrder = Math.round(totalRevenue / 7 / (totalOrders / 7));

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {["daily", "weekly", "monthly"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all capitalize ${
              period === p ? "bg-[#D4956A] text-white" : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, icon: "💰", sub: "Last 7 months", color: "text-green-600" },
          { label: "Total Orders", value: totalOrders, icon: "📦", sub: "This week", color: "text-blue-600" },
          { label: "Avg Order Value", value: `₱${avgOrder}`, icon: "📊", sub: "Per transaction", color: "text-purple-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <span className="text-xs text-[#8B4513]/50 font-medium">{card.sub}</span>
            </div>
            <p className={`font-display text-3xl ${card.color} mb-1`}>{card.value}</p>
            <p className="text-sm text-[#8B4513]/60">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Orders */}
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">📦 Orders This Week</h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">Total: {totalOrders} orders</p>
          <BarChart data={DAILY_DATA} valueKey="orders" color="#4A90D9" />
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">💰 Monthly Revenue</h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">Last 7 months</p>
          <BarChart data={MONTHLY_DATA} valueKey="sales" color="#D4956A" />
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-[#3C1810]">🏆 Top Performing Products</h3>
          <span className="text-xs text-[#8B4513]/50 font-medium">By revenue</span>
        </div>
        <div className="space-y-4">
          {TOP_PRODUCTS.map((p, i) => {
            const maxRevenue = TOP_PRODUCTS[0].revenue;
            const pct = Math.round((p.revenue / maxRevenue) * 100);
            const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600", "text-[#8B4513]/50", "text-[#8B4513]/40"];
            return (
              <div key={p.name} className="flex items-center gap-4">
                <span className={`font-display text-xl ${RANK_COLORS[i]} w-6 flex-shrink-0`}>#{i + 1}</span>
                <span className="text-2xl w-8 flex-shrink-0">{p.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-[#3C1810] text-sm truncate">{p.name}</span>
                    <span className="font-bold text-[#D4956A] text-sm ml-2">₱{p.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4956A] to-[#8B4513] rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#8B4513]/50 mt-1">{p.orders} orders</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Export Daily Report", icon: "📄" },
          { label: "Export Weekly Report", icon: "📊" },
          { label: "Export Monthly Report", icon: "📈" },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => alert(`${btn.label} — This would download a PDF/CSV in the full version.`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-[#F5E6D3] hover:border-[#D4956A] text-[#8B4513] font-semibold text-sm transition-all"
          >
            <span>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
