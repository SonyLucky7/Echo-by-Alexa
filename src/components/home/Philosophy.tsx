import React from "react";
import { Flame, Trees, Wheat, Sparkles } from "lucide-react";

export const Philosophy: React.FC = () => {
  return (
    <section id="hearth-story" className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Image Mosaic */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-card bg-sand border border-charcoal/10">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80"
              alt="ECHO Hearth Fire Cooking and Cast Iron"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating Pill */}
          <div className="absolute -bottom-6 -right-6 bg-ivory rounded-2xl p-5 shadow-floating border border-charcoal/10 max-w-xs hidden sm:block">
            <div className="flex items-center gap-2 text-ember mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Elemental Integrity
              </span>
            </div>
            <p className="text-xs text-charcoal/70 leading-relaxed font-light">
              "We cook not to mask the ingredient, but to awaken the memory carried within its seed and soil."
            </p>
          </div>
        </div>

        {/* Right Column: Culinary Principles */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
              <Trees className="w-3.5 h-3.5" />
              <span>Our Culinary Manifesto</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal leading-tight">
              An Echo of Ancient Earth, Fire & Foraged Memory
            </h2>
          </div>

          <p className="text-charcoal/75 text-base md:text-lg font-light leading-relaxed">
            At ECHO, dining is an intimate communion with natural rhythms. Our kitchen eschews modern induction and gas ranges for an authentic stone hearth built from local river slate and fueled by seasoned fruitwoods.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-cream/50 border border-charcoal/10 space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-ember/15 flex items-center justify-center text-ember">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal">
                Elemental Hearth Fire
              </h3>
              <p className="text-xs text-charcoal/65 leading-relaxed font-light">
                Controlled coal embers, cold cedar smoke, and intense radiant heat unlock natural caramelization without synthetic additives.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream/50 border border-charcoal/10 space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-olive/15 flex items-center justify-center text-olive">
                <Trees className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal">
                Wild Coastal Botanicals
              </h3>
              <p className="text-xs text-charcoal/65 leading-relaxed font-light">
                Foraged spruce tips, sea buckthorn, wild sumac, and indigenous pine needle extracts lend distinct aromatic terroir to each plate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream/50 border border-charcoal/10 space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-sand flex items-center justify-center text-charcoal">
                <Wheat className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal">
                Regenerative Ancient Grains
              </h3>
              <p className="text-xs text-charcoal/65 leading-relaxed font-light">
                Biodynamic emmer, einkorn, and stone-ground polenta preserved through natural slow sourdough and koji fermentations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cream/50 border border-charcoal/10 space-y-2.5">
              <div className="w-9 h-9 rounded-full bg-charcoal/10 flex items-center justify-center text-charcoal">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg font-medium text-charcoal">
                Universal Hospitality
              </h3>
              <p className="text-xs text-charcoal/65 leading-relaxed font-light">
                True fine dining honors every guest. Our menu naturally accommodates vegan, vegetarian, halal, and allergen-conscious palates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
