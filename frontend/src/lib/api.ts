import axios from "axios";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001"
).replace(/\/$/, "");

export const AUTH_TOKEN_KEY = "mediqueue_token";
export const AUTH_USER_KEY = "mediqueue_user";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
