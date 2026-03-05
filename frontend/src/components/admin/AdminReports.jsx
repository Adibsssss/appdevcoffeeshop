import { useState, useEffect } from "react";
import { reportsAPI } from "../../utils/api";

function BarChart({ data, valueKey, labelKey = "day", color = "#D4956A" }) {
  if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-[#8B4513]/40 text-sm">No data yet.</div>;
  const max = Math.max(...data.map((d) => d[valueKey])) || 1;
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const height = Math.max(4, (item[valueKey] / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
              style={{ height: `${height}%`, backgroundColor: color, minHeight: "4px" }}
            />
            <span className="text-xs text-[#8B4513]/60 font-medium">{item[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminReports() {
  const [period, setPeriod]         = useState("weekly");
  const [summary, setSummary]       = useState(null);
  const [dailyData, setDaily]       = useState([]);
  const [monthlyData, setMonthly]   = useState([]);
  const [topProducts, setTop]       = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [sum, daily, monthly, top] = await Promise.all([
          reportsAPI.summary(),
          reportsAPI.daily(7),
          reportsAPI.monthly(7),
          reportsAPI.topProducts(5),
        ]);
        setSummary(sum);
        setDaily(Array.isArray(daily) ? daily : []);
        setMonthly(Array.isArray(monthly) ? monthly : []);
        setTop(Array.isArray(top) ? top : []);
      } catch (e) {
        console.error("Reports load error:", e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="text-center py-16"><div className="text-5xl animate-float mb-4">📈</div><p className="font-display text-xl text-[#3C1810]">Loading reports...</p></div>
  );

  const totalRevenue  = summary ? Number(summary.total.revenue) : 0;
  const totalOrders   = dailyData.reduce((s, d) => s + d.orders, 0);
  const avgOrder      = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {["daily", "weekly", "monthly"].map((p) => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all capitalize ${period === p ? "bg-[#D4956A] text-white" : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"}`}
          >{p}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Total Revenue",   value: `₱${totalRevenue.toLocaleString()}`, icon: "💰", color: "text-green-600"  },
          { label: "Orders (7 days)", value: totalOrders,                          icon: "📦", color: "text-blue-600"   },
          { label: "Avg Order Value", value: `₱${avgOrder}`,                       icon: "📊", color: "text-purple-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
            </div>
            <p className={`font-display text-3xl ${card.color} mb-1`}>{card.value}</p>
            <p className="text-sm text-[#8B4513]/60">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">📦 Orders This Week</h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">Total: {totalOrders} orders</p>
          <BarChart data={dailyData} valueKey="orders" labelKey="day" color="#4A90D9" />
        </div>
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">💰 Monthly Revenue</h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">Last 7 months</p>
          <BarChart data={monthlyData} valueKey="revenue" labelKey="month" color="#D4956A" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-[#3C1810]">🏆 Top Performing Products</h3>
          <span className="text-xs text-[#8B4513]/50 font-medium">By revenue</span>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-[#8B4513]/40 text-sm text-center py-8">No sales data yet. Place some orders to see results!</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const maxRevenue = topProducts[0]?.total_revenue || 1;
              const pct = Math.round((p.total_revenue / maxRevenue) * 100);
              const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600", "text-[#8B4513]/50", "text-[#8B4513]/40"];
              return (
                <div key={p.product_id} className="flex items-center gap-4">
                  <span className={`font-display text-xl ${RANK_COLORS[i] || ""} w-6 flex-shrink-0`}>#{i + 1}</span>
                  <span className="text-2xl w-8 flex-shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#3C1810] text-sm truncate">{p.name}</span>
                      <span className="font-bold text-[#D4956A] text-sm ml-2">₱{Number(p.total_revenue).toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#D4956A] to-[#8B4513] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-[#8B4513]/50 mt-1">{p.total_orders} orders · {p.total_qty} items sold</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {["Daily", "Weekly", "Monthly"].map((label) => (
          <button key={label} onClick={() => alert(`${label} Report export — connect to a PDF library in the full version.`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-[#F5E6D3] hover:border-[#D4956A] text-[#8B4513] font-semibold text-sm transition-all"
          >
            <span>📄</span><span>Export {label} Report</span>
          </button>
        ))}
      </div>
    </div>
  );
}
