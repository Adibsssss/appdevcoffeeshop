import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../ui/Toast";
import Badge from "../ui/Badge";

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const { addToast } = useToast();
  const [adding, setAdding] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);
  const inCart = cartItem?.quantity > 0;

  const handleAdd = () => {
    if (!product.available) return;
    setAdding(true);
    addItem(product);
    addToast(`${product.emoji} ${product.name} added to cart!`, "cart");
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      className={`
        relative bg-white rounded-3xl p-5 shadow-sm border-2 transition-all duration-300 flex flex-col
        ${product.available
          ? "border-[#F5E6D3] hover:border-[#D4956A] hover:shadow-md hover:-translate-y-1"
          : "border-gray-200 opacity-60"
        }
      `}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 right-4">
          <Badge type={product.badge} />
        </div>
      )}

      {/* Emoji */}
      <div
        className={`
          w-16 h-16 rounded-2xl bg-[#FFF8F0] flex items-center justify-center text-4xl mb-4 mx-auto
          ${product.available ? "group-hover:animate-wiggle" : ""}
          ${adding ? "animate-bounce-in" : ""}
        `}
      >
        {product.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-display text-lg text-[#3C1810] mb-1 leading-tight">
          {product.name}
        </h3>
        <p className="text-xs text-[#8B4513]/70 font-medium mb-3 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price + Add */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-display text-[#D4956A]">
            ₱{product.price.toFixed(2)}
          </span>

          {product.available ? (
            <button
              onClick={handleAdd}
              className={`
                w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-200
                ${inCart
                  ? "bg-[#D4956A] text-white"
                  : "bg-[#F5E6D3] text-[#8B4513] hover:bg-[#D4956A] hover:text-white"
                }
                ${adding ? "scale-125" : "active:scale-90"}
              `}
            >
              {inCart ? `${cartItem.quantity}` : "+"}
            </button>
          ) : (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
