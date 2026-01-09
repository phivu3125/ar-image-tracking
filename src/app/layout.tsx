import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MindAR Next.js Demo",
  description: "AR Image Tracking with MindAR.js and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
