import type { AppProps } from "next/app";

/**
 * Minimal Pages Router shell so Next can emit `pages/_app.js` in `.next/server/pages/`.
 * App Router routes live under `src/app/`; we do not add page routes here.
 */
export default function PagesApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
