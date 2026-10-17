import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto text-left animate-fade-in space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal/60 hover:text-ember transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>

      <div className="space-y-3">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-charcoal">
          Guest Privacy Notice
        </h1>
        <p className="text-xs text-charcoal/50 font-mono uppercase tracking-wider">
          Last Updated: Seasonal Spring / Hearth Equinox
        </p>
      </div>

      <div className="space-y-6 text-sm text-charcoal/80 leading-relaxed font-light divide-y divide-charcoal/10">
        <div className="space-y-2 pt-4">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            1. Information We Collect
          </h3>
          <p>
            When reserving a table, ordering plates through our digital service, or consulting our dining concierge, we collect necessary guest contact details (name, email, mobile phone), table seating details, and dietary preferences.
          </p>
        </div>

        <div className="space-y-2 pt-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            2. Payment Security
          </h3>
          <p>
            All payment transactions are encrypted via 256-bit TLS connections and handled directly by PCI-DSS Level 1 compliant payment infrastructure. ECHO never stores or inspects complete credit card numbers or raw card security codes on our servers.
          </p>
        </div>

        <div className="space-y-2 pt-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            3. AI Dining Assistant Context
          </h3>
          <p>
            Inquiries and voice conversations with our AI dining concierge are processed securely to provide dietary matching, pairing recommendations, and instant order routing. We never sell your interaction history or personal dining notes to third-party ad networks.
          </p>
        </div>

        <div className="space-y-2 pt-6">
          <h3 className="font-serif text-lg font-semibold text-charcoal">
            4. Your Rights
          </h3>
          <p>
            You may request deletion of your guest record or dining profile at any time by contacting our hospitality team at concierge@echo-restaurant.com.
          </p>
        </div>
      </div>
    </div>
  );
}
