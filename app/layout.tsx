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

const LOGO_URL = "https://ascendoratalentsolutions.co.in/header.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ascendoratalentsolutions.co.in"),
  title: "Ascendora Talent Solutions | Trusted Recruitment & Staffing Partner",
  description:
    "Ascendora Talent Solutions provides recruitment and talent acquisition support connecting businesses with reliable, skilled professionals across industries — from fresh graduates to experienced hires.",
  authors: [{ name: "Ascendora Talent Solutions" }],
  keywords: [
    "Ascendora Talent Solutions",
    "staffing agency Dhanbad",
    "recruitment agency Jharkhand",
    "talent acquisition",
    "job placement",
    "candidate sourcing",
    "HR recruitment services",
    "hiring partner India",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  icons: {
    icon: LOGO_URL,
    shortcut: LOGO_URL,
    apple: LOGO_URL,
  },
  openGraph: {
    type: "website",
    url: "https://www.ascendoratalentsolutions.co.in/",
    siteName: "Ascendora Talent Solutions",
    locale: "en_IN",
    title: "Ascendora Talent Solutions | Trusted Recruitment & Staffing Partner",
    description:
      "Connecting the right talent with the right opportunities. Recruitment, workforce planning, employer branding, and HR analytics — since day one.",
    images: [{ url: LOGO_URL, alt: "Ascendora Talent Solutions logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascendora Talent Solutions | Trusted Recruitment & Staffing Partner",
    description:
      "Connecting the right talent with the right opportunities. Recruitment, workforce planning, employer branding, and HR analytics.",
    images: [LOGO_URL],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}