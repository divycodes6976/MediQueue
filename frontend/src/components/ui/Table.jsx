import { cn } from "@/lib/cn";

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200">
      <table className={cn("w-full min-w-[640px] text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("bg-slate-50/80", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("divide-y divide-slate-100", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return <tr className={cn("transition-colors hover:bg-slate-50/60", className)} {...props} />;
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return <td className={cn("px-4 py-3.5 text-slate-700", className)} {...props} />;
}
