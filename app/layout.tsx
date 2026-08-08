import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { SkipLink } from "@/components/layout/SkipLink";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  // metadataBase lets relative OG image URLs (e.g. /api/og/<cardId>) resolve to absolute ones.
  metadataBase: new URL(baseUrl),
  title: {
    default: "Event Craft | Interactive Celebration Cards",
    template: "%s | Event Craft",
  },
  description:
    "Design and share interactive celebration cards, invitations and mini-app experiences for birthdays, weddings, holidays and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
