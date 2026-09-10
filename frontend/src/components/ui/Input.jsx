import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef(function Input(
  { className, label, error, icon, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-[11px] border bg-white text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42_/_0.02)]",
            "placeholder:text-slate-400 transition-all duration-200",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            icon ? "pl-10 pr-4" : "px-4",
            error ? "border-red-300" : "border-slate-200",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
