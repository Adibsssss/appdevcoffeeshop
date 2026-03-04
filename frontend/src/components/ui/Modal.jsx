import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const SIZES = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full ${SIZES[size]} animate-pop-in`}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F5E6D3]">
            <h2 className="text-xl font-display text-[#3C1810]">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F5E6D3] flex items-center justify-center text-[#8B4513] hover:bg-[#D4956A] hover:text-white transition-all"
            >
              ✕
            </button>
          </div>
        )}
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
