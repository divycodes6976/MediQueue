"use client";
import { jsx } from "react/jsx-runtime";
import { cn } from "@/lib/cn";
function Tabs({ tabs, active, onChange, className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1", className),
      role: "tablist",
      children: tabs.map((tab) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": active === tab.id,
          onClick: () => onChange(tab.id),
          className: cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
            active === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
          ),
          children: tab.label
        },
        tab.id
      ))
    }
  );
}
export {
  Tabs
};
