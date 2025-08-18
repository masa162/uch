import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho_B1 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shipporiminchoB1 = Shippori_Mincho_B1({
  variable: "--font-shippori-mincho",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "うちのきろく",
  description: "家族のあたたかい思い出をつづる場所です",
  openGraph: {
    title: "🏠 うちのきろく",
    description: "家族のあたたかい思い出をつづる場所です 💝",
    type: "website",
    locale: "ja_JP",
    siteName: "うちのきろく",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "うちのきろく - 家族のあたたかい思い出をつづる場所です",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🏠 うちのきろく",
    description: "家族のあたたかい思い出をつづる場所です 💝",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="uchinokiroku">
      <body
        className={`${notoSansJP.variable} ${shipporiminchoB1.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
