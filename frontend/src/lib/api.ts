import axios from "axios";

/** Same-origin /proxy rewrite → backend, so Set-Cookie Path=/ is stored on this app. */
export const api = axios.create({
  baseURL: "/proxy",
  withCredentials: true,
});

export function streamUrl(department: string) {
  return `/proxy/queue/stream/${encodeURIComponent(department)}`;
}

export function trackUrl(tokenNumber: string) {
  return `/token/track/${encodeURIComponent(tokenNumber)}`;
}

export function waitingUrl(department: string) {
  return `/queue/waiting/${encodeURIComponent(department)}`;
}
