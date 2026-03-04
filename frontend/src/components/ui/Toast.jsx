import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

const TOAST_STYLES = {
  success: { bg: "bg-emerald-500", icon: "✅" },
  error: { bg: "bg-red-500", icon: "❌" },
  info: { bg: "bg-blue-500", icon: "ℹ️" },
  cart: { bg: "bg-[#D4956A]", icon: "🛒" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.success;
          return (
            <div
              key={toast.id}
              className={`
                ${style.bg} text-white px-5 py-3 rounded-2xl shadow-lg
                flex items-center gap-3 font-semibold text-sm animate-slide-up
                min-w-[250px]
              `}
            >
              <span>{style.icon}</span>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
