import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pont Pont Bag Shop | ပုံ့ပုံ့ အိတ်အမျိုးမျိုး လက်လီ/လက်ကား ရောင်းဝယ်ရေး (မန္တလေး)",
  description:
    "ပုံ့ပုံ့ (Pont Pont) အိတ်အမျိုးမျိုး လက်လီ/လက်ကား ရောင်းဝယ်ရေး (မန္တလေးမြို့) — ၇၃ လမ်း (၃၆×၃၇ ကြား)၊ ၆၅ လမ်း (၁၀၇×၁၀၈ ကြား)၊ ၇၈ လမ်း (တံခွန်တိုင်ဈေးအနီး)။ ဖုန်း 09-963000502, 09-750072752, 09-404448881။",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
