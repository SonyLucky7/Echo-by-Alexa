import React from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/currency";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Flame, Sparkles } from "lucide-react";

export interface FeaturedDishesProps {
  dishes: Array<{
    id: string;
    slug: string;
    name: string;
    description: string;
    basePriceMinor: number;
    cookingTechnique: string;
    dietaryFlags: string;
    imageUrl: string;
    category: { name: string };
  }>;
}

export const FeaturedDishes: React.FC<FeaturedDishesProps> = ({ dishes }) => {
  if (!dishes || dishes.length === 0) return null;

  const [leadDish, ...secondaryDishes] = dishes;

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto text-left">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-olive mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chef's Ember Curations</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal">
            Signature Hearth Creations
          </h2>
        </div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm font-medium text-ember hover:text-charcoal transition-colors group"
        >
          <span>Explore Entire Catalog</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Asymmetric Editorial Rhythm */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Lead Hero Dish (7 cols) */}
        {leadDish && (
          <div className="lg:col-span-7 bg-cream/50 rounded-3xl p-8 border border-charcoal/10 flex flex-col justify-between group hover:shadow-card transition-all duration-300">
            <div>
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-8 bg-sand">
                <img
                  src={leadDish.imageUrl}
                  alt={leadDish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-charcoal text-ivory">
                    Signature
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase bg-ivory/90 backdrop-blur-sm text-olive">
                    {leadDish.category.name}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 mb-3">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
                  {leadDish.name}
                </h3>
                <span className="font-serif text-2xl font-semibold text-charcoal shrink-0">
                  {formatCurrency(leadDish.basePriceMinor, "USD")}
                </span>
              </div>

              <p className="text-charcoal/70 text-sm md:text-base leading-relaxed font-light mb-6">
                {leadDish.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-charcoal/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-ember" />
                <span className="text-xs uppercase tracking-wider text-charcoal/60 font-medium">
                  {leadDish.cookingTechnique.replace("_", " ")}
                </span>
              </div>
              <Link
                href={`/menu?item=${leadDish.slug}`}
                className="text-sm font-semibold text-charcoal hover:text-ember transition-colors inline-flex items-center gap-1.5"
              >
                <span>Customize & Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Secondary Stacked Dishes (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8 justify-between">
          {secondaryDishes.slice(0, 2).map((dish) => (
            <div
              key={dish.id}
              className="bg-cream/40 rounded-3xl p-6 border border-charcoal/10 flex flex-col sm:flex-row gap-6 group hover:shadow-card transition-all duration-300"
            >
              <div className="relative aspect-square w-full sm:w-44 rounded-xl overflow-hidden shrink-0 bg-sand">
                <img
                  src={dish.imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs uppercase tracking-wider text-olive font-semibold">
                      {dish.category.name}
                    </span>
                    <span className="font-serif text-lg font-semibold text-charcoal">
                      {formatCurrency(dish.basePriceMinor, "USD")}
                    </span>
                  </div>

                  <h4 className="font-serif text-xl font-medium text-charcoal mb-2">
                    {dish.name}
                  </h4>

                  <p className="text-charcoal/65 text-xs sm:text-sm line-clamp-2 font-light leading-relaxed mb-4">
                    {dish.description}
                  </p>
                </div>

                <Link
                  href={`/menu?item=${dish.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-charcoal hover:text-ember transition-colors inline-flex items-center gap-1 mt-auto"
                >
                  <span>Select Plate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
