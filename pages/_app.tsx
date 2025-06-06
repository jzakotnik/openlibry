import "@/styles/globals.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { NotistackProvider } from "../components/layout/SnackbarProviderClient";
import theme from "../styles/theme";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NotistackProvider maxSnack={4} variant="success">
      <SessionProvider session={pageProps.session}>
        <ThemeProvider theme={theme}>
          {" "}
          <CssBaseline />
          <Head>
            <title>OpenLibry Bibliothek</title>
            <meta property="og:title" content="OpenLibry" key="OpenLibry" />
          </Head>
          <Component {...pageProps} />
        </ThemeProvider>
      </SessionProvider>
    </NotistackProvider>
  );
}
