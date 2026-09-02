import { USAGE_CONTEXT } from "@/lib/config/usageContext";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  //const nonce = randomBytes(128).toString("base64");
  //const csp = `object-src 'none'; base-uri 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http: 'nonce-${nonce}' 'strict-dynamic'`;

  //const nonce = randomBytes(128).toString("base64");
  //const csp = `object-src 'none'; base-uri 'none'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https: http: 'nonce-${nonce}' 'strict-dynamic'`;

  return (
    <Html lang="de">
      <Head>
        {/*
          Carries the server-resolved USAGE_CONTEXT to the client before any
          bundle code runs. USAGE_CONTEXT has no NEXT_PUBLIC_ prefix, so the
          client bundle can't read it directly — without this bridge it
          would fall back to the "school" default and cause a hydration
          mismatch, especially for prebuilt Docker images where env vars are
          only set at container runtime, not at `next build` time.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__OPENLIBRY_USAGE_CONTEXT__=${JSON.stringify(USAGE_CONTEXT)}`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
