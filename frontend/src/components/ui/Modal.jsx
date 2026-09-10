"use client";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/cn";
const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg"
};
function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md"
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  return /* @__PURE__ */ jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "absolute inset-0 bg-slate-900/40 backdrop-blur-sm",
        onClick: onClose,
        "aria-hidden": true
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": "modal-title",
        initial: { opacity: 0, scale: 0.96, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
        transition: { duration: 0.2 },
        className: cn(
          "relative w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl",
          sizes[size]
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { id: "modal-title", className: "text-lg font-semibold text-slate-900", children: title }),
              description && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-slate-500", children: description })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
              }
            )
          ] }),
          children && /* @__PURE__ */ jsx("div", { className: "mb-4", children }),
          footer ?? /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }) })
        ]
      }
    )
  ] }) });
}
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  loading
}) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      open,
      onClose,
      title,
      description,
      footer: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: onClose, disabled: loading, children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { variant, onClick: onConfirm, loading, children: confirmLabel })
      ] })
    }
  );
}
export {
  ConfirmModal,
  Modal
};
