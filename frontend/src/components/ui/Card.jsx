import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-8",
};

export const Card = forwardRef(function Card(
  { className, hover, padding = "md", children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_rgb(15_23_42_/_0.06)]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-4 flex items-center justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-[17px] font-semibold tracking-[-0.015em] text-slate-900", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-6 text-slate-500", className)} {...props} />;
}
