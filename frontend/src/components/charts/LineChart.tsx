"use client";

import { motion } from "framer-motion";

type LineChartProps = {
  data: { label: string; value: number }[];
  height?: number;
};

export function LineChart({ data, height = 120 }: LineChartProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / max) * (height - 20) - 10;
    return `${x},${y}`;
  });

  const areaPoints = `${points.join(" ")} ${width},${height} 0,${height}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          points={areaPoints}
          fill="url(#lineGradient)"
        />
        <motion.polyline
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          points={points.join(" ")}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - (d.value / max) * (height - 20) - 10;
          return (
            <motion.circle
              key={d.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              cx={x}
              cy={y}
              r="2.5"
              fill="#2563eb"
            />
          );
        })}
      </svg>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}
