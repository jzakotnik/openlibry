import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
export default withAuth(
  function middleware(req: NextRequest) {
    //console.log("Middleware triggered with ", req);
    //set CSP headers
    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    //console.log("Nonce", nonce);
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
      ////console.log("Admin page fetched");

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
        //console.log("Middleware received the token:", token);
        //console.log("Middleware caught path:", req.nextUrl.pathname);
        //console.log("Middleware role:", req.headers);
        //we need the auth endpoint do be without authorization available

        /*console.log(
          "Do we have authorization enabled?",
          process.env.AUTH_ENABLED
        );*/
        //I think we don't need the endpoint since everything is handled in the ..nextAuth.ts
        if (
          token === null &&
          req.nextUrl.pathname != "/auth/login" &&
          req.nextUrl.pathname != "/auth/error" &&
          process.env.AUTH_ENABLED == "true"
        ) {
          //console.log("Middleware: not authorized");
          //if (token === null) {
          return false;
        }
        //console.log("Middleware:  authorized");
        return true;
      },
    },
  }
);
