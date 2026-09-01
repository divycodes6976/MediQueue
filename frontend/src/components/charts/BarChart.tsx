"use client";

import { motion } from "framer-motion";

type BarChartProps = {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
};

export function BarChart({ data, maxValue, height = 180 }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height }}>
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 4)}%` }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
              className="w-full max-w-12 rounded-t-lg"
              style={{ backgroundColor: item.color ?? "#2563eb" }}
            />
            <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
            <span className="text-xs font-semibold text-slate-700">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
