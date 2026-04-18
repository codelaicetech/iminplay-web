import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iminplay.com"),
  title: {
    default: "IminPlay — Find your game. Meet your people.",
    template: "%s · IminPlay",
  },
  description:
    "The community-first app for pickup sport in South Africa. Find local games, join with one tap, and chat with your team across football, padel, tennis, basketball, cricket and more.",
  openGraph: {
    type: "website",
    siteName: "IminPlay",
    locale: "en_ZA",
    url: "https://iminplay.com",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "IminPlay — Find your game. Meet your people.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@iminplay",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-charcoal">
        {children}
      </body>
    </html>
  );
}
