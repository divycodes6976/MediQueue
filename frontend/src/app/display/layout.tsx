import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MediQueue · Live Board",
  description: "Real-time hospital queue display board",
};

export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 overflow-y-auto bg-slate-50">{children}</div>;
}
