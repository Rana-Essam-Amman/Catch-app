import type { Metadata } from "next";
import { Inter, Newsreader, Tajawal } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Catch — THE DEAL",
  description: "Catch classifieds for Jordan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#fbf9f6] text-[#231F20]">{children}</body>
    </html>
  );
}
