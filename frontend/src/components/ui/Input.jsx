export default function Input({
  label,
  error,
  icon,
  iconRight,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-700 text-[#3C1810]">{label}</label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[#D4956A] text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-white border-2 rounded-2xl py-3 text-[#3C1810]
            placeholder:text-[#C4A882] font-medium transition-all duration-200
            focus:outline-none focus:ring-0
            ${error
              ? "border-red-400 focus:border-red-500"
              : "border-[#F5E6D3] focus:border-[#D4956A]"
            }
            ${icon ? "pl-10" : "pl-4"}
            ${iconRight ? "pr-10" : "pr-4"}
            ${className}
          `}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 text-[#D4956A] text-lg">
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 font-medium animate-slide-up">
          {error}
        </p>
      )}
    </div>
  );
}
