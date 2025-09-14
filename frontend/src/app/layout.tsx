import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PasswordGate from "@/components/PasswordGate";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Fallback serif font for production deployment
const shipporiminchoB1 = {
  variable: "--font-shippori-mincho"
};

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: "うちのきろく",
  description: "家族のあたたかい思い出をつづる場所です",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  openGraph: {
    title: "🏠 うちのきろく",
    description: "家族のあたたかい思い出をつづる場所です 💝",
    type: "website",
    locale: "ja_JP",
    siteName: "うちのきろく",
    images: [
      {
        url: "/images/ogp/ogp.png",
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
    images: ["/images/ogp/ogp.png"],
  },
  manifest: "/site.webmanifest",
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
          <PasswordGate>
            {children}
          </PasswordGate>
        </Providers>
      </body>
    </html>
  );
}