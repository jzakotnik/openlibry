import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../styles/theme";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      {" "}
      <CssBaseline />
      <Head>
        <title>OpenLibry Bibliothek</title>
        <meta property="og:title" content="OpenLibry" key="OpenLibry" />
      </Head>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
