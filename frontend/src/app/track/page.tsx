"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function TrackSearchPage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim().toUpperCase();
    if (trimmed) router.push(`/track/${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Activity className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Track Your Token</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your token number to view your live queue status.
          </p>
        </motion.div>

        <Card hover>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Token Number"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. DENT-001"
              icon={<Ticket className="h-4 w-4" />}
              required
            />
            <Button type="submit" size="lg" className="w-full" disabled={!token.trim()}>
              <Search className="h-4 w-4" />
              Track Status
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-slate-400">
          Received your token at reception?{" "}
          <Link href="/reception" className="font-medium text-blue-600 hover:underline">
            Go to reception
          </Link>
        </p>
      </div>
    </main>
  );
}
