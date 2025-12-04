import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cool Shot Systems Chat",
  description: "AI Chat Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-black text-white">{children}</body>
    </html>
  );
}
