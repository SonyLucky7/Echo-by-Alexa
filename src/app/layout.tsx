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
        {/* Intercept and silence third-party browser extension errors and DOM mutations (e.g. Urban VPN bis_skin_checked, crxemulator, M_ID) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;

                // 1. Block extension attribute injection (e.g. bis_skin_checked, crx attributes)
                try {
                  var origSetAttr = Element.prototype.setAttribute;
                  Element.prototype.setAttribute = function(name, value) {
                    if (typeof name === 'string' && (name.indexOf('bis_skin') !== -1 || name.indexOf('crx') !== -1)) {
                      return;
                    }
                    return origSetAttr.apply(this, arguments);
                  };
                  var origSetAttrNS = Element.prototype.setAttributeNS;
                  if (origSetAttrNS) {
                    Element.prototype.setAttributeNS = function(ns, name, value) {
                      if (typeof name === 'string' && (name.indexOf('bis_skin') !== -1 || name.indexOf('crx') !== -1)) {
                        return;
                      }
                      return origSetAttrNS.apply(this, arguments);
                    };
                  }
                  var origSetAttrNode = Element.prototype.setAttributeNode;
                  if (origSetAttrNode) {
                    Element.prototype.setAttributeNode = function(attrNode) {
                      if (attrNode && attrNode.name && (attrNode.name.indexOf('bis_skin') !== -1 || attrNode.name.indexOf('crx') !== -1)) {
                        return null;
                      }
                      return origSetAttrNode.apply(this, arguments);
                    };
                  }
                } catch(e) {}

                // 2. Immediately strip and observe any bis_skin_checked attributes if injected
                try {
                  if (typeof MutationObserver !== 'undefined') {
                    var observer = new MutationObserver(function(mutations) {
                      for (var i = 0; i < mutations.length; i++) {
                        var m = mutations[i];
                        if (m.type === 'attributes' && m.attributeName && m.attributeName.indexOf('bis_skin') !== -1) {
                          m.target.removeAttribute(m.attributeName);
                        }
                      }
                    });
                    if (document.documentElement) {
                      observer.observe(document.documentElement, {
                        attributes: true,
                        subtree: true,
                        attributeFilter: ['bis_skin_checked']
                      });
                      setTimeout(function() {
                        try { observer.disconnect(); } catch(e) {}
                      }, 8000);
                    }
                  }
                } catch(e) {}

                // 3. Filter console.error with defineProperty so Next.js dev overlay wrappers cannot bypass our filter
                try {
                  var nativeConsoleError = console.error;
                  function wrapConsoleError(fn) {
                    return function() {
                      var fullMsg = '';
                      for (var i = 0; i < arguments.length; i++) {
                        var arg = arguments[i];
                        fullMsg += ' ' + ((arg && (arg.stack || arg.message)) ? (arg.stack || arg.message) : String(arg));
                      }
                      if (
                        fullMsg.indexOf('bis_skin_checked') !== -1 ||
                        fullMsg.indexOf('chrome-extension://') !== -1 ||
                        fullMsg.indexOf('moz-extension://') !== -1 ||
                        fullMsg.indexOf('M_ID') !== -1 ||
                        fullMsg.indexOf('crxemulator') !== -1
                      ) {
                        return;
                      }
                      return fn.apply(console, arguments);
                    };
                  }

                  var currentConsoleError = wrapConsoleError(nativeConsoleError);
                  Object.defineProperty(console, 'error', {
                    configurable: true,
                    enumerable: true,
                    get: function() {
                      return currentConsoleError;
                    },
                    set: function(newFn) {
                      currentConsoleError = wrapConsoleError(newFn);
                    }
                  });
                } catch(e) {}

                // 4. Global window error & unhandled rejection handlers for extensions
                function isExtension(file, msg) {
                  return (
                    (file && (file.indexOf('chrome-extension://') !== -1 || file.indexOf('moz-extension://') !== -1)) ||
                    (msg && (msg.indexOf('M_ID') !== -1 || msg.indexOf('crxemulator') !== -1 || msg.indexOf('bis_skin_checked') !== -1))
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
