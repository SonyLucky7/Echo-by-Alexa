import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isStaffAuthenticated } from "@/lib/staff";
import { transitionOrder } from "@/lib/orders/operations";
import { FulfillmentStatus } from "@/types";

export async function GET() {
  const isAuth = await isStaffAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      items: true,
      statusEvents: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  return NextResponse.json(orders);
}

export async function PATCH(req: NextRequest) {
  const isAuth = await isStaffAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, nextStatus, note } = await req.json();

    if (!orderId || !nextStatus) {
      return NextResponse.json({ error: "orderId and nextStatus are required" }, { status: 400 });
    }

    const updated = await transitionOrder(
      orderId,
      nextStatus as FulfillmentStatus,
      "hearth-staff",
      note || `Advanced by kitchen staff to ${nextStatus}`
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
