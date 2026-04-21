import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { FirebaseClientProvider } from "@/firebase/client-provider";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: "DailyPulse | Mental Wellness Companion",
  description: "Your daily companion for mood tracking and emotional wellness.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DailyPulse",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#4D5EA3",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <FirebaseClientProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}