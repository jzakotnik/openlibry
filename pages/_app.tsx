import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>OpenLibry Bibliothek</title>
        <meta property="og:title" content="OpenLibry" key="OpenLibry" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="bottom-right" richColors />
    </SessionProvider>
  );
}
