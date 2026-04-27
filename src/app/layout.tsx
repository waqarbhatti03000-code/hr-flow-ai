import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "HR Flow AI — AI-powered HR for SMEs",
  description:
    "Automate job descriptions, org design, and compensation with an AI-powered HR toolkit built for SMEs in Pakistan and global remote teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
