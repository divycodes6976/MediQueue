import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loader({ size = "md", className, label }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)} role="status">
      <Loader2 className={cn("animate-spin text-blue-600", sizes[size])} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
      <span className="sr-only">{label ?? "Loading"}</span>
    </div>
  );
}
