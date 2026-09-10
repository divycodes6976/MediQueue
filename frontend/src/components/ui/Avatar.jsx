import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
};

export function Avatar({ name, size = "md", className }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = ((parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "")).toUpperCase();

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white shadow-sm",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
