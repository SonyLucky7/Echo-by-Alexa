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
    <section className="py-20 bg-cream/60 border-y border-charcoal/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest font-semibold text-olive mb-2">
            The Botanical Pantry
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-charcoal">
            Browse by Gastronomic Chapter
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/menu?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] p-5 flex flex-col justify-between bg-charcoal text-ivory border border-charcoal/10 shadow-sm hover:shadow-card transition-all duration-300"
            >
              {/* Image with dark moody overlay */}
              {cat.imageUrl && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
                </div>
              )}

              <div className="relative z-10 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-ivory/15 backdrop-blur-md flex items-center justify-center text-ivory group-hover:bg-ember group-hover:text-charcoal transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <div className="relative z-10">
                <span className="text-[11px] font-medium uppercase tracking-widest text-ember block mb-1">
                  {cat._count?.items ?? ""} Creations
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-medium text-ivory group-hover:text-ember transition-colors">
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
