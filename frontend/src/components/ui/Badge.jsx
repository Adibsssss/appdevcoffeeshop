import { BADGE_STYLES } from "../../data/products";

export default function Badge({ type, className = "" }) {
  const style = BADGE_STYLES[type];
  if (!style) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-800 ${style.bg} ${style.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
