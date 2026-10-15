import React from "react";

export const Philosophy: React.FC = () => {
  return (
    <section id="hearth-story" className="py-32 px-6 md:px-12 max-w-7xl mx-auto text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Left Column: Atmospheric Photography Frame */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-card bg-sand border border-charcoal/10">
            <img
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
              alt="ECHO Live Hearth Fire and Cast Iron Cooking"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Subtle Editorial Pullquote */}
          <div className="absolute -bottom-6 -right-6 bg-ivory rounded-2xl p-6 shadow-floating border border-charcoal/10 max-w-xs hidden sm:block">
            <p className="font-serif italic text-sm text-charcoal/90 leading-relaxed">
              "We cook not to mask the ingredient, but to awaken the memory carried within its seed and soil."
            </p>
            <span className="text-[10px] uppercase tracking-widest text-olive font-medium mt-3 block">
              Chef & Forager
            </span>
          </div>
        </div>

        {/* Right Column: Editorial Narrative */}
        <div className="lg:col-span-7 space-y-10">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-olive mb-3 block">
              Our Culinary Manifesto
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-charcoal leading-[1.15]">
              An Echo of Ancient Earth, Fire & Foraged Memory
            </h2>
          </div>

          <p className="text-charcoal/75 text-base md:text-lg font-light leading-relaxed">
            At ECHO, dining is an intimate communion with natural rhythms. Our kitchen eschews modern induction and gas ranges for an authentic stone hearth built from local river slate and fueled exclusively by seasoned fruitwoods.
          </p>

          {/* Understated Editorial Pillars — No Tacky SaaS Cards */}
          <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
            <div className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="font-serif text-sm italic text-ember shrink-0 sm:w-28">
                I. Live Hearth Fire
              </span>
              <p className="text-sm text-charcoal/70 font-light leading-relaxed">
                Controlled coal embers and cold cedar smoke unlock natural caramelization and primordial aroma.
              </p>
            </div>

            <div className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="font-serif text-sm italic text-ember shrink-0 sm:w-28">
                II. Wild Botanicals
              </span>
              <p className="text-sm text-charcoal/70 font-light leading-relaxed">
                Foraged spruce tip, coastal sea buckthorn, and indigenous pine needles lend true aromatic terroir.
              </p>
            </div>

            <div className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="font-serif text-sm italic text-ember shrink-0 sm:w-28">
                III. Ancient Grains
              </span>
              <p className="text-sm text-charcoal/70 font-light leading-relaxed">
                Biodynamic emmer, einkorn, and stone-ground polenta preserved through natural koji and sourdough fermentation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
