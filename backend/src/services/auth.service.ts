import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { users } from "../config/schema";
import { signAuthToken } from "../middleware/auth";
import type { AppRole, AuthUser } from "../types/express";

const SALT_ROUNDS = 10;

const isAppRole = (value: string): value is AppRole =>
  value === "admin" || value === "doctor" || value === "reception";

export function toAuthUser(row: {
  id: number;
  name: string;
  email: string | null;
  role: string;
  department: string | null;
}): AuthUser | null {
  const email = (row.email ?? "").trim().toLowerCase();
  if (!email || !isAppRole(row.role)) return null;
  return {
    id: row.id,
    name: row.name,
    email,
    role: row.role,
    department: row.department,
  };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function loginWithEmailPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { ok: false as const, status: 400, message: "Email and password are required" };
  }

  const rows = await db
    .select({
      
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
      department: users.department,
      status: users.status,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  const row = rows[0];
  if (!row?.passwordHash) {
    return { ok: false as const, status: 401, message: "Invalid email or password" };
  }

  const matches = await bcrypt.compare(password, row.passwordHash);
  if (!matches) {
    return { ok: false as const, status: 401, message: "Invalid email or password" };
  }

  if ((row.status ?? "active") !== "active") {
    return { ok: false as const, status: 403, message: "This account is inactive. Contact an administrator." };
  }

  const user = toAuthUser(row);
  if (!user) {
    return { ok: false as const, status: 401, message: "Invalid email or password" };
  }

  return {
    ok: true as const,
    token: signAuthToken(user),
    user,
  };
}
