import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useToast } from "../ui/Toast";
import Badge from "../ui/Badge";

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
    addToast(`${product.name} added to cart!`, "cart");
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div
      className={`
        relative bg-white rounded-3xl p-5 shadow-sm border-2 transition-all duration-300 flex flex-col
        ${
          product.available
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

      {/* Product Image */}
      <div className="w-full h-50 rounded-2xl bg-[#F5E6D3] mb-4 overflow-hidden flex-shrink-0">
        {PRODUCT_IMAGES[product.name] ? (
          <img
            src={PRODUCT_IMAGES[product.name]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#C4A882]"
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
                ${
                  inCart
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
