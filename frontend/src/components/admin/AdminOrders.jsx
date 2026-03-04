import { useState } from "react";

const MOCK_ORDERS = [
  { id: "BH-001", customer: "Maria Santos", email: "maria@email.com", items: [{ name: "Caramel Latte", qty: 1, price: 175 }, { name: "Butter Croissant", qty: 1, price: 95 }], total: 270, status: "completed", payment: "card", date: "2024-01-15", time: "9:30 AM" },
  { id: "BH-002", customer: "Juan Dela Cruz", email: "juan@email.com", items: [{ name: "Iced Brown Sugar Oat Latte", qty: 1, price: 195 }], total: 195, status: "preparing", payment: "gcash", date: "2024-01-15", time: "9:45 AM" },
  { id: "BH-003", customer: "Ana Reyes", email: "ana@email.com", items: [{ name: "Matcha Latte", qty: 2, price: 185 }, { name: "Cinnamon Roll", qty: 1, price: 110 }], total: 480, status: "pending", payment: "cash", date: "2024-01-15", time: "10:00 AM" },
  { id: "BH-004", customer: "Carlos Mendoza", email: "carlos@email.com", items: [{ name: "Java Chip Frappe", qty: 1, price: 210 }, { name: "Blueberry Muffin", qty: 1, price: 90 }], total: 300, status: "completed", payment: "maya", date: "2024-01-15", time: "10:15 AM" },
  { id: "BH-005", customer: "Grace Villanueva", email: "grace@email.com", items: [{ name: "Cold Brew Original", qty: 1, price: 160 }, { name: "Avocado Toast", qty: 1, price: 165 }], total: 325, status: "preparing", payment: "card", date: "2024-01-15", time: "10:30 AM" },
  { id: "BH-006", customer: "Mark Ramos", email: "mark@email.com", items: [{ name: "Taro Milk Tea", qty: 2, price: 175 }], total: 350, status: "cancelled", payment: "gcash", date: "2024-01-14", time: "3:20 PM" },
  { id: "BH-007", customer: "Liza Cruz", email: "liza@email.com", items: [{ name: "Vanilla Cappuccino", qty: 1, price: 165 }, { name: "Cheese Panini", qty: 1, price: 175 }], total: 340, status: "completed", payment: "cash", date: "2024-01-14", time: "2:10 PM" },
];

const STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  preparing: { label: "Preparing", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const PAYMENT_ICONS = { card: "💳", gcash: "📱", maya: "🟣", cash: "💵" };

export default function AdminOrders() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    return matchStatus && matchSearch;
  });

  const updateStatus = (id, status) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    if (selectedOrder?.id === id) setSelectedOrder((p) => ({ ...p, status }));
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4956A]">🔍</span>
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl py-2.5 pl-9 pr-4 text-sm font-medium placeholder:text-[#C4A882] focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "preparing", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold transition-all capitalize ${
                filterStatus === s ? "bg-[#D4956A] text-white" : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

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
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr
                      key={order.id}
                      className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-4 font-mono text-sm font-bold text-[#D4956A]">{order.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#3C1810] text-sm">{order.customer}</p>
                        <p className="text-[#8B4513]/50 text-xs hidden md:block">{order.time}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell font-bold text-[#3C1810]">₱{order.total}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-lg">{PAYMENT_ICONS[order.payment]}</span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-white border-2 border-[#F5E6D3] rounded-xl px-2 py-1 font-medium text-[#3C1810] focus:outline-none focus:border-[#D4956A]"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-3xl border-2 border-[#F5E6D3] p-6 animate-slide-up self-start">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-display text-xl text-[#3C1810]">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-[#F5E6D3] flex items-center justify-center text-[#8B4513] hover:bg-[#D4956A] hover:text-white transition-all text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FFF8F0] rounded-2xl p-3 mb-4">
              <p className="font-mono text-lg font-bold text-[#D4956A]">{selectedOrder.id}</p>
              <p className="text-xs text-[#8B4513]/60">{selectedOrder.date} · {selectedOrder.time}</p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex gap-2 text-sm">
                <span className="text-[#8B4513]/50 w-16 flex-shrink-0">Customer</span>
                <span className="font-semibold text-[#3C1810]">{selectedOrder.customer}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-[#8B4513]/50 w-16 flex-shrink-0">Email</span>
                <span className="font-medium text-[#3C1810] text-xs truncate">{selectedOrder.email}</span>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-[#8B4513]/50 w-16 flex-shrink-0">Payment</span>
                <span className="font-medium text-[#3C1810]">{PAYMENT_ICONS[selectedOrder.payment]} {selectedOrder.payment}</span>
              </div>
            </div>

            <div className="border-t border-[#F5E6D3] pt-4 mb-4">
              <p className="text-xs font-bold text-[#8B4513]/50 uppercase tracking-wide mb-3">Items Ordered</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#3C1810] font-medium">{item.name} <span className="text-[#8B4513]/50">×{item.qty}</span></span>
                    <span className="font-bold text-[#D4956A]">₱{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#F5E6D3] mt-3 pt-3 flex justify-between font-display text-lg">
                <span className="text-[#3C1810]">Total</span>
                <span className="text-[#D4956A]">₱{selectedOrder.total}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#8B4513]/50 uppercase tracking-wide mb-2">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(selectedOrder.id, key)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                      selectedOrder.status === key
                        ? `${cfg.bg} ${cfg.text} border-transparent`
                        : "bg-white text-[#8B4513] border-[#F5E6D3] hover:border-[#D4956A]"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
