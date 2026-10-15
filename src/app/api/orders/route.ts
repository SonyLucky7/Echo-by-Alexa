import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();

    const orders = await db.order.findMany({
      where: { guestSessionId: sessionId },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve order history" },
      { status: 500 }
    );
  }
}
