import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { checkoutInputSchema } from "@/lib/validation";
import { createOrderFromCart } from "@/lib/orders/operations";
import { createStripeCheckoutSession } from "@/lib/payments/stripe";
import { processSandboxCheckout } from "@/lib/payments/sandbox";
import { hasPaymentProvider } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();
    const body = await req.json();
    const parsed = checkoutInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout details", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // 1. Create order and snapshot items from current authoritative cart
    const order = await createOrderFromCart(sessionId, parsed.data);

    // 2. Select payment flow
    const useSandbox =
      parsed.data.paymentProvider === "SANDBOX" || !hasPaymentProvider();

    if (useSandbox) {
      const sandboxResult = await processSandboxCheckout(order.id);
      return NextResponse.json({
        orderRef: order.orderRef,
        checkoutUrl: sandboxResult.checkoutUrl,
        isSandbox: true,
      });
    }

    // Live Stripe flow
    try {
      const stripeResult = await createStripeCheckoutSession({
        id: order.id,
        orderRef: order.orderRef,
        totalMinor: order.totalMinor,
        currency: order.currency,
        customerEmail: order.customerEmail,
        items: order.items,
      });

      return NextResponse.json({
        orderRef: order.orderRef,
        checkoutUrl: stripeResult.checkoutUrl,
        isSandbox: false,
      });
    } catch (stripeErr: any) {
      console.warn("Stripe initiation failed, falling back to sandbox:", stripeErr?.message);
      const fallbackSandbox = await processSandboxCheckout(order.id);
      return NextResponse.json({
        orderRef: order.orderRef,
        checkoutUrl: fallbackSandbox.checkoutUrl,
        isSandbox: true,
        notice: "Payment simulated via Sandbox Mode.",
      });
    }
  } catch (error: any) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process checkout" },
      { status: 400 }
    );
  }
}
