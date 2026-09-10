import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

export function KpiCard({ title, value, icon: Icon, trend, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative min-h-[132px] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42_/_0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_6px_18px_rgb(15_23_42_/_0.06)]"
    >
      <div
        className={cn("absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-[0.07] blur-2xl transition-opacity group-hover:opacity-[0.13]", gradient)}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium tracking-[0.01em] text-slate-500">{title}</p>
          <p className="mt-2 text-[30px] font-semibold leading-none tracking-[-0.035em] text-slate-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              {trend.positive !== false ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={trend.positive !== false ? "text-emerald-600" : "text-red-600"}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow-sm", gradient)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
