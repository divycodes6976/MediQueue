import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AppRole, AuthUser } from "../types/express";

const isAppRole = (value: string): value is AppRole =>
  value === "admin" || value === "doctor" || value === "reception";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set");
  }
  return "mediqueue-dev-jwt-secret";
}

export function signAuthToken(user: AuthUser): string {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    getJwtSecret(),
    { expiresIn: "12h" }
  );
}

function readBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    return token || null;
  }
  return null;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded !== "object" || decoded === null) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const id = Number(decoded.sub);
    const role = String(decoded.role ?? "");
    const email = String(decoded.email ?? "").trim().toLowerCase();
    const name = String(decoded.name ?? "").trim();

    if (!Number.isInteger(id) || id <= 0 || !isAppRole(role) || !email || !name) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id,
      name,
      email,
      role,
      department: typeof decoded.department === "string" ? decoded.department : null,
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function authorize(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }
    return next();
  };
}
