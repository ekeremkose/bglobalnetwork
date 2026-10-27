import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import "./../styles/globals.css";

const inter = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
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
    <html lang="tr" className={`${inter.variable} ${serif.variable}`}>
      <body className={`min-h-dvh antialiased ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
