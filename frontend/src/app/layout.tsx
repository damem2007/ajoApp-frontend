import { SessionProvider } from "@/providers/session-provider";
import { ToastProvider } from "@/providers/toast-provider";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Ajo | Your people. Your circle.",
  description: "Rotating savings circles with clear commitments.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/assets/manifest.webmanifest" />
        <meta name="theme-color" content="#145343" />
        <link rel="stylesheet" href="/assets/marketplace-fonts.css" />
        <link rel="stylesheet" href="/assets/marketplace-theme.css" />
      </head>
      <body>
        <ToastProvider>
          <SessionProvider>{children}</SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
