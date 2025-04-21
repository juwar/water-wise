import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Berair - Water Meter Management",
  description: "A water meter management system",
};

import { routes } from 'next-routes-list'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('routes =>', routes)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <SessionProvider>
            {children}
        </SessionProvider>
      </body>
    </html>
  );
}
