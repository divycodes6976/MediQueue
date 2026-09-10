import axios from "axios";

export const api = axios.create({
  baseURL: "/proxy",
  withCredentials: true,
});

export function streamUrl(department) {
  return `/proxy/queue/stream/${encodeURIComponent(department)}`;
}

export function trackUrl(tokenNumber) {
  return `/token/track/${encodeURIComponent(tokenNumber)}`;
}

export function waitingUrl(department) {
  return `/queue/waiting/${encodeURIComponent(department)}`;
}
