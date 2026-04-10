import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

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
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className="h-full min-h-full flex flex-col overflow-hidden font-sans">
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors theme="system" />
      </body>
    </html>
  );
}
