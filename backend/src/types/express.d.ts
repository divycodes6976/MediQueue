export type AppRole = "admin" | "doctor" | "reception";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AppRole;
  department: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
