import { useState, useEffect } from "react";
import { reportsAPI } from "../../utils/api";

function BarChart({ data, valueKey, labelKey = "day", color = "#D4956A" }) {
  if (!data || data.length === 0)
    return (
      <div className="h-40 flex items-center justify-center text-[#8B4513]/40 text-sm">
        No data yet.
      </div>
    );
  const max = Math.max(...data.map((d) => d[valueKey])) || 1;
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, i) => {
        const height = Math.max(4, (item[valueKey] / max) * 100);
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group"
          >
            <div
              className="w-full rounded-t-lg transition-all duration-300 group-hover:opacity-80"
              style={{
                height: `${height}%`,
                backgroundColor: color,
                minHeight: "4px",
              }}
            />
            <span className="text-xs text-[#8B4513]/60 font-medium">
              {item[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── CSV helpers ───────────────────────────────────────────────────────────────
function downloadCSV(filename, rows) {
  const csv = rows
    .map((r) =>
      r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate() {
  return new Date().toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminReports() {
  const [period, setPeriod] = useState("weekly");
  const [summary, setSummary] = useState(null);
  const [dailyData, setDaily] = useState([]);
  const [weeklyData, setWeekly] = useState([]);
  const [monthlyData, setMonthly] = useState([]);
  const [topProducts, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null); // "daily" | "weekly" | "monthly" | null

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [sum, daily, weekly, monthly, top] = await Promise.all([
          reportsAPI.summary(),
          reportsAPI.daily(7),
          reportsAPI.weekly(4),
          reportsAPI.monthly(7),
          reportsAPI.topProducts(5),
        ]);
        setSummary(sum);
        setDaily(Array.isArray(daily) ? daily : []);
        setWeekly(Array.isArray(weekly) ? weekly : []);
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

  // ── Export handlers ──────────────────────────────────────────────────────
  const exportDaily = async () => {
    setExporting("daily");
    try {
      const data = await reportsAPI.daily(30); // last 30 days
      const rows = [
        ["BrewHaven — Daily Revenue Report"],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Date", "Orders", "Revenue (₱)"],
        ...(Array.isArray(data) ? data : []).map((d) => [
          d.day,
          d.orders,
          d.revenue,
        ]),
        [],
        [
          "TOTAL",
          data.reduce((s, d) => s + d.orders, 0),
          data.reduce((s, d) => s + Number(d.revenue), 0).toFixed(2),
        ],
      ];
      downloadCSV(`brewhaven-daily-report-${formatDate()}.csv`, rows);
    } catch (e) {
      alert("Failed to export daily report.");
    } finally {
      setExporting(null);
    }
  };

  const exportWeekly = async () => {
    setExporting("weekly");
    try {
      const data = await reportsAPI.weekly(8); // last 8 weeks
      const raw = Array.isArray(data) ? data : [];
      const rows = [
        ["BrewHaven — Weekly Revenue Report"],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Week", "Orders", "Revenue (₱)"],
        ...raw.map((d) => [d.week, d.orders, d.revenue]),
        [],
        [
          "TOTAL",
          raw.reduce((s, d) => s + d.orders, 0),
          raw.reduce((s, d) => s + Number(d.revenue), 0).toFixed(2),
        ],
      ];
      downloadCSV(`brewhaven-weekly-report-${formatDate()}.csv`, rows);
    } catch (e) {
      alert("Failed to export weekly report.");
    } finally {
      setExporting(null);
    }
  };

  const exportMonthly = async () => {
    setExporting("monthly");
    try {
      const data = await reportsAPI.monthly(12); // last 12 months
      const raw = Array.isArray(data) ? data : [];
      const rows = [
        ["BrewHaven — Monthly Revenue Report"],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Month", "Orders", "Revenue (₱)"],
        ...raw.map((d) => [d.month, d.orders, d.revenue]),
        [],
        [
          "TOTAL",
          raw.reduce((s, d) => s + d.orders, 0),
          raw.reduce((s, d) => s + Number(d.revenue), 0).toFixed(2),
        ],
      ];
      downloadCSV(`brewhaven-monthly-report-${formatDate()}.csv`, rows);
    } catch (e) {
      alert("Failed to export monthly report.");
    } finally {
      setExporting(null);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="text-center py-16">
        <div className="text-5xl animate-float mb-4">📈</div>
        <p className="font-display text-xl text-[#3C1810]">
          Loading reports...
        </p>
      </div>
    );

  const totalRevenue = summary ? Number(summary.total.revenue) : 0;
  const totalOrders = dailyData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const EXPORTS = [
    { key: "daily", label: "Daily", handler: exportDaily },
    { key: "weekly", label: "Weekly", handler: exportWeekly },
    { key: "monthly", label: "Monthly", handler: exportMonthly },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {["daily", "weekly", "monthly"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all capitalize ${
              period === p
                ? "bg-[#D4956A] text-white"
                : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Total Revenue",
            value: `₱${totalRevenue.toLocaleString()}`,
            icon: "💰",
            color: "text-green-600",
          },
          {
            label: "Orders (7 days)",
            value: totalOrders,
            icon: "📦",
            color: "text-blue-600",
          },
          {
            label: "Avg Order Value",
            value: `₱${avgOrder}`,
            icon: "📊",
            color: "text-purple-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
            </div>
            <p className={`font-display text-3xl ${card.color} mb-1`}>
              {card.value}
            </p>
            <p className="text-sm text-[#8B4513]/60">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">
            📦 Orders This Week
          </h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">
            Total: {totalOrders} orders
          </p>
          <BarChart
            data={dailyData}
            valueKey="orders"
            labelKey="day"
            color="#4A90D9"
          />
        </div>
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">
            💰 Monthly Revenue
          </h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">Last 7 months</p>
          <BarChart
            data={monthlyData}
            valueKey="revenue"
            labelKey="month"
            color="#D4956A"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-[#3C1810]">
            🏆 Top Performing Products
          </h3>
          <span className="text-xs text-[#8B4513]/50 font-medium">
            By revenue
          </span>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-[#8B4513]/40 text-sm text-center py-8">
            No sales data yet. Place some orders to see results!
          </p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const maxRevenue = topProducts[0]?.total_revenue || 1;
              const pct = Math.round((p.total_revenue / maxRevenue) * 100);
              const RANK_COLORS = [
                "text-yellow-500",
                "text-gray-400",
                "text-amber-600",
                "text-[#8B4513]/50",
                "text-[#8B4513]/40",
              ];
              return (
                <div key={p.product_id} className="flex items-center gap-4">
                  <span
                    className={`font-display text-xl ${
                      RANK_COLORS[i] || ""
                    } w-6 flex-shrink-0`}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#3C1810] text-sm truncate">
                        {p.name}
                      </span>
                      <span className="font-bold text-[#D4956A] text-sm ml-2">
                        ₱{Number(p.total_revenue).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4956A] to-[#8B4513] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#8B4513]/50 mt-1">
                      {p.total_orders} orders · {p.total_qty} items sold
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Export buttons ── */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
        <h4 className="font-display text-lg text-[#3C1810] mb-1">
          📄 Export Reports
        </h4>
        <p className="text-xs text-[#8B4513]/50 mb-4">
          Downloads a CSV file to your computer.
        </p>
        <div className="flex gap-3 flex-wrap">
          {EXPORTS.map(({ key, label, handler }) => (
            <button
              key={key}
              onClick={handler}
              disabled={exporting === key}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all border-2 ${
                exporting === key
                  ? "bg-[#F5E6D3] border-[#F5E6D3] text-[#C4A882] cursor-not-allowed"
                  : "bg-white border-[#F5E6D3] hover:border-[#D4956A] hover:bg-[#FFF8F0] text-[#8B4513]"
              }`}
            >
              {exporting === key ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin text-[#D4956A]"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Export {label} Report</span>
                  <span className="text-[#C4A882] text-xs font-normal">
                    CSV
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
