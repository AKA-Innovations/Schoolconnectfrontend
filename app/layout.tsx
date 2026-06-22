import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "School Management System",
  description: "School Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
      style={{ '--font-outfit': 'Outfit, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' } as any}
    >
      <body className="h-full min-h-full flex flex-col overflow-hidden font-sans">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors theme="system" />
      </body>
    </html>
  );
}
