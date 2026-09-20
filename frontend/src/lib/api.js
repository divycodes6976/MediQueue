import axios from "axios";

/** Local Vite uses `/proxy`. Production needs `VITE_API_URL` (your live backend). */
const API_BASE =
  String(import.meta.env.VITE_API_URL ?? "")
    .trim()
    .replace(/\/$/, "") || "/proxy";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export function streamUrl(department) {
  return `${API_BASE}/queue/stream/${encodeURIComponent(department)}`;
}

export function trackUrl(tokenNumber) {
  return `/token/track/${encodeURIComponent(tokenNumber)}`;
}

export function waitingUrl(department) {
  return `/queue/waiting/${encodeURIComponent(department)}`;
}
