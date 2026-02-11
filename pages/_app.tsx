import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { NotistackProvider } from "../components/layout/SnackbarProviderClient";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NotistackProvider maxSnack={4} variant="success">
      <SessionProvider session={pageProps.session}>
        <Head>
          <title>OpenLibry Bibliothek</title>
          <meta property="og:title" content="OpenLibry" key="OpenLibry" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </NotistackProvider>
  );
}
