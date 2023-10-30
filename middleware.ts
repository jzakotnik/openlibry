import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
export default withAuth(
  function middleware(req: NextRequest) {
    //console.log("Middleware triggered with ", req);
    //set CSP headers
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
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        //console.log("Middleware request:", req);
        console.log("Middleware received the token:", token);
        console.log("Middleware caught path:", req.nextUrl.pathname);
        if (token === null && req.nextUrl.pathname != "/api/login/auth") {
          return false;
        }
        return true;
      },
    },
  }
);
