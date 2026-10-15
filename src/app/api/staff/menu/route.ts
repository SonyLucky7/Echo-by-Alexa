import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isStaffAuthenticated } from "@/lib/staff";

export async function GET() {
  const isAuth = await isStaffAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.menuItem.findMany({
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
  });

  return NextResponse.json(items);
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isStaffAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemId, isAvailable } = await req.json();

    if (!itemId || typeof isAvailable !== "boolean") {
      return NextResponse.json({ error: "itemId and isAvailable are required" }, { status: 400 });
    }

    const updated = await db.menuItem.update({
      where: { id: itemId },
      data: { isAvailable },
      include: {
        category: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
