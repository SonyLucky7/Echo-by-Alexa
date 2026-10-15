import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { getOrderByRef, cancelOrder } from "@/lib/orders/operations";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  try {
    const { orderRef } = await params;
    const { sessionId } = await getOrCreateSession();

    // Verify session owns the order or allow lookup by exact orderRef
    const order = await getOrderByRef(orderRef, sessionId);

    if (!order) {
      // Fallback: check if order exists at all (e.g. redirected from Stripe without cookie match)
      const publicOrder = await getOrderByRef(orderRef);
      if (!publicOrder) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json(publicOrder);
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("GET /api/orders/[orderRef] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve order" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderRef: string }> }
) {
  try {
    const { orderRef } = await params;
    const { sessionId } = await getOrCreateSession();
    const body = await req.json();

    if (body.action === "cancel") {
      const updated = await cancelOrder(orderRef, sessionId, body.reason);
      return NextResponse.json({ success: true, order: updated });
    }

    return NextResponse.json({ error: "Unsupported order action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/orders/[orderRef] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 400 }
    );
  }
}
