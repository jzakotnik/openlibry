import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "sonner";

import { t } from "@/lib/i18n";
import { setupDayjs } from "@/lib/i18n/dayjs";

// Activate the dayjs locale that matches OPENLIBRY_LOCALE. Runs once at
// module load (both server and client). Component-level side-effect
// imports of `dayjs/locale/de` are idempotent and do not override this.
setupDayjs();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>{t("app.title")}</title>
        <meta property="og:title" content="OpenLibry" key="OpenLibry" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="bottom-right" richColors />
    </SessionProvider>
  );
}
