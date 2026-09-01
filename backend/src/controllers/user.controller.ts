import { Request, Response } from "express";
import { createUser, getUserById, listDoctors, updateUserStatus } from "../services/user.service";

const ALLOWED_ROLES = ["doctor", "admin", "reception"] as const;

export const registerUser = async (req: Request, res: Response) => {
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
    const normalizedDepartment = typeof department === "string" ? department.trim() : "";

    if (
      !normalizedName ||
      !normalizedEmail ||
      normalizedPassword.length < 8 ||
      !ALLOWED_ROLES.includes(normalizedRole as (typeof ALLOWED_ROLES)[number])
    ) {
      return res.status(400).json({
        message: "Invalid payload. name, email, password (min 8 chars), and a valid role are required.",
      });
    }

    if (normalizedRole === "doctor" && !normalizedDepartment) {
      return res.status(400).json({
        message: "Department is required when role is 'doctor'.",
      });
    }

    const user = await createUser({
      name: normalizedName,
      email: normalizedEmail,
      password: normalizedPassword,
      role: normalizedRole as (typeof ALLOWED_ROLES)[number],
      department: normalizedRole === "doctor" ? normalizedDepartment : null,
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    console.error("registerUser error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown internal server error";

    return res.status(500).json({ message: "Failed to create user", error: message });
  }
};

export const getDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await listDoctors();
    return res.json({ doctors });
  } catch (error) {
    console.error("getDoctors error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown internal server error";
    return res.status(500).json({ message: "Failed to fetch doctors", error: message });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("getUser error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown internal server error";
    return res.status(500).json({ message: "Failed to fetch user", error: message });
  }
};

export const patchUserStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const status = String((req.body as { status?: string }).status ?? "").trim().toLowerCase();
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Valid user id is required" });
    }
    if (status !== "active" && status !== "inactive") {
      return res.status(400).json({ message: "status must be active or inactive" });
    }
    if (req.user?.id === id && status === "inactive") {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const user = await updateUserStatus(id, status);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (error) {
    console.error("patchUserStatus error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown internal server error";
    return res.status(500).json({ message: "Failed to update user status", error: message });
  }
};
