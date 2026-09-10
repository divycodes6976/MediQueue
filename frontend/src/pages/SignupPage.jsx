import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Activity, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/contexts/AuthContext";
import { homeForRole } from "@/lib/auth";
import { DEPARTMENTS } from "@/lib/constants";
function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reception");
  const [department, setDepartment] = useState("DENT");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const user = await signup({
        name,
        email,
        password,
        role,
        department: role === "doctor" ? department : null
      });
      navigate(homeForRole(user.role), { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message;
        setError(message ?? "Could not create account.");
      } else {
        setError("Could not create account. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };
  return <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#eff6ff_0%,#f8fafc_42%,#fff_100%)] px-4 py-12">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-[-6rem] h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />
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
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-slate-900">Create staff account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign up as reception or doctor.
          </p>
        </div>

        <Card className="relative border-slate-200/90 p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
    label="Full name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="e.g. Dr. Anita Sharma"
    icon={<User className="h-4 w-4" />}
    required
  />
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
    minLength={8}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Min 8 characters"
    icon={<Lock className="h-4 w-4" />}
    required
  />
            <Select
    label="Role"
    value={role}
    onChange={(e) => setRole(e.target.value)}
    required
  >
              <option value="reception">Reception</option>
              <option value="doctor">Doctor</option>
            </Select>
            {role === "doctor" && <Select
    label="Department"
    value={department}
    onChange={(e) => setDepartment(e.target.value)}
    required
  >
                {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>
                    {d.label} ({d.code})
                  </option>)}
              </Select>}
            {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>}
            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
}
export default SignupPage;
