import Stripe from "stripe";
import { getConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { transitionOrder } from "@/lib/orders/operations";
import { FulfillmentStatus, PaymentStatus } from "@/types";

export async function verifyAndProcessStripeWebhook(
  payload: string,
  signature: string
): Promise<{ processed: boolean; orderRef?: string }> {
  const config = getConfig();

  if (!config.stripeSecretKey || !config.stripeWebhookSecret) {
    throw new Error("Stripe secret key or webhook secret is not configured");
  }

  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: "2025-01-27.acacia" as any,
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  // Idempotency check: see if this event has already been recorded
  const existingPayment = await db.payment.findUnique({
    where: { webhookEventId: event.id },
  });

  if (existingPayment) {
    // Event was already processed idempotently
    return { processed: true };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (!orderId) {
      throw new Error("Missing orderId in Stripe checkout session metadata");
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new Error(`Order ${orderId} not found during webhook processing`);
    }

    // Update payment record
    await db.payment.update({
      where: { orderId },
      data: {
        status: PaymentStatus.PAID,
        providerPaymentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
        webhookEventId: event.id,
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });

    // Advance order to CONFIRMED
    await transitionOrder(
      orderId,
      FulfillmentStatus.CONFIRMED,
      "stripe_webhook",
      `Payment verified via Stripe Checkout (${session.id})`
    );

    return { processed: true, orderRef: order.orderRef };
  }

  return { processed: false };
}
