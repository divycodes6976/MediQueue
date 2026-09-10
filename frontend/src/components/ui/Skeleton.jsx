import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
function Skeleton({ className }) {
  return /* @__PURE__ */ jsx("div", { className: cn("skeleton-shimmer rounded-lg", className), "aria-hidden": true });
}
function KpiCardSkeleton() {
  return /* @__PURE__ */ jsx("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-16" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-20" })
    ] }),
    /* @__PURE__ */ jsx(Skeleton, { className: "h-11 w-11 rounded-xl" })
  ] }) });
}
function TableRowSkeleton({ cols = 4 }) {
  return /* @__PURE__ */ jsx("tr", { children: Array.from({ length: cols }).map((_, i) => /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }) }, i)) });
}
export {
  KpiCardSkeleton,
  Skeleton,
  TableRowSkeleton
};
