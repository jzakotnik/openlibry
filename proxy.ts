import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  function proxy(req: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const cspHeader = `
    default-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline';
    script-src 'self'  'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline' 'unsafe-eval';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

    const requestHeaders = new Headers(req.headers);
    if (process.env.SECURITY_HEADERS != "insecure") {
      requestHeaders.set("x-nonce", nonce);
      requestHeaders.set(
        "Content-Security-Policy",
        cspHeader.replace(/\s{2,}/g, " ").trim(),
      );
    }

    return NextResponse.next({
      headers: requestHeaders,
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;

        // Routes explicitly excluded from authentication.
        // Keep this list narrow — every entry here is a public attack surface.
        const isPublicRoute =
          pathname === "/publicbookview" ||
          pathname === "/catalog" ||
          pathname.startsWith("/api/images") ||
          pathname === "/api/version" ||
          pathname.startsWith("/api/public/");

        if (isPublicRoute) return true;

        if (
          token === null &&
          pathname !== "/auth/login" &&
          pathname !== "/auth/error" &&
          process.env.AUTH_ENABLED == "true"
        ) {
          return false;
        }

        return true;
      },
    },
  },
);
