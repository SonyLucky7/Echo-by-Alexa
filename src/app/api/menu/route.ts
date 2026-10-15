import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuQuerySchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = menuQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      dietary: searchParams.get("dietary") ?? undefined,
      spiceMax: searchParams.get("spiceMax") ?? undefined,
      priceMax: searchParams.get("priceMax") ?? undefined,
      locale: searchParams.get("locale") ?? "en",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { q, category, dietary, spiceMax, priceMax, locale } = parsed.data;

    // Build Prisma query filters
    const where: any = {
      isAvailable: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (spiceMax !== undefined) {
      where.spiceLevel = {
        lte: spiceMax,
      };
    }

    if (priceMax !== undefined) {
      where.basePriceMinor = {
        lte: priceMax,
      };
    }

    if (q && q.trim().length > 0) {
      where.OR = [
        { name: { contains: q.trim() } },
        { description: { contains: q.trim() } },
        { translations: { some: { name: { contains: q.trim() } } } },
      ];
    }

    let items = await db.menuItem.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        variants: {
          orderBy: { priceMinor: "asc" },
        },
        allergens: {
          select: { allergen: true },
        },
        translations: {
          where: { locale },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Filter by dietary flags if requested (dietaryFlags is stored as JSON array string)
    if (dietary) {
      const requestedFlags = dietary
        .split(",")
        .map((f) => f.trim().toUpperCase())
        .filter(Boolean);

      if (requestedFlags.length > 0) {
        items = items.filter((item) => {
          try {
            const flags: string[] = JSON.parse(item.dietaryFlags);
            return requestedFlags.every((reqFlag) => flags.includes(reqFlag));
          } catch {
            return false;
          }
        });
      }
    }

    // Map localized name and description if available
    const responseItems = items.map((item) => {
      const translation = item.translations[0];
      let dietaryFlagsList: string[] = [];
      try {
        dietaryFlagsList = JSON.parse(item.dietaryFlags);
      } catch {}

      return {
        id: item.id,
        slug: item.slug,
        categoryId: item.categoryId,
        category: item.category,
        name: translation?.name || item.name,
        description: translation?.description || item.description,
        canonicalName: item.name,
        basePriceMinor: item.basePriceMinor,
        spiceLevel: item.spiceLevel,
        cookingTechnique: item.cookingTechnique,
        dietaryFlags: dietaryFlagsList,
        allergens: item.allergens.map((a) => a.allergen),
        prepTimeMinutes: item.prepTimeMinutes,
        isFeatured: item.isFeatured,
        isSignature: item.isSignature,
        imageUrl: item.imageUrl,
        variants: item.variants,
      };
    });

    return NextResponse.json({
      items: responseItems,
      count: responseItems.length,
      locale,
    });
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve menu items" },
      { status: 500 }
    );
  }
}
