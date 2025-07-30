import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "tiptag - The Future of Creator Support",
  description:
    "Create stunning tip pages, track your growth with powerful analytics, set funding goals, and build deeper connections with your audience.",
  keywords:
    "creator tips, blockchain payments, Base network, creator economy, digital tips",
  openGraph: {
    title: "tiptag - The Future of Creator Support",
    description:
      "Create stunning tip pages, track your growth with powerful analytics, set funding goals, and build deeper connections with your audience.",
    url: "https://tiptag.vercel.app",
    siteName: "tiptag",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "tiptag - Creator Support Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "tiptag - The Future of Creator Support",
    description:
      "Create stunning tip pages, track your growth with powerful analytics, set funding goals, and build deeper connections with your audience.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
