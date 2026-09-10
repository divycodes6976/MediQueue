import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Textarea = forwardRef(function Textarea(
  { className, label, error, id, ...props },
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
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          "min-h-[100px] w-full resize-y rounded-[11px] border bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42_/_0.02)]",
          "placeholder:text-slate-400 transition-all duration-200",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          error ? "border-red-300" : "border-slate-200",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});
