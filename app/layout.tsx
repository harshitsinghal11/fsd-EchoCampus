import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "sonner";
export const metadata: Metadata = {
  title: {
    template: "%s | EchoCampus", 
    default: "EchoCampus",      
  },
  description: "Campus Marketplace and Complaints",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Toaster position="top-center" richColors />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
