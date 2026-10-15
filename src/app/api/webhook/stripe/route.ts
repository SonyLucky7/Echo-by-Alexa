import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessStripeWebhook } from "@/lib/payments/webhook";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const rawPayload = await req.text();
    const result = await verifyAndProcessStripeWebhook(rawPayload, signature);

    return NextResponse.json({ received: true, result });
  } catch (error: any) {
    console.error("Stripe Webhook error:", error.message);
    return NextResponse.json(
      { error: error.message || "Webhook handling failed" },
      { status: 400 }
    );
  }
}
