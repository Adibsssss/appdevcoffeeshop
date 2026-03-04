import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F5E6D3] last:border-0">
      <div className="w-12 h-12 bg-[#FFF8F0] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
        {item.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#3C1810] text-sm truncate">{item.name}</p>
        <p className="text-[#D4956A] font-bold text-sm">₱{(item.price * item.quantity).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-7 h-7 rounded-xl bg-[#F5E6D3] text-[#8B4513] font-bold hover:bg-[#D4956A] hover:text-white transition-all text-sm"
        >
          −
        </button>
        <span className="w-7 text-center font-bold text-[#3C1810] text-sm">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-xl bg-[#F5E6D3] text-[#8B4513] font-bold hover:bg-[#D4956A] hover:text-white transition-all text-sm"
        >
          +
        </button>
        <button
          onClick={() => removeItem(item.id)}
          className="w-7 h-7 rounded-xl bg-red-50 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all text-sm ml-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleCheckout = () => {
    if (!user) {
      setIsOpen(false);
      navigate("/login");
      return;
    }
    setIsOpen(false);
    navigate("/checkout");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-up md:animate-none"
        style={{ animation: "slideInRight 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#F5E6D3]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h2 className="font-display text-xl text-[#3C1810]">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-[#D4956A] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-[#F5E6D3] flex items-center justify-center text-[#8B4513] hover:bg-[#D4956A] hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-4 text-center">
              <span className="text-6xl animate-float">🛒</span>
              <p className="font-display text-xl text-[#3C1810]">Your cart is empty</p>
              <p className="text-[#8B4513]/60 text-sm">Add some items from the menu!</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setIsOpen(false); navigate("/menu"); }}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              <button
                onClick={clearCart}
                className="mt-3 text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
              >
                🗑️ Clear all items
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-[#F5E6D3] bg-[#FFF8F0]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-[#3C1810]">Subtotal</span>
              <span className="font-display text-2xl text-[#D4956A]">
                ₱{totalPrice.toFixed(2)}
              </span>
            </div>
            <Button fullWidth onClick={handleCheckout} size="lg">
              {user ? "Proceed to Checkout →" : "Sign in to Checkout"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
