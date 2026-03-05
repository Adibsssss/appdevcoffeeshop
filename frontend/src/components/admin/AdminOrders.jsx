import { useState, useEffect } from "react";
import { ordersAPI } from "../../utils/api";
import { useToast } from "../ui/Toast";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  preparing: { label: "Preparing", bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  ready:     { label: "Ready",     bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  completed: { label: "Completed", bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  cancelled: { label: "Cancelled", bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
};

const PAYMENT_ICONS = { card: "💳", gcash: "📱", maya: "🟣", cash: "💵" };

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelected]  = useState(null);
  const [search, setSearch]           = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const status = filterStatus === "all" ? undefined : filterStatus;
      const data = await ordersAPI.adminOrders(status);
      setOrders(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      addToast("Failed to load orders.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
      if (selectedOrder?.id === id) setSelected((p) => ({ ...p, status }));
    } catch (e) {
      addToast(e.message, "error");
    }
  };

  const filtered = orders.filter((o) => {
    return !search
      || (o.customer_name || "").toLowerCase().includes(search.toLowerCase())
      || o.reference.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4956A]">🔍</span>
          <input type="text" placeholder="Search by customer or order ID..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl py-2.5 pl-9 pr-4 text-sm font-medium placeholder:text-[#C4A882] focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all capitalize ${filterStatus === s ? "bg-[#D4956A] text-white" : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"}`}
            >{s === "all" ? "All" : s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="text-5xl animate-float mb-4">📦</div><p className="font-display text-xl text-[#3C1810]">Loading orders...</p></div>
      ) : (
        <div className="flex gap-6">
          {/* Orders table */}
          <div className={`bg-white rounded-3xl border-2 border-[#F5E6D3] overflow-hidden ${selectedOrder ? "flex-1 hidden lg:block" : "w-full"}`}>
            <div className="px-6 py-4 border-b border-[#F5E6D3] flex justify-between items-center">
              <h3 className="font-display text-lg text-[#3C1810]">📦 Orders</h3>
              <span className="text-sm text-[#D4956A] font-semibold">{filtered.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FFF8F0] text-left text-xs font-bold text-[#8B4513] uppercase tracking-wider">
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3 hidden md:table-cell">Total</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 hidden sm:table-cell">Payment</th>
                    <th className="px-5 py-3">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-[#8B4513]/50">No orders found.</td></tr>
                  ) : filtered.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <tr key={order.id} className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors cursor-pointer" onClick={() => setSelected(order)}>
                        <td className="px-5 py-4 font-mono text-sm font-bold text-[#D4956A]">{order.reference}</td>
                        <td className="px-5 py-4"><p className="font-semibold text-[#3C1810] text-sm">{order.customer_name}</p></td>
                        <td className="px-5 py-4 hidden md:table-cell font-bold text-[#3C1810]">₱{Number(order.total_amount).toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell"><span className="text-lg">{PAYMENT_ICONS[order.payment_method] || "💵"}</span></td>
                        <td className="px-5 py-4">
                          <select value={order.status}
                            onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-white border-2 border-[#F5E6D3] rounded-xl px-2 py-1 font-medium text-[#3C1810] focus:outline-none focus:border-[#D4956A]"
                          >
                            {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail panel */}
          {selectedOrder && (
            <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-3xl border-2 border-[#F5E6D3] p-6 animate-slide-up self-start">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-display text-xl text-[#3C1810]">Order Details</h3>
                <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-full bg-[#F5E6D3] flex items-center justify-center text-[#8B4513] hover:bg-[#D4956A] hover:text-white transition-all text-sm">✕</button>
              </div>
              <div className="bg-[#FFF8F0] rounded-2xl p-3 mb-4">
                <p className="font-mono text-lg font-bold text-[#D4956A]">{selectedOrder.reference}</p>
              </div>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex gap-2"><span className="text-[#8B4513]/50 w-16 flex-shrink-0">Customer</span><span className="font-semibold text-[#3C1810]">{selectedOrder.customer_name}</span></div>
                <div className="flex gap-2"><span className="text-[#8B4513]/50 w-16 flex-shrink-0">Email</span><span className="font-medium text-[#3C1810] text-xs truncate">{selectedOrder.customer_email}</span></div>
                <div className="flex gap-2"><span className="text-[#8B4513]/50 w-16 flex-shrink-0">Payment</span><span className="font-medium text-[#3C1810]">{PAYMENT_ICONS[selectedOrder.payment_method]} {selectedOrder.payment_method}</span></div>
                <div className="flex gap-2"><span className="text-[#8B4513]/50 w-16 flex-shrink-0">Total</span><span className="font-display text-lg text-[#D4956A]">₱{Number(selectedOrder.total_amount).toLocaleString()}</span></div>
              </div>
              <div className="border-t border-[#F5E6D3] pt-4">
                <p className="text-xs font-bold text-[#8B4513]/50 uppercase tracking-wide mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button key={key} onClick={() => updateStatus(selectedOrder.id, key)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${selectedOrder.status === key ? `${cfg.bg} ${cfg.text} border-transparent` : "bg-white text-[#8B4513] border-[#F5E6D3] hover:border-[#D4956A]"}`}
                    >{cfg.label}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
