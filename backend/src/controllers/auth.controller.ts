import { Request, Response } from "express";
import { createUser } from "../services/user.service";
import { loginWithEmailPassword } from "../services/auth.service";
import { signAuthToken } from "../middleware/auth";
import type { AppRole } from "../types/express";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const result = await loginWithEmailPassword(String(email ?? ""), String(password ?? ""));
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.json({ token: result.token, user: result.user });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, department } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      department?: string | null;
    };

    const normalizedName = String(name ?? "").trim();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const normalizedPassword = String(password ?? "");
    const normalizedRole = String(role ?? "").trim().toLowerCase();
    const normalizedDepartment = typeof department === "string" ? department.trim().toUpperCase() : "";

    const allowed: AppRole[] = ["doctor", "reception"];
    if (
      !normalizedName ||
      !normalizedEmail ||
      normalizedPassword.length < 8 ||
      !allowed.includes(normalizedRole as AppRole)
    ) {
      return res.status(400).json({
        message: "Name, email, password (min 8 chars), and role (reception or doctor) are required.",
      });
    }

    if (normalizedRole === "doctor" && !normalizedDepartment) {
      return res.status(400).json({ message: "Department is required for doctors." });
    }

    const user = await createUser({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      role: normalizedRole as AppRole,
      department: normalizedRole === "doctor" ? normalizedDepartment : null,
    });

    return res.status(201).json({
      token: signAuthToken(user),
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return res.status(409).json({ message: "An account with this email already exists. Sign in instead." });
    }
    console.error("signup error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  return res.json({ user: req.user });
};
