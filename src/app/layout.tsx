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
  title: "Brodle - Ond Wordle på Svenska",
  description: "Ett ondskefullt ordspel som undviker dina gissningar. Begränsa möjligheterna tills bara ett ord återstår!",
  keywords: ["wordle", "absurdle", "ond wordle", "ordspel", "pussel", "brodle", "svenska"],
  openGraph: {
    title: "Brodle - Ond Wordle på Svenska",
    description: "Ett ondskefullt ordspel som undviker dina gissningar. Begränsa möjligheterna tills bara ett ord återstår!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brodle - Ond Wordle på Svenska",
    description: "Ett ondskefullt ordspel som undviker dina gissningar. Begränsa möjligheterna tills bara ett ord återstår!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
