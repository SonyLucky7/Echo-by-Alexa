import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export interface CategoryShowcaseProps {
  categories: Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    _count?: { items: number };
  }>;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ categories }) => {
  return (
    <section className="py-28 bg-cream/50 border-y border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-olive mb-2 block">
              The Botanical Pantry
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-charcoal">
              Gastronomic Chapters
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-xs uppercase tracking-wider font-medium text-charcoal/60 hover:text-ember transition-colors"
          >
            View All Dishes &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4] p-6 flex flex-col justify-between bg-charcoal text-ivory border border-charcoal/10 shadow-sm hover:shadow-card transition-all duration-500"
            >
              {/* Image with dark cinematic overlay */}
              {cat.imageUrl && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent" />
                </div>
              )}

              <div className="relative z-10 flex justify-between items-start">
                <span className="font-mono text-[11px] text-ivory/50">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="w-8 h-8 rounded-full bg-ivory/10 backdrop-blur-md flex items-center justify-center text-ivory group-hover:bg-ember group-hover:text-charcoal transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="font-serif text-lg sm:text-xl font-medium text-ivory group-hover:text-ember transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
