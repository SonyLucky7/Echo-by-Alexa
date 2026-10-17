import React from "react";
import Link from "next/link";
import { ShieldCheck, HeartHandshake, Sprout, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DietaryPolicyPage() {
  return (
    <div className="py-16 px-6 md:px-12 max-w-4xl mx-auto text-left animate-fade-in space-y-12">
      <Link
        href="/menu"
        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-charcoal/60 hover:text-ember transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Menu</span>
      </Link>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-olive/10 border border-olive/30 text-charcoal text-xs uppercase tracking-widest font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-olive" />
          <span>Dietary &amp; Allergen Transparency</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-tight text-charcoal">
          Our Allergen &amp; Dietary Protocol
        </h1>
        <p className="text-charcoal/70 text-base font-light leading-relaxed">
          At ECHO, every guest is honored with the highest level of culinary craft and health safety. Here is how our wood-fired hearth manages dietary needs and allergens.
        </p>
      </div>

      <div className="space-y-8 divide-y divide-charcoal/10">
        <div className="pt-6 space-y-3">
          <h3 className="font-serif text-2xl font-medium text-charcoal flex items-center gap-2">
            <Sprout className="w-5 h-5 text-olive" />
            <span>Vegan &amp; Plant-Forward Dining</span>
          </h3>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            We believe plant-based gastronomy should never be an afterthought. Our vegan dishes (such as the Smoke-Kissed Beetroot Tartare and Fire-Roasted Lion&rsquo;s Mane) are developed from the ground up with house-cultured botanical fats, cold-pressed nut oils, and wood smoke rather than dairy butter.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h3 className="font-serif text-2xl font-medium text-charcoal flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-ember" />
            <span>Celiac &amp; Gluten Sensitivity</span>
          </h3>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            All gluten-free dishes are prepared on designated hearth iron stations with dedicated utensils. While our hearth bakes heirloom sourdough in a separate stone alcove, we take meticulous precautions to prevent cross-contact for sensitive guests.
          </p>
        </div>

        <div className="pt-6 space-y-3">
          <h3 className="font-serif text-2xl font-medium text-charcoal flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-charcoal/60" />
            <span>Tree Nut, Peanut, &amp; Shellfish Allergies</span>
          </h3>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            Please inform your service team or note in your reservation if anyone in your party has severe anaphylactic allergies. Our kitchen manager personally oversees ticket isolation and prepares sanitized prep surfaces for all flagged tickets.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-cream/40 border border-charcoal/10 text-center space-y-4">
        <h4 className="font-serif text-xl font-medium text-charcoal">
          Have Specific Questions for Our Chef?
        </h4>
        <p className="text-xs text-charcoal/60 max-w-md mx-auto leading-relaxed font-light">
          You can ask our AI dining concierge in real-time or speak with our floor sommelier upon arrival.
        </p>
        <Link href="/menu">
          <Button variant="ember" size="md">
            <span>Explore Ingredient Breakdown on Menu</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
