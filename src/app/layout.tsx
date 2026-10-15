import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECHO — Wild Botanicals & Open Hearth Gastronomy",
  description:
    "An elemental fine-dining sanctuary where hyper-seasonal wild botanicals, ancient grains, and live fire converge.",
  openGraph: {
    title: "ECHO — Wild Botanicals & Open Hearth Gastronomy",
    description:
      "Seasonal plates crafted over open flame, from garden to hearth. Featuring an AI dining concierge in 5 languages.",
    url: "https://echo-restaurant.com",
    siteName: "ECHO",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ivory text-charcoal selection:bg-ember/20 selection:text-charcoal flex flex-col">
        {children}
      </body>
    </html>
  );
}
