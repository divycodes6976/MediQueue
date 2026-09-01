import { Request, Response } from "express";
import { getStaffAlerts, searchStaffDirectory } from "../services/search.service";
import { getAllWaiting } from "../services/queue.service";

export async function searchDirectory(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const q = String(req.query.q ?? "");
    const data = await searchStaffDirectory(q, req.user.role, req.user.department);
    return res.json(data);
  } catch (error) {
    console.error("searchDirectory error:", error);
    return res.status(500).json({ message: "Search failed" });
  }
}

export async function listAlerts(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const alerts = await getStaffAlerts(req.user.role, req.user.department);
    return res.json({ alerts });
  } catch (error) {
    console.error("listAlerts error:", error);
    return res.status(500).json({ message: "Failed to load alerts" });
  }
}

export async function listAllWaiting(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const queue = await getAllWaiting();
    return res.json({ queue });
  } catch (error) {
    console.error("listAllWaiting error:", error);
    return res.status(500).json({ message: "Failed to load queue" });
  }
}
