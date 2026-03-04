import { CATEGORIES } from "../../data/products";

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm whitespace-nowrap
            transition-all duration-200 flex-shrink-0
            ${
              active === cat.id
                ? "bg-[#D4956A] text-white shadow-md scale-105"
                : "bg-white text-[#8B4513] border-2 border-[#F5E6D3] hover:border-[#D4956A]"
            }
          `}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
