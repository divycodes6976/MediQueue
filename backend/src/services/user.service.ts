import { db } from "../config/db";
import { users } from "../config/schema";
import { and, eq, sql } from "drizzle-orm";
import { hashPassword, toAuthUser } from "./auth.service";
import type { AppRole, AuthUser } from "../types/express";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: AppRole;
  department: string | null;
};

function publicUser(user: AuthUser) {
  return user;
}

export const createUser = async (input: CreateUserInput): Promise<AuthUser> => {
  const email = input.email.trim().toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("EMAIL_TAKEN");
  }

  const passwordHash = await hashPassword(input.password);
  const result = await db
    .insert(users)
    .values({
      name: input.name,
      email,
      passwordHash,
      role: input.role,
      department: input.department,
      status: "active",
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
    });

  const user = toAuthUser(result[0]);
  if (!user) throw new Error("Failed to create user");
  return publicUser(user);
};

export const listDoctors = async () => {
  return db
    .select({
      id: users.id,
      name: users.name,
      department: users.department,
    })
    .from(users)
    .where(and(eq(users.role, "doctor"), sql`coalesce(${users.status}, 'active') = 'active'`));
};

export const updateUserStatus = async (id: number, status: "active" | "inactive") => {
  const updated = await db
    .update(users)
    .set({ status })
    .where(eq(users.id, id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
      status: users.status,
    });
  return updated[0] ?? null;
};

export const getUserById = async (id: number) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      department: users.department,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  const row = result[0];
  if (!row) return null;
  return toAuthUser(row);
};
