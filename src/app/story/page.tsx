import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Compass, Sparkles, Sprout, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function StoryPage() {
  return (
    <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto text-left animate-fade-in space-y-20">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ember/10 border border-ember/30 text-charcoal text-xs uppercase tracking-widest font-medium">
          <Flame className="w-3.5 h-3.5 text-ember" />
          <span>The ECHO Philosophy</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-charcoal">
          Where Live Flame Meets Wild Botanicals
        </h1>
        <p className="text-charcoal/70 text-base sm:text-lg font-light leading-relaxed">
          ECHO is a sanctuary born from elemental cooking. We discard gas burners and induction in favor of live California fruitwoods, ember coals, and ancient hearthcraft.
        </p>
      </div>

      {/* Narrative Section 1: The Hearth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-ember font-semibold">
            The Living Fire
          </span>
          <h2 className="font-serif text-3xl font-medium text-charcoal">
            Four Levels of Heat, Endless Expression
          </h2>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            Our central stone hearth burns white oak, applewood, and peach embers. Each plate is touched by distinct fire zones: intense searing flame (800°F), radiant ember coals (400°F), aromatic pine-needle smoke racks, and gentle residual ash warmth.
          </p>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            Fire transforms natural starches, caramelizes wild sugars, and extracts ethereal aromatics impossible through conventional heat.
          </p>
        </div>
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-charcoal/10 shadow-card">
          <Image
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85"
            alt="Open wood-fired hearth cooking"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Narrative Section 2: Foraged Botanicals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-charcoal/10 shadow-card md:order-1">
          <Image
            src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85"
            alt="Wild herbs and botanical foraging"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-4 md:order-2">
          <span className="text-xs font-mono uppercase tracking-widest text-olive font-semibold">
            Coastal Foraging
          </span>
          <h2 className="font-serif text-3xl font-medium text-charcoal">
            The Uncultivated Terroir of California
          </h2>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            Every morning before sunrise, our foragers comb the coastal bluffs, coastal pine forests, and regenerative bio-diverse micro-farms.
          </p>
          <p className="text-sm text-charcoal/75 leading-relaxed font-light">
            Sea purslane, Douglas fir tips, wild fennel pollen, elderberries, and chanterelles arrive at the kitchen while the morning embers are still glowing.
          </p>
        </div>
      </div>

      {/* Core Principles Bento */}
      <div className="space-y-6 text-center">
        <h3 className="font-serif text-2xl font-medium text-charcoal">
          Our Guiding Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-cream/40 border border-charcoal/10 space-y-3">
            <Sprout className="w-6 h-6 text-olive" />
            <h4 className="font-serif text-lg font-semibold text-charcoal">
              Regenerative &amp; Organic
            </h4>
            <p className="text-xs text-charcoal/70 leading-relaxed font-light">
              Zero monoculture sourcing. We partner exclusively with no-till regenerative farms that rebuild soil biomes and restore native pollinator habitats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cream/40 border border-charcoal/10 space-y-3">
            <Flame className="w-6 h-6 text-ember" />
            <h4 className="font-serif text-lg font-semibold text-charcoal">
              Pure Fruitwood Hearth
            </h4>
            <p className="text-xs text-charcoal/70 leading-relaxed font-light">
              Fossil-fuel free kitchen. Every single plate is cooked, blistered, smoked, or finished directly over seasoned local wood fire and embers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-cream/40 border border-charcoal/10 space-y-3">
            <Compass className="w-6 h-6 text-ember-dark" />
            <h4 className="font-serif text-lg font-semibold text-charcoal">
              Deep Inclusivity
            </h4>
            <p className="text-xs text-charcoal/70 leading-relaxed font-light">
              Vegan, plant-forward, celiac, and allergen-conscious diners receive parity of flavor, craft, and reverence at every turn of our hearth.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-10 rounded-3xl bg-charcoal text-ivory text-center space-y-6">
        <h3 className="font-serif text-3xl font-medium">
          Experience the Hearth Tonight
        </h3>
        <p className="text-ivory/70 text-sm max-w-md mx-auto font-light leading-relaxed">
          Reserve your table or explore our hyper-seasonal tasting menu for this evening&rsquo;s service.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/reservations">
            <Button variant="ember" size="lg" className="px-8 shadow-sm">
              <span>Reserve a Table</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/menu">
            <Button variant="secondary" size="lg" className="px-8">
              <span>View Curated Menu</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
