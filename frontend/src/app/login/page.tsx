"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Activity, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { homeForRole } from "@/lib/auth";

const DEMO_ACCOUNTS = [
  { role: "Reception", email: "reception@mediqueue.local" },
  { role: "Doctor (Dental)", email: "rohan@mediqueue.local" },
];

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.replace(homeForRole(user.role));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        setError(message ?? "Invalid email or password.");
      } else {
        setError("Unable to sign in. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,#f8fafc_42%,#fff_100%)] px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Activity className="h-7 w-7" />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">MediQueue workspace</p>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-slate-900">Staff sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Role-based access for reception and doctors.
          </p>
        </div>

        <Card className="relative border-slate-200/90 p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@hospital.local"
              icon={<Mail className="h-4 w-4" />}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              required
            />
            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-600">
          New staff?{" "}
          <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white/80 p-4 text-left text-sm shadow-[0_1px_2px_rgb(15_23_42_/_0.03)]">
          <p className="font-semibold text-slate-800">Demo accounts</p>
          <p className="mt-1 text-xs text-slate-500">
            Password for all: <span className="font-mono text-slate-700">Password123</span>
          </p>
          <ul className="mt-3 space-y-1.5 text-slate-600">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email} className="flex flex-col sm:flex-row sm:justify-between">
                <span>{account.role}</span>
                <button
                  type="button"
                  className="text-left font-mono text-xs text-blue-600 hover:underline sm:text-right"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("Password123");
                  }}
                >
                  {account.email}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Patient?{" "}
          <Link href="/track" className="font-medium text-blue-600 hover:underline">
            Track your token
          </Link>
          {" · "}
          <Link href="/display" className="font-medium text-blue-600 hover:underline">
            Display board
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
