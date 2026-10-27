import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "B-Global Network",
    template: "%s | B-Global Network"
  },
  description:
    "B-Global Network: Öğrenciler için Erasmus+, staj, gönüllülük, burs ve yaz okulu gibi uluslararası fırsatları keşfet."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className={`min-h-dvh antialiased ${inter.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
