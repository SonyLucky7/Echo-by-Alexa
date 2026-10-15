import React from "react";
import { db } from "@/lib/db";
import { Hero } from "@/components/home/Hero";
import { FeaturedDishes } from "@/components/home/FeaturedDishes";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { Philosophy } from "@/components/home/Philosophy";
import { RestaurantInfo } from "@/components/home/RestaurantInfo";
import { CTASection } from "@/components/home/CTASection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch featured dishes from Prisma
  const featuredDishes = await db.menuItem.findMany({
    where: { isFeatured: true },
    include: {
      category: { select: { name: true } },
    },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  // Fetch categories with counts
  const categories = await db.menuCategory.findMany({
    include: {
      _count: {
        select: { items: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <Hero />
      <FeaturedDishes dishes={featuredDishes} />
      <CategoryShowcase categories={categories} />
      <Philosophy />
      <RestaurantInfo />
      <CTASection />
    </>
  );
}
