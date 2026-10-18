import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Intercept and silence third-party browser extension errors (e.g. Urban VPN, emulator extensions) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                function isExtension(file, msg) {
                  return (
                    (file && (file.indexOf('chrome-extension://') !== -1 || file.indexOf('moz-extension://') !== -1)) ||
                    (msg && (msg.indexOf('M_ID') !== -1 || msg.indexOf('crxemulator') !== -1))
                  );
                }
                window.addEventListener('error', function(e) {
                  var file = e.filename || (e.error && e.error.stack) || '';
                  var msg = e.message || '';
                  if (isExtension(file, msg)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  var r = e.reason || '';
                  var str = (r && (r.stack || r.message)) || String(r);
                  if (isExtension(str, str)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-ivory text-charcoal selection:bg-ember/20 selection:text-charcoal flex flex-col"
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: "ECHO",
              description:
                "Progressive Global Hearth & Botanicals. Fine dining celebrating live fruitwood fire, heirloom grains, and hyper-seasonal wild botanicals.",
              image: "https://images.unsplash.com/photo-1544025162-d76694265947",
              servesCuisine: ["Progressive Hearth", "Botanical Gastronomy", "Wood-Fired"],
              priceRange: "$$$$",
              address: {
                "@type": "PostalAddress",
                streetAddress: "448 Hearthstone Way",
                addressLocality: "Artisan District",
                addressRegion: "CA",
                postalCode: "94107",
                addressCountry: "US",
              },
              telephone: "+1 (555) 324-6324",
              acceptsReservations: "True",
              hasMenu: "https://echo-restaurant.com/menu",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ],
                  opens: "17:00",
                  closes: "23:00",
                },
              ],
            }),
          }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
