import { SpeedInsights } from "@vercel/speed-insights/next";
import { type ReactNode, Suspense } from "react";
import { Toaster } from "../components/ui/sonner";
import { SWRProvider } from "../providers/swr-provider";
import { ThemeProvider } from "../providers/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Lora, Noto_Sans } from "next/font/google";
import LoadingPage from "@/components/common/organisms/loading-page";

const headingFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading-var",
});

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-var",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://enterprise.blairify.com",
  ),

  title: {
    default: "Blairify - Master Your Job Interview Skills | Practice & Prepare",
    template: "%s | Blairify",
  },
  description:
    "Ace your next job interview with Blairify's comprehensive practice platform. Access 1000+ interview questions, expert feedback, and personalized preparation tools.",

  applicationName: "Blairify",
  authors: [{ name: "Blairify Team" }],
  generator: "Next.js",
  keywords: [
    "job interview preparation",
    "interview questions",
    "interview practice",
    "mock interviews",
    "career preparation",
    "job search",
    "interview skills",
    "interview coaching",
  ],

  referrer: "origin-when-cross-origin",

  creator: "Blairify",
  publisher: "Blairify",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Blairify Enterprise",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://enterprise.blairify.com",
    languages: {
      "en-US": "https://enterprise.blairify.com",
    },
  },

  // Category
  category: "education",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" title="Blairify" suppressHydrationWarning>
      <head />
      <body
        className={`${bodyFont.variable} ${headingFont.variable} font-sans antialiased h-screen overflow-hidden bg-background text-foreground`}
      >
        <Suspense fallback={<LoadingPage />}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SWRProvider>
              {children}
              <Toaster />
            </SWRProvider>
          </ThemeProvider>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
