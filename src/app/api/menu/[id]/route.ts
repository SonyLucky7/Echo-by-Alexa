import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "en";

    // Support lookup by UUID or slug
    const item = await db.menuItem.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isAvailable: true,
      },
      include: {
        category: true,
        variants: {
          orderBy: { priceMinor: "asc" },
        },
        customizationGroups: {
          include: {
            options: {
              where: { isAvailable: true },
              orderBy: { priceDeltaMinor: "asc" },
            },
          },
        },
        allergens: {
          select: { allergen: true },
        },
        translations: {
          where: { locale },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const translation = item.translations[0];
    let dietaryFlagsList: string[] = [];
    try {
      dietaryFlagsList = JSON.parse(item.dietaryFlags);
    } catch {}

    return NextResponse.json({
      id: item.id,
      slug: item.slug,
      name: translation?.name || item.name,
      description: translation?.description || item.description,
      canonicalName: item.name,
      ingredientsText: translation?.ingredientsText || null,
      basePriceMinor: item.basePriceMinor,
      spiceLevel: item.spiceLevel,
      cookingTechnique: item.cookingTechnique,
      dietaryFlags: dietaryFlagsList,
      allergens: item.allergens.map((a) => a.allergen),
      prepTimeMinutes: item.prepTimeMinutes,
      imageUrl: item.imageUrl,
      category: item.category,
      variants: item.variants,
      customizationGroups: item.customizationGroups,
    });
  } catch (error) {
    console.error("GET /api/menu/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dish details" },
      { status: 500 }
    );
  }
}
