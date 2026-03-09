import { useState, useEffect } from "react";
import { productsAPI, ordersAPI } from "../../utils/api";
import { useToast } from "../ui/Toast";
import Badge from "../ui/Badge";
import Modal from "../ui/Modal";

const PRODUCT_IMAGES = {
  "Classic Espresso": "/images/products/classic-espresso.jpg",
  "Caramel Latte": "/images/products/caramel-latte.jpg",
  "Vanilla Cappuccino": "/images/products/vanilla-cappuccino.jpg",
  "Hazelnut Flat White": "/images/products/hazelnut-flat-white.jpg",
  "Iced Brown Sugar Oat Latte":
    "/images/products/iced-brown-sugar-oat-latte.jpg",
  "Cold Brew Original": "/images/products/cold-brew-original.jpg",
  "Mango Refresher": "/images/products/mango-refresher.jpg",
  "Strawberry Lemonade": "/images/products/strawberry-lemonade.jpg",
  "Matcha Latte": "/images/products/matcha-latte.jpg",
  "Taro Milk Tea": "/images/products/taro-milk-tea.jpg",
  "Hojicha Latte": "/images/products/hojicha-latte.jpg",
  "Java Chip Frappe": "/images/products/java-chip-frappe.jpg",
  "Cookies & Cream Frappe": "/images/products/cookies-and-cream-frappe.jpg",
  "Strawberry Cheesecake Frappe":
    "/images/products/strawberry-cheesecake-frappe.jpg",
  "Butter Croissant": "/images/products/butter-croissant.jpg",
  "Cinnamon Roll": "/images/products/cinnamon-roll.jpg",
  "Blueberry Muffin": "/images/products/blueberry-muffin.jpg",
  "Avocado Toast": "/images/products/avocado-toast.jpg",
  "Cheese Panini": "/images/products/cheese-panini.jpg",
  "Granola Bowl": "/images/products/granola-bowl.jpg",
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "espresso", label: "Espresso" },
  { id: "cold", label: "Cold Drinks" },
  { id: "tea", label: "Tea & Matcha" },
  { id: "frappe", label: "Frappes" },
  { id: "pastry", label: "Pastries" },
  { id: "snacks", label: "Snacks" },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "gcash", label: "GCash", icon: "📱" },
  { id: "maya", label: "Maya", icon: "💜" },
];

export default function AdminCreateOrder() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("cash");
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    productsAPI
      .list({ available: "true" })
      .then((d) => setProducts(Array.isArray(d) ? d : d.results || []))
      .catch(() => addToast("Failed to load products.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchCat = category === "all" || p.category === category;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.available;
  });

  // ── Cart helpers ────────────────────────────────────────────────────────
  const qty = (id) => cart[id] || 0;
  const addToCart = (product) =>
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
  const decCart = (product) =>
    setCart((c) => {
      const next = (c[product.id] || 0) - 1;
      if (next <= 0) {
        const { [product.id]: _, ...rest } = c;
        return rest;
      }
      return { ...c, [product.id]: next };
    });
  const clearCart = () => setCart({});

  const cartItems = products
    .filter((p) => cart[p.id] > 0)
    .map((p) => ({ ...p, quantity: cart[p.id] }));

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  // ── Place order ─────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      addToast("Please enter the customer name.", "error");
      return;
    }
    if (cartItems.length === 0) {
      addToast("Cart is empty.", "error");
      return;
    }

    setPlacing(true);
    try {
      const result = await ordersAPI.place(
        cartItems.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        payment,
        notes,
        customerName.trim()
      );
      setSuccessOrder(result);
      clearCart();
      setShowCheckout(false);
      setCustomerName("");
      setNotes("");
      addToast(`Order ${result.reference} placed!`, "success");
    } catch (err) {
      addToast(err.message || "Failed to place order.", "error");
    } finally {
      setPlacing(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-16">
        <div className="text-5xl animate-float mb-4">☕</div>
        <p className="font-display text-xl text-[#3C1810]">
          Loading products...
        </p>
      </div>
    );

  return (
    <div className="flex gap-6 h-full">
      {/* ── LEFT: Product browser ── */}
      <div className="flex-1 min-w-0">
        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4956A]">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl py-2.5 pl-9 pr-4 text-sm font-medium placeholder:text-[#C4A882] focus:outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#3C1810] focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const q = qty(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border-2 border-[#F5E6D3] hover:border-[#D4956A] transition-all overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-28 bg-[#F5E6D3] overflow-hidden flex-shrink-0">
                  {PRODUCT_IMAGES[product.name] ? (
                    <img
                      src={PRODUCT_IMAGES[product.name]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[#C4A882]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18A2.25 2.25 0 0023.25 18V6A2.25 2.25 0 0021 3.75H3A2.25 2.25 0 00.75 6v12A2.25 2.25 0 003 20.25z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  {product.badge && (
                    <div className="mb-1">
                      <Badge type={product.badge} />
                    </div>
                  )}
                  <p className="font-semibold text-[#3C1810] text-sm leading-tight mb-1">
                    {product.name}
                  </p>
                  <p className="text-[#D4956A] font-bold text-sm mb-3">
                    ₱{product.price.toFixed(2)}
                  </p>
                  {/* Qty controls */}
                  {q === 0 ? (
                    <button
                      onClick={() => addToCart(product)}
                      className="mt-auto w-full py-1.5 rounded-xl bg-[#F5E6D3] hover:bg-[#D4956A] hover:text-white text-[#8B4513] font-bold text-sm transition-all"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="mt-auto flex items-center justify-between bg-[#FFF8F0] rounded-xl px-2 py-1">
                      <button
                        onClick={() => decCart(product)}
                        className="w-7 h-7 rounded-lg bg-[#F5E6D3] hover:bg-red-100 text-[#8B4513] font-bold transition-all"
                      >
                        −
                      </button>
                      <span className="font-bold text-[#3C1810] text-sm">
                        {q}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-7 h-7 rounded-lg bg-[#F5E6D3] hover:bg-[#D4956A] hover:text-white text-[#8B4513] font-bold transition-all"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#8B4513]/40">
            <div className="text-4xl mb-2">🔍</div>
            <p>No products found</p>
          </div>
        )}
      </div>

      {/* ── RIGHT: Cart panel ── */}
      <div className="w-80 flex-shrink-0">
        <div
          className="bg-white rounded-3xl border-2 border-[#F5E6D3] sticky top-4 flex flex-col"
          style={{ maxHeight: "calc(100vh - 160px)" }}
        >
          <div className="px-5 py-4 border-b border-[#F5E6D3] flex items-center justify-between">
            <h3 className="font-display text-lg text-[#3C1810]">
              🛒 Order Cart
            </h3>
            {totalItems > 0 && (
              <span className="bg-[#D4956A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-10 text-[#8B4513]/40">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-sm">No items yet</p>
                <p className="text-xs mt-1">Click + Add on any product</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#3C1810] text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-[#D4956A] text-xs font-bold">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => decCart(item)}
                        className="w-6 h-6 rounded-lg bg-[#F5E6D3] hover:bg-red-100 text-[#8B4513] text-xs font-bold transition-all"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-[#3C1810] text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-6 h-6 rounded-lg bg-[#F5E6D3] hover:bg-[#D4956A] hover:text-white text-[#8B4513] text-xs font-bold transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="px-5 py-4 border-t border-[#F5E6D3] bg-[#FFF8F0] rounded-b-3xl">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-[#3C1810] text-sm">
                  Total
                </span>
                <span className="font-display text-xl text-[#D4956A]">
                  ₱{totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-2.5 rounded-2xl bg-[#D4956A] hover:bg-[#C07A50] text-white font-bold text-sm transition-all shadow-sm"
              >
                Proceed to Checkout →
              </button>
              <button
                onClick={clearCart}
                className="w-full mt-2 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
              >
                Clear cart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Checkout Modal ── */}
      <Modal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        title="🧾 Place Order"
        size="md"
      >
        <div className="space-y-4">
          {/* Customer name */}
          <div>
            <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
              Customer Name
            </label>
            <input
              type="text"
              placeholder="e.g. Juan dela Cruz"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#3C1810] placeholder:text-[#C4A882] focus:outline-none"
            />
          </div>

          {/* Order summary */}
          <div className="bg-[#FFF8F0] rounded-2xl p-4">
            <p className="text-sm font-bold text-[#3C1810] mb-3">
              Order Summary
            </p>
            <div className="space-y-2 mb-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#3C1810]">
                    {item.name}{" "}
                    <span className="text-[#8B4513]/50">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-[#D4956A]">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#F5E6D3] pt-2 flex justify-between font-bold">
              <span className="text-[#3C1810]">Total</span>
              <span className="text-[#D4956A] font-display text-lg">
                ₱{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="text-sm font-bold text-[#3C1810] block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border-2 font-semibold text-sm transition-all ${
                    payment === m.id
                      ? "border-[#D4956A] bg-[#FFF8F0] text-[#3C1810]"
                      : "border-[#F5E6D3] bg-white text-[#8B4513] hover:border-[#D4956A]"
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
              Notes{" "}
              <span className="text-[#C4A882] font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-2.5 text-sm text-[#3C1810] placeholder:text-[#C4A882] focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setShowCheckout(false)}
              className="flex-1 py-2.5 rounded-2xl border-2 border-[#F5E6D3] text-[#8B4513] font-bold text-sm hover:border-[#D4956A] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="flex-1 py-2.5 rounded-2xl bg-[#D4956A] hover:bg-[#C07A50] disabled:opacity-50 text-white font-bold text-sm transition-all shadow-sm"
            >
              {placing ? "Placing..." : "Confirm Order"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Success Modal ── */}
      <Modal
        isOpen={!!successOrder}
        onClose={() => setSuccessOrder(null)}
        title="✅ Order Placed!"
        size="sm"
      >
        {successOrder && (
          <div className="text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-[#8B4513]/60 text-sm mb-1">Order Reference</p>
            <p className="font-display text-2xl text-[#D4956A] mb-4">
              {successOrder.reference}
            </p>
            <div className="bg-[#FFF8F0] rounded-2xl p-4 text-left mb-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#8B4513]/60">Customer</span>
                <span className="font-semibold text-[#3C1810]">
                  {successOrder.customer_name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B4513]/60">Total</span>
                <span className="font-bold text-[#D4956A]">
                  ₱{Number(successOrder.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B4513]/60">Payment</span>
                <span className="font-semibold text-[#3C1810] capitalize">
                  {successOrder.payment_method}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8B4513]/60">Status</span>
                <span className="font-semibold text-amber-600 capitalize">
                  {successOrder.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="w-full py-2.5 rounded-2xl bg-[#D4956A] hover:bg-[#C07A50] text-white font-bold text-sm transition-all"
            >
              New Order
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
