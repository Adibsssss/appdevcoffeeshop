import { useState, useEffect } from "react";
import { reportsAPI, ordersAPI } from "../../utils/api";

// ── Tiny line chart ───────────────────────────────────────────────────────────
function LineChart({ data, valueKey, labelKey, color = "#D4956A" }) {
  const [tooltip, setTooltip] = useState(null);

  if (!data || data.length === 0)
    return (
      <div className="h-48 flex items-center justify-center text-[#8B4513]/40 text-sm">
        No data yet.
      </div>
    );

  const W = 600,
    H = 160,
    PAD = { top: 16, right: 16, bottom: 32, left: 48 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...values) || 1;

  const xStep = innerW / Math.max(data.length - 1, 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + (data.length === 1 ? innerW / 2 : i * xStep),
    y: PAD.top + innerH - ((Number(d[valueKey]) || 0) / maxVal) * innerH,
    val: Number(d[valueKey]) || 0,
    label: d[labelKey],
  }));

  const linePath = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  const fillPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${PAD.top + innerH}` +
    ` L ${pts[0].x} ${PAD.top + innerH} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
    const val = maxVal * frac;
    const y = PAD.top + innerH - frac * innerH;
    const label =
      valueKey === "revenue"
        ? val >= 1000
          ? `₱${(val / 1000).toFixed(1)}k`
          : `₱${Math.round(val)}`
        : Math.round(val);
    return { y, label };
  });

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 200 }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={`fill-${valueKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {gridLines.map(({ y, label }) => (
          <g key={y}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="#F5E6D3"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#C4A882"
            >
              {label}
            </text>
          </g>
        ))}

        <path d={fillPath} fill={`url(#fill-${valueKey})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setTooltip({ ...p, index: i })}>
            <rect
              x={p.x - xStep / 2}
              y={PAD.top}
              width={xStep}
              height={innerH + PAD.bottom}
              fill="transparent"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={tooltip?.index === i ? 6 : 4}
              fill="white"
              stroke={color}
              strokeWidth={tooltip?.index === i ? 2.5 : 2}
              style={{ transition: "r 0.15s" }}
            />
            <text
              x={p.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#C4A882"
            >
              {String(p.label).length > 6
                ? String(p.label).slice(0, 6)
                : p.label}
            </text>
          </g>
        ))}
      </svg>

      {tooltip && (
        <div
          className="absolute bg-[#3C1810] text-white text-xs rounded-xl px-3 py-2 pointer-events-none shadow-lg z-10 whitespace-nowrap"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(tooltip.y / (H + 40)) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <p className="font-semibold">{tooltip.label}</p>
          <p className="text-[#D4956A] font-bold">
            {valueKey === "revenue"
              ? `₱${tooltip.val.toLocaleString()}`
              : `${tooltip.val} orders`}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Excel export helper (SheetJS loaded from CDN) ────────────────────────────
async function loadXLSX() {
  if (window.XLSX) return window.XLSX;
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return window.XLSX;
}

function buildProductSummary(orders) {
  const map = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = item.product_name || item.name;
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0, orders: 0 };
      map[key].qty += item.quantity || 0;
      map[key].revenue += item.subtotal || item.unit_price * item.quantity || 0;
      map[key].orders += 1;
    });
  });
  return Object.values(map).sort((a, b) => b.revenue - a.revenue);
}

// ── Period config ─────────────────────────────────────────────────────────────
const PERIODS = {
  daily: {
    label: "Daily",
    chartTitle: "Orders — Last 7 Days",
    revenueTitle: "Revenue — Last 7 Days",
    dataKey: "dailyData",
    labelKey: "day",
    ordersKey: "orders",
    revenueKey: "revenue",
    statLabel: "Orders (7 days)",
  },
  weekly: {
    label: "Weekly",
    chartTitle: "Orders — Last 4 Weeks",
    revenueTitle: "Revenue — Last 4 Weeks",
    dataKey: "weeklyData",
    labelKey: "week",
    ordersKey: "orders",
    revenueKey: "revenue",
    statLabel: "Orders (4 weeks)",
  },
  monthly: {
    label: "Monthly",
    chartTitle: "Orders — Last 7 Months",
    revenueTitle: "Revenue — Last 7 Months",
    dataKey: "monthlyData",
    labelKey: "month",
    ordersKey: "orders",
    revenueKey: "revenue",
    statLabel: "Orders (7 months)",
  },
  yearly: {
    label: "Yearly",
    chartTitle: "Orders — By Year",
    revenueTitle: "Revenue — By Year",
    dataKey: "yearlyData",
    labelKey: "year",
    ordersKey: "orders",
    revenueKey: "revenue",
    statLabel: "Orders (all years)",
  },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminReports() {
  const [period, setPeriod] = useState("daily");
  const [summary, setSummary] = useState(null);
  const [dailyData, setDaily] = useState([]);
  const [weeklyData, setWeekly] = useState([]);
  const [monthlyData, setMonthly] = useState([]);
  const [yearlyData, setYearly] = useState([]);
  const [topProducts, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(false);
  const [exporting, setExporting] = useState(null);

  // Load everything except top products once
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [sum, daily, weekly, monthly, yearly] = await Promise.all([
          reportsAPI.summary(),
          reportsAPI.daily(7),
          reportsAPI.weekly(4),
          reportsAPI.monthly(7),
          reportsAPI.yearly(3),
        ]);
        setSummary(sum);
        setDaily(Array.isArray(daily) ? daily : []);
        setWeekly(Array.isArray(weekly) ? weekly : []);
        setMonthly(Array.isArray(monthly) ? monthly : []);
        setYearly(Array.isArray(yearly) ? yearly : []);
      } catch (e) {
        console.error("Reports load error:", e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Reload top products whenever period changes
  useEffect(() => {
    const loadTop = async () => {
      try {
        setTopLoading(true);
        const top = await reportsAPI.topProducts(5, period);
        setTop(Array.isArray(top) ? top : []);
      } catch (e) {
        console.error("Top products load error:", e.message);
      } finally {
        setTopLoading(false);
      }
    };
    loadTop();
  }, [period]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const dataMap = { dailyData, weeklyData, monthlyData, yearlyData };
  const cfg = PERIODS[period];
  const activeData = dataMap[cfg.dataKey] || [];

  const periodOrders = activeData.reduce(
    (s, d) => s + (d[cfg.ordersKey] || 0),
    0,
  );
  const periodRevenue = activeData.reduce(
    (s, d) => s + Number(d[cfg.revenueKey] || 0),
    0,
  );
  const avgOrder =
    periodOrders > 0 ? Math.round(periodRevenue / periodOrders) : 0;

  // ── Excel export helpers ────────────────────────────────────────────────────
  const styleHeader = (ws, range, XLSX) => {
    // openpyxl-style cell styling via SheetJS CE is limited — we use col widths + data only
    void ws;
    void range;
    void XLSX;
  };

  const addSheet = (wb, XLSX, sheetName, rows) => {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Auto column widths
    const colWidths = rows.reduce((acc, row) => {
      row.forEach((cell, i) => {
        const len = String(cell ?? "").length;
        acc[i] = Math.max(acc[i] || 8, len + 2);
      });
      return acc;
    }, []);
    ws["!cols"] = colWidths.map((w) => ({ wch: w }));
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  };

  const exportExcel = async (exportPeriod) => {
    setExporting(exportPeriod);
    try {
      const XLSX = await loadXLSX();
      const allOrders = await ordersAPI.adminOrders("completed");
      const orders = Array.isArray(allOrders)
        ? allOrders
        : allOrders?.results || [];

      const now = new Date();
      const wb = XLSX.utils.book_new();
      wb.Props = { Title: "BrewHaven Sales Report", Author: "BrewHaven Admin" };

      // ── Filter orders by period ────────────────────────────────────────────
      let filtered = [];
      let periodLabel = "";
      let filename = "";

      if (exportPeriod === "daily") {
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const toLocal = (d) => {
          const x = new Date(d);
          return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
        };
        filtered = orders.filter((o) => toLocal(o.created_at) === todayStr);
        periodLabel = now.toLocaleDateString("en-PH", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        filename = `brewhaven-daily-${todayStr}.xlsx`;
      } else if (exportPeriod === "weekly") {
        const monday = new Date(now);
        monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        filtered = orders.filter((o) => {
          const d = new Date(o.created_at);
          return d >= monday && d <= sunday;
        });
        periodLabel = `${monday.toLocaleDateString("en-PH", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}`;
        filename = `brewhaven-weekly-${monday.toISOString().slice(0, 10)}.xlsx`;
      } else if (exportPeriod === "monthly") {
        const y = now.getFullYear(),
          m = now.getMonth();
        filtered = orders.filter((o) => {
          const d = new Date(o.created_at);
          return d.getFullYear() === y && d.getMonth() === m;
        });
        periodLabel = now.toLocaleDateString("en-PH", {
          month: "long",
          year: "numeric",
        });
        filename = `brewhaven-monthly-${y}-${String(m + 1).padStart(2, "0")}.xlsx`;
      } else if (exportPeriod === "yearly") {
        const y = now.getFullYear();
        filtered = orders.filter(
          (o) => new Date(o.created_at).getFullYear() === y,
        );
        periodLabel = String(y);
        filename = `brewhaven-yearly-${y}.xlsx`;
      }

      const totalRevenue = filtered.reduce(
        (s, o) => s + Number(o.total_amount || 0),
        0,
      );
      const products = buildProductSummary(filtered);

      // ── Sheet 1: Summary ───────────────────────────────────────────────────
      addSheet(wb, XLSX, "Summary", [
        ["BrewHaven — Sales Report"],
        [`Period: ${periodLabel}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Metric", "Value"],
        ["Total Orders", filtered.length],
        ["Total Revenue (₱)", totalRevenue.toFixed(2)],
        [
          "Avg Order Value (₱)",
          filtered.length
            ? (totalRevenue / filtered.length).toFixed(2)
            : "0.00",
        ],
        ["Unique Customers", new Set(filtered.map((o) => o.customer_id)).size],
      ]);

      // ── Sheet 2: Transactions ──────────────────────────────────────────────
      addSheet(wb, XLSX, "Transactions", [
        [
          "Reference",
          "Customer",
          "Email",
          "Payment Method",
          "Total (₱)",
          "Status",
          "Date & Time",
        ],
        ...filtered.map((o) => [
          o.reference,
          o.customer_name,
          o.customer_email,
          o.payment_method,
          Number(o.total_amount).toFixed(2),
          o.status,
          new Date(o.created_at).toLocaleString("en-PH"),
        ]),
        [],
        ["TOTAL", "", "", "", `=SUM(E2:E${filtered.length + 1})`, "", ""],
      ]);

      // ── Sheet 3: Products Sold ─────────────────────────────────────────────
      addSheet(wb, XLSX, "Products Sold", [
        [
          "Rank",
          "Product Name",
          "Qty Sold",
          "Total Revenue (₱)",
          "No. of Orders",
        ],
        ...products.map((p, i) => [
          i + 1,
          p.name,
          p.qty,
          p.revenue.toFixed(2),
          p.orders,
        ]),
        [],
        [
          "",
          "TOTAL",
          `=SUM(C2:C${products.length + 1})`,
          `=SUM(D2:D${products.length + 1})`,
          `=SUM(E2:E${products.length + 1})`,
        ],
      ]);

      // ── Sheet 4: Breakdown (daily/weekly grouping inside the period) ───────
      if (
        exportPeriod === "monthly" ||
        exportPeriod === "weekly" ||
        exportPeriod === "yearly"
      ) {
        const byKey = {};
        const keyFmt =
          exportPeriod === "yearly"
            ? (d) => d.toLocaleDateString("en-PH", { month: "long" })
            : (d) =>
                d.toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                });

        filtered.forEach((o) => {
          const d = new Date(o.created_at);
          const key =
            exportPeriod === "yearly"
              ? d.toLocaleDateString("en-PH", { month: "long" })
              : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          if (!byKey[key])
            byKey[key] = { label: keyFmt(d), orders: 0, revenue: 0 };
          byKey[key].orders += 1;
          byKey[key].revenue += Number(o.total_amount || 0);
        });

        const breakdownLabel =
          exportPeriod === "yearly" ? "Monthly Breakdown" : "Daily Breakdown";
        addSheet(wb, XLSX, breakdownLabel, [
          [
            exportPeriod === "yearly" ? "Month" : "Date",
            "No. of Orders",
            "Revenue (₱)",
          ],
          ...Object.entries(byKey)
            .sort()
            .map(([, v]) => [v.label, v.orders, v.revenue.toFixed(2)]),
          [],
          [
            "TOTAL",
            `=SUM(B2:B${Object.keys(byKey).length + 1})`,
            `=SUM(C2:C${Object.keys(byKey).length + 1})`,
          ],
        ]);
      }

      XLSX.writeFile(wb, filename);
    } catch (e) {
      console.error("Excel export error:", e);
      alert("Failed to export Excel report. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div className="text-center py-16">
        <div className="text-5xl animate-float mb-4">📈</div>
        <p className="font-display text-xl text-[#3C1810]">
          Loading reports...
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(PERIODS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-all ${
              period === key
                ? "bg-[#D4956A] text-white shadow-md"
                : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Revenue",
            value: `₱${periodRevenue.toLocaleString()}`,
            color: "text-green-600",
          },
          { label: cfg.statLabel, value: periodOrders, color: "text-blue-600" },
          {
            label: "Avg Order Value",
            value: `₱${avgOrder.toLocaleString()}`,
            color: "text-purple-600",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5"
          >
            <p className={`font-display text-3xl ${card.color} mb-1`}>
              {card.value}
            </p>
            <p className="text-sm text-[#8B4513]/60">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">
            {cfg.chartTitle}
          </h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">
            Total: {periodOrders} orders
          </p>
          <LineChart
            data={activeData}
            valueKey={cfg.ordersKey}
            labelKey={cfg.labelKey}
            color="#4A90D9"
          />
        </div>
        <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
          <h3 className="font-display text-lg text-[#3C1810] mb-1">
            {cfg.revenueTitle}
          </h3>
          <p className="text-xs text-[#8B4513]/50 mb-5">
            Total: ₱{periodRevenue.toLocaleString()}
          </p>
          <LineChart
            data={activeData}
            valueKey={cfg.revenueKey}
            labelKey={cfg.labelKey}
            color="#D4956A"
          />
        </div>
      </div>

      {/* Top performing products — reactive to period */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl text-[#3C1810]">
              Top Performing Products
            </h3>
            <p className="text-xs text-[#8B4513]/50 mt-0.5 capitalize">
              {period} · by revenue
            </p>
          </div>
          {topLoading && (
            <span className="text-xs text-[#C4A882] animate-pulse">
              Updating...
            </span>
          )}
        </div>

        {topProducts.length === 0 && !topLoading ? (
          <p className="text-[#8B4513]/40 text-sm text-center py-8">
            No sales data for this period.
          </p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const maxRev = topProducts[0]?.total_revenue || 1;
              const pct = Math.round((p.total_revenue / maxRev) * 100);
              const RANK = [
                "text-yellow-500",
                "text-gray-400",
                "text-amber-600",
                "text-[#8B4513]/50",
                "text-[#8B4513]/40",
              ];
              return (
                <div key={p.product_id} className="flex items-center gap-4">
                  <span
                    className={`font-display text-xl ${RANK[i] || ""} w-6 flex-shrink-0`}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#3C1810] text-sm truncate">
                        {p.emoji} {p.name}
                      </span>
                      <span className="font-bold text-[#D4956A] text-sm ml-2">
                        ₱{Number(p.total_revenue).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-[#F5E6D3] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4956A] to-[#8B4513] rounded-full transition-all duration-500"
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

      {/* Export */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
        <h4 className="font-display text-lg text-[#3C1810] mb-1">
          Export Reports
        </h4>
        <p className="text-xs text-[#8B4513]/50 mb-4">
          Downloads a formatted Excel (.xlsx) file with multiple sheets —
          Summary, Transactions, Products Sold, and a Breakdown tab.
        </p>
        <div className="flex gap-3 flex-wrap">
          {[
            { key: "daily", label: "Today" },
            { key: "weekly", label: "This Week" },
            { key: "monthly", label: "This Month" },
            { key: "yearly", label: "This Year" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => exportExcel(key)}
              disabled={!!exporting}
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
                  <span>📊</span>
                  <span>Export {label}</span>
                  <span className="text-[#C4A882] text-xs font-normal">
                    XLSX
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
