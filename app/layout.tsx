import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SolanaSpeakPay — Voice-Activated Crypto Payments",
  description:
    "Just speak your payment intent — AI handles everything else. A voice-activated cross-chain payment agent for Solana Mobile.",
  keywords: ["Solana", "voice payments", "crypto", "cross-chain", "accessibility"],
  openGraph: {
    title: "SolanaSpeakPay",
    description: "Voice-activated crypto payments on Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
