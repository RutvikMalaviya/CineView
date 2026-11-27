import type { Metadata } from "next";
import { Geist, Syne } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CineView — Choose Your Seat. Experience Your View.",
  description:
    "Interactive 3D cinema seat selection and real-time auditorium perspective simulator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${syne.variable} ${geist.variable}`}>
      <body className="min-h-screen antialiased selection:bg-[#A78BFA]/30 flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
