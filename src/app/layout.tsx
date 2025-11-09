import { SpeedInsights } from "@vercel/speed-insights/next";
import { type ReactNode, Suspense } from "react";
import { Toaster } from "../components/ui/sonner";
import { SWRProvider } from "../providers/swr-provider";
import { ThemeProvider } from "../providers/theme-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" title="Blairify" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SWRProvider>
              <div className="flex flex-col min-h-screen">{children}</div>
              <Toaster />
            </SWRProvider>
          </ThemeProvider>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
