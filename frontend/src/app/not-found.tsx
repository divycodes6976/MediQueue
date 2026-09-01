import Link from "next/link";
import { Activity, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
          <Activity className="h-7 w-7" />
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-slate-900">404</h1>
        <p className="mt-3 text-lg text-slate-600">Page not found</p>
        <p className="mt-1 text-sm text-slate-500">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign in
        </Link>
      </div>
    </main>
  );
}
