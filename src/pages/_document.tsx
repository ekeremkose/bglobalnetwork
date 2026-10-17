import { Head, Html, Main, NextScript } from "next/document";

/**
 * Required for Next to compile `pages/_document.js` (dev overlay / internal pages bundle).
 * Main UI remains App Router (`src/app`).
 */
export default function Document() {
  return (
    <Html lang="tr">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
