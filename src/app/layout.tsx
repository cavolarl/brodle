import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brodle - Evil Word Game",
  description: "An adversarial word game that avoids your guesses. Narrow down the possibilities until only one word remains!",
  keywords: ["wordle", "absurdle", "evil wordle", "word game", "puzzle", "brodle", "adversarial"],
  openGraph: {
    title: "Brodle - Evil Word Game",
    description: "An adversarial word game that avoids your guesses. Narrow down the possibilities until only one word remains!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brodle - Evil Word Game",
    description: "An adversarial word game that avoids your guesses. Narrow down the possibilities until only one word remains!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
