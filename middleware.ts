export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Protect main app pages and API routes, but NOT login/signup/auth/public assets
    "/",
    "/history",
    "/analysis/:path*",
    "/api/upload/:path*",
    "/api/analyze",
    "/api/analyses/:path*",
    "/api/export",
  ],
};
