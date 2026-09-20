/** Cross-site (Vercel frontend → Render API) needs SameSite=None; Secure. */
function authCookieOptions() {
  const crossSite =
    process.env.NODE_ENV === "production" || Boolean(process.env.FRONTEND_ORIGIN);
  return {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
  };
}

module.exports = { authCookieOptions };
