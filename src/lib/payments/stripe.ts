import Stripe from "stripe";
import { getConfig } from "@/lib/config";
import { db } from "@/lib/db";

function getStripe(): Stripe | null {
  const config = getConfig();
  if (!config.stripeSecretKey) return null;
  return new Stripe(config.stripeSecretKey, {
    apiVersion: "2025-01-27.acacia" as any,
  });
}

export async function createStripeCheckoutSession(order: {
  id: string;
  orderRef: string;
  totalMinor: number;
  currency: string;
  customerEmail?: string | null;
  items: Array<{
    itemName: string;
    unitPriceMinor: number;
    quantity: number;
  }>;
}): Promise<{ checkoutUrl: string }> {
  const stripe = getStripe();
  const config = getConfig();

  if (!stripe) {
    throw new Error("Stripe secret key is not configured.");
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: order.currency.toLowerCase(),
      unit_amount: item.unitPriceMinor,
      product_data: {
        name: item.itemName,
      },
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: order.customerEmail || undefined,
    line_items: lineItems,
    metadata: {
      orderId: order.id,
      orderRef: order.orderRef,
    },
    client_reference_id: order.id,
    success_url: `${config.appUrl}/orders/${order.orderRef}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.appUrl}/checkout?status=cancelled&order_ref=${order.orderRef}`,
  });

  // Store provider session ID in payment record
  await db.payment.update({
    where: { orderId: order.id },
    data: {
      providerSessionId: session.id,
    },
  });

  return { checkoutUrl: session.url || "" };
}
