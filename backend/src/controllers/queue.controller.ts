import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/db";
import { tokens } from "../config/schema";
import { callNext, completeToken } from "../services/queue.service";

export const callNextPatient = async (req: Request, res: Response) => {
  const requestedDepartment =
    typeof req.body?.department === "string" ? req.body.department.trim().toUpperCase() : "";

  const department =
    req.user?.role === "doctor"
      ? (req.user.department ?? "").trim().toUpperCase()
      : requestedDepartment;

  if (!department) {
    return res.status(400).json({ message: "department is required" });
  }

  if (
    req.user?.role === "doctor" &&
    requestedDepartment &&
    requestedDepartment !== department
  ) {
    return res.status(403).json({ message: "You can only call patients in your department" });
  }

  const token = await callNext(department);
  if (!token) {
    return res.status(404).json({ message: "No patients in queue" });
  }

  res.json({ message: "Next patient called", token });
};

export const completeOrSkip = async (req: Request, res: Response) => {
  try {
    const { tokenId, action } = req.body;
    const normalizedTokenId = Number(tokenId);

    if (!Number.isInteger(normalizedTokenId) || normalizedTokenId <= 0) {
      return res.status(400).json({ message: "Valid tokenId is required" });
    }

    if (action !== "DONE" && action !== "SKIPPED") {
      return res.status(400).json({ message: "action must be DONE or SKIPPED" });
    }

    if (req.user?.role === "doctor") {
      const doctorDept = (req.user.department ?? "").trim().toUpperCase();
      const existing = await db
        .select({ department: tokens.department })
        .from(tokens)
        .where(eq(tokens.id, normalizedTokenId))
        .limit(1);
      const tokenDept = (existing[0]?.department ?? "").trim().toUpperCase();
      if (!existing[0] || tokenDept !== doctorDept) {
        return res.status(403).json({ message: "You can only update tokens in your department" });
      }
    }

    const result = await completeToken(normalizedTokenId, action);

    if (!result) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown internal server error";
    res.status(500).json({ message: "Failed to complete token", error: message });
  }
};
