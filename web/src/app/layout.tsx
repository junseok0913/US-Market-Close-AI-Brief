import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Noto_Sans_KR,
  Space_Grotesk,
} from "next/font/google";
import localFont from "next/font/local";
import "computer-modern/cmu-classical-serif.css";
import "./globals.css";

const suit = localFont({
  src: "../../public/fonts/SUIT-Variable.woff2",
  variable: "--font-suit",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});

const jetBrainsMono = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "Yesterday's close, Today's edge",
  description: "매일 아침, AI가 전날 미국 증시의 주요 흐름과 핵심 종목 동향을 분석해 팟캐스트로 전달합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={[
          suit.variable,
          notoSansKr.variable,
          spaceGrotesk.variable,
          jetBrainsMono.variable,
          "antialiased",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}
