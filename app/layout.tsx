import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from "sonner";
import { NotificationManager } from "@/components/shared/NotificationManager";
export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "EchoCampus",
  },
  description: "Campus Marketplace and Complaints",
  manifest: "/manifest.json",
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
        <NotificationManager />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
