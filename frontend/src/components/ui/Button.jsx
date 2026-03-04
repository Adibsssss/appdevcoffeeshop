const VARIANTS = {
  primary:
    "bg-[#D4956A] hover:bg-[#C07A50] text-white shadow-md hover:shadow-lg active:scale-95",
  secondary:
    "bg-[#FFF8F0] hover:bg-[#F5E6D3] text-[#8B4513] border-2 border-[#D4956A] active:scale-95",
  danger:
    "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg active:scale-95",
  ghost:
    "bg-transparent hover:bg-[#F5E6D3] text-[#8B4513] active:scale-95",
  success:
    "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-95",
  dark:
    "bg-[#3C1810] hover:bg-[#5a2518] text-white shadow-md hover:shadow-lg active:scale-95",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-base rounded-2xl",
  lg: "px-7 py-3.5 text-lg rounded-2xl",
  xl: "px-10 py-4 text-xl rounded-2xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={`
        font-bold transition-all duration-200 flex items-center justify-center gap-2
        cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
          {iconRight && <span>{iconRight}</span>}
        </>
      )}
    </button>
  );
}
