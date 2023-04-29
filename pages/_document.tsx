import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        <title>OpenLibry Bibliothek</title>
        <meta property="og:title" content="OpenLibry" key="OpenLibry" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
