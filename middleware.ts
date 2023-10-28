import { NextRequest, NextResponse } from "next/server";

export default function middleware(req: NextRequest) {
  //console.log("Middleware triggered with ", req);
  //set CSP headers
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline';
    script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval';
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
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Content-Security-Policy",
    // Replace newline characters and spaces
    cspHeader.replace(/\s{2,}/g, " ").trim()
  );
  if (req.nextUrl.pathname == "/admin") {
    //console.log("Admin page fetched");

    return new NextResponse("No admin", {
      status: 400,
    });
  }
  return NextResponse.next({
    headers: requestHeaders,
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
