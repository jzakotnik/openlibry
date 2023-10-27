import "@/styles/globals.css";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";
import theme from "../styles/theme";

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
