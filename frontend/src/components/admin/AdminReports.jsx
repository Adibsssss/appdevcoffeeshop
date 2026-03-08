import { useState, useEffect } from "react";
import { reportsAPI } from "../../utils/api";

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
  const minVal = 0;

  const xStep = innerW / Math.max(data.length - 1, 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + (data.length === 1 ? innerW / 2 : i * xStep),
    y: PAD.top + innerH - ((Number(d[valueKey]) || 0) / maxVal) * innerH,
    val: Number(d[valueKey]) || 0,
    label: d[labelKey],
  }));

  // Build smooth SVG path
  const linePath = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cpx = (prev.x + p.x) / 2;
      return `C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;
    })
    .join(" ");

  // Fill area under the line
  const fillPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${PAD.top + innerH}` +
    ` L ${pts[0].x} ${PAD.top + innerH} Z`;

  // Y-axis gridlines
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

        {/* Grid lines */}
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

        {/* Fill */}
        <path d={fillPath} fill={`url(#fill-${valueKey})`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots + hover areas */}
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setTooltip({ ...p, index: i })}>
            {/* Invisible wide hover zone */}
            <rect
              x={p.x - xStep / 2}
              y={PAD.top}
              width={xStep}
              height={innerH + PAD.bottom}
              fill="transparent"
            />
            {/* Dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={tooltip?.index === i ? 6 : 4}
              fill="white"
              stroke={color}
              strokeWidth={tooltip?.index === i ? 2.5 : 2}
              style={{ transition: "r 0.15s" }}
            />
            {/* X-axis label */}
            <text
              x={p.x}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fill="#C4A882"
              style={{ overflow: "hidden" }}
            >
              {String(p.label).length > 5
                ? String(p.label).slice(0, 5)
                : p.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating tooltip */}
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

//  CSV helpers
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

//  Period config
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
};

//
export default function AdminReports() {
  const [period, setPeriod] = useState("daily");
  const [summary, setSummary] = useState(null);
  const [dailyData, setDaily] = useState([]);
  const [weeklyData, setWeekly] = useState([]);
  const [monthlyData, setMonthly] = useState([]);
  const [topProducts, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

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

  //  Derive active dataset from period
  const dataMap = { dailyData, weeklyData, monthlyData };
  const cfg = PERIODS[period];
  const activeData = dataMap[cfg.dataKey] || [];

  const periodOrders = activeData.reduce(
    (s, d) => s + (d[cfg.ordersKey] || 0),
    0
  );
  const periodRevenue = activeData.reduce(
    (s, d) => s + Number(d[cfg.revenueKey] || 0),
    0
  );
  const avgOrder =
    periodOrders > 0 ? Math.round(periodRevenue / periodOrders) : 0;

  //  Export handlers
  const exportDaily = async () => {
    setExporting("daily");
    try {
      const data = await reportsAPI.daily(30);
      const raw = Array.isArray(data) ? data : [];
      downloadCSV(`brewhaven-daily-report-${formatDate()}.csv`, [
        ["BrewHaven — Daily Revenue Report"],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Date", "Orders", "Revenue (₱)"],
        ...raw.map((d) => [d.day, d.orders, d.revenue]),
        [],
        [
          "TOTAL",
          raw.reduce((s, d) => s + d.orders, 0),
          raw.reduce((s, d) => s + Number(d.revenue), 0).toFixed(2),
        ],
      ]);
    } catch {
      alert("Failed to export daily report.");
    } finally {
      setExporting(null);
    }
  };

  const exportWeekly = async () => {
    setExporting("weekly");
    try {
      const data = await reportsAPI.weekly(8);
      const raw = Array.isArray(data) ? data : [];
      downloadCSV(`brewhaven-weekly-report-${formatDate()}.csv`, [
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
      ]);
    } catch {
      alert("Failed to export weekly report.");
    } finally {
      setExporting(null);
    }
  };

  const exportMonthly = async () => {
    setExporting("monthly");
    try {
      const data = await reportsAPI.monthly(12);
      const raw = Array.isArray(data) ? data : [];
      downloadCSV(`brewhaven-monthly-report-${formatDate()}.csv`, [
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
      ]);
    } catch {
      alert("Failed to export monthly report.");
    } finally {
      setExporting(null);
    }
  };

  const EXPORTS = [
    { key: "daily", label: "Daily", handler: exportDaily },
    { key: "weekly", label: "Weekly", handler: exportWeekly },
    { key: "monthly", label: "Monthly", handler: exportMonthly },
  ];

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
      {/*  Period selector  */}
      <div className="flex gap-2">
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

      {/*  KPI cards — react to period  */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            label: "Revenue",
            value: `₱${periodRevenue.toLocaleString()}`,
            color: "text-green-600",
          },
          {
            label: cfg.statLabel,
            value: periodOrders,
            color: "text-blue-600",
          },
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
            <span className="text-3xl block mb-3">{card.icon}</span>
            <p className={`font-display text-3xl ${card.color} mb-1`}>
              {card.value}
            </p>
            <p className="text-sm text-[#8B4513]/60">{card.label}</p>
          </div>
        ))}
      </div>

      {/*  Charts — react to period  */}
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

      {/*  Top products  */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-xl text-[#3C1810]">
            Top Performing Products
          </h3>
          <span className="text-xs text-[#8B4513]/50 font-medium">
            By revenue
          </span>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-[#8B4513]/40 text-sm text-center py-8">
            No sales data yet.
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
                    className={`font-display text-xl ${
                      RANK[i] || ""
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

      {/*  Export  */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-5">
        <h4 className="font-display text-lg text-[#3C1810] mb-1">
          Export Reports
        </h4>
        <p className="text-xs text-[#8B4513]/50 mb-4">
          Downloads a CSV file to your computer.
        </p>
        <div className="flex gap-3 flex-wrap">
          {EXPORTS.map(({ key, label, handler }) => (
            <button
              key={key}
              onClick={handler}
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
                  <span>Export {label}</span>
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
