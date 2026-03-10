import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import { ordersAPI } from "../../utils/api";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳" },
  { id: "gcash", label: "GCash", icon: "📱" },
  { id: "maya", label: "Maya", icon: "🟣" },
  { id: "cash", label: "Cash on Pickup", icon: "💵" },
];

function OrderSummary({ items, totalPrice }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
      <h3 className="font-display text-xl text-[#3C1810] mb-4">
        Order Summary
      </h3>
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#3C1810] text-sm truncate">
                {item.name}
              </p>
              <p className="text-[#8B4513]/60 text-xs">x{item.quantity}</p>
            </div>
            <p className="font-bold text-[#D4956A] text-sm">
              ₱{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-[#F5E6D3] pt-4 space-y-2">
        <div className="flex justify-between text-sm text-[#8B4513]/70">
          <span>Subtotal</span>
          <span>₱{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-[#8B4513]/70">
          <span>Service Fee</span>
          <span>₱0.00</span>
        </div>
        <div className="flex justify-between font-display text-xl text-[#3C1810] pt-2 border-t border-[#F5E6D3]">
          <span>Total</span>
          <span className="text-[#D4956A]">₱{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (items.length === 0 && !successModal) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-7xl mb-4 animate-float">🛒</div>
          <h2 className="font-display text-3xl text-[#3C1810] mb-2">
            Cart is empty!
          </h2>
          <p className="text-[#8B4513]/60 mb-6">
            Add some items before checking out.
          </p>
          <Button onClick={() => navigate("/menu")}>Browse Menu</Button>
        </div>
      </Layout>
    );
  }

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = () => {
    const e = {};
    if (user?.role === "admin" && !customerName.trim()) {
      e.customerName = "Customer name is required.";
    }
    if (paymentMethod !== "card" && paymentMethod !== "cash") return e;
    if (paymentMethod === "cash") return e;
    if (!card.number || card.number.replace(/\s/g, "").length < 16)
      e.number = "Enter a valid 16-digit card number.";
    if (!card.name.trim()) e.name = "Cardholder name is required.";
    if (!card.expiry || card.expiry.length < 5)
      e.expiry = "Enter a valid expiry date.";
    if (!card.cvv || card.cvv.length < 3) e.cvv = "CVV must be 3-4 digits.";
    return e;
  };

  const handlePlaceOrder = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setLoading(true);
    try {
      const apiItems = items.map((i) => ({
        product_id: i.id,
        quantity: i.quantity,
      }));
      const result = await ordersAPI.place(
        apiItems,
        paymentMethod,
        notes,
        user?.role === "admin" ? customerName.trim() : ""
      );
      setPlacedOrder(result.order);
      clearCart();
      setSuccessModal(true);
    } catch (err) {
      addToast(err.message || "Order failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-[#3C1810] mb-8 animate-slide-up">
          💳 Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Payment */}
          <div className="lg:col-span-3 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
              <h3 className="font-display text-xl text-[#3C1810] mb-4">
                Customer Details
              </h3>
              {user?.role === "admin" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
                      Customer Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Juan dela Cruz"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        setErrors((ev) => ({ ...ev, customerName: "" }));
                      }}
                      className={`w-full bg-white border-2 ${
                        errors.customerName
                          ? "border-red-400"
                          : "border-[#F5E6D3] focus:border-[#D4956A]"
                      } rounded-2xl px-4 py-2.5 text-sm font-medium text-[#3C1810] placeholder:text-[#C4A882] focus:outline-none`}
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customerName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
                      Notes{" "}
                      <span className="text-[#C4A882] font-normal">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      placeholder="Special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-2.5 text-sm text-[#3C1810] placeholder:text-[#C4A882] focus:outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 rounded-2xl p-3 text-amber-700 text-xs font-medium">
                    <span>
                      Ordering as admin — order will be assigned to this
                      customer name.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-[#FFF8F0] rounded-2xl p-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5E6D3] flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <p className="font-bold text-[#3C1810]">{user?.name}</p>
                    <p className="text-sm text-[#8B4513]/60">{user?.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] p-6">
              <h3 className="font-display text-xl text-[#3C1810] mb-4">
                Payment Method
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id);
                      setErrors({});
                    }}
                    className={`
                      flex items-center gap-3 p-3 rounded-2xl border-2 font-semibold text-sm transition-all
                      ${
                        paymentMethod === m.id
                          ? "border-[#D4956A] bg-[#FFF8F0] text-[#8B4513]"
                          : "border-[#F5E6D3] text-[#3C1810] hover:border-[#D4956A]/50"
                      }
                    `}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Card form */}
              {paymentMethod === "card" && (
                <div className="space-y-4 animate-slide-up">
                  <div className="bg-gradient-to-br from-[#3C1810] to-[#8B4513] rounded-2xl p-5 text-white">
                    <div className="flex justify-between items-start mb-8">
                      <span className="font-accent text-lg text-[#D4956A]">
                        BrewHaven
                      </span>
                      <span className="text-2xl">💳</span>
                    </div>
                    <p className="font-mono text-lg tracking-widest mb-4">
                      {card.number || "•••• •••• •••• ••••"}
                    </p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-white/50 text-xs">Card Holder</p>
                        <p className="font-semibold">
                          {card.name || "YOUR NAME"}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs">Expires</p>
                        <p className="font-semibold">
                          {card.expiry || "MM/YY"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Input
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                    icon="💳"
                    value={card.number}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        number: formatCardNumber(e.target.value),
                      })
                    }
                    error={errors.number}
                    maxLength={19}
                  />
                  <Input
                    label="Cardholder Name"
                    placeholder="Full name on card"
                    icon="👤"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    error={errors.name}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      icon="📅"
                      value={card.expiry}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          expiry: formatExpiry(e.target.value),
                        })
                      }
                      error={errors.expiry}
                      maxLength={5}
                    />
                    <Input
                      label="CVV"
                      placeholder="•••"
                      icon="🔒"
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({
                          ...card,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      error={errors.cvv}
                      maxLength={4}
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 rounded-2xl p-3 text-amber-700 text-xs font-medium">
                    <span>This is a demo. No real payment is processed.</span>
                  </div>
                </div>
              )}

              {paymentMethod === "gcash" && (
                <div className="animate-slide-up bg-blue-50 rounded-2xl p-5 text-center">
                  <div className="text-5xl mb-3">📱</div>
                  <p className="font-semibold text-blue-700 mb-1">
                    GCash Payment
                  </p>
                  <p className="text-blue-600 text-sm">
                    You will be redirected to GCash after placing the order.
                    (Demo)
                  </p>
                </div>
              )}

              {paymentMethod === "maya" && (
                <div className="animate-slide-up bg-purple-50 rounded-2xl p-5 text-center">
                  <div className="text-5xl mb-3">🟣</div>
                  <p className="font-semibold text-purple-700 mb-1">
                    Maya Payment
                  </p>
                  <p className="text-purple-600 text-sm">
                    You will be redirected to Maya after placing the order.
                    (Demo)
                  </p>
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="animate-slide-up bg-green-50 rounded-2xl p-5 text-center">
                  <div className="text-5xl mb-3">💵</div>
                  <p className="font-semibold text-green-700 mb-1">
                    Pay at Counter
                  </p>
                  <p className="text-green-600 text-sm">
                    Show your order receipt and pay when you pick up your order.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-2 space-y-4">
            <OrderSummary items={items} totalPrice={totalPrice} />
            <Button
              fullWidth
              size="lg"
              onClick={handlePlaceOrder}
              loading={loading}
            >
              {loading
                ? "Processing Payment..."
                : `Place Order · ₱${totalPrice.toFixed(2)}`}
            </Button>
            <p className="text-xs text-center text-[#8B4513]/50">
              Demo payments only. No real charges.
            </p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={successModal}
        onClose={() => {
          setSuccessModal(false);
          navigate(user?.role === "admin" ? "/admin" : "/menu");
        }}
        size="md"
      >
        <div className="text-center py-4">
          <div className="text-7xl mb-4 animate-bounce-in">🎉</div>
          <h2 className="font-display text-3xl text-[#3C1810] mb-2">
            Order Placed!
          </h2>
          <p className="text-[#8B4513]/70 mb-4">
            {user?.role === "admin"
              ? `Order for ${placedOrder?.customer_name} has been received.`
              : "Your order has been received and is being prepared."}
          </p>
          <div className="bg-[#FFF8F0] rounded-2xl p-4 mb-6">
            <p className="text-sm text-[#8B4513]/60 mb-1">Order Reference</p>
            <p className="font-display text-2xl text-[#D4956A]">
              {placedOrder?.reference || "—"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              fullWidth
              onClick={() => {
                setSuccessModal(false);
                navigate("/menu");
              }}
            >
              🍽️ Order More
            </Button>
            {user?.role === "admin" ? (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setSuccessModal(false);
                  navigate("/admin?tab=orders");
                }}
              >
                📦 View Orders
              </Button>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setSuccessModal(false);
                  navigate("/");
                }}
              >
                Back to Home
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
