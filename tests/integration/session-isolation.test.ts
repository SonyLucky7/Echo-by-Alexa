import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { getCart, addToCart, clearCart } from "@/lib/cart/operations";
import { createOrderFromCart } from "@/lib/orders/operations";
import { processStripeWebhookEvent } from "@/lib/payments/webhook";
import { FulfillmentMode } from "@/types";

describe("Integration: Session Isolation & Webhook Idempotency", () => {
  const sessionA = "guest-session-alpha";
  const sessionB = "guest-session-beta";

  beforeAll(async () => {
    await db.guestSession.upsert({
      where: { id: sessionA },
      update: {},
      create: { id: sessionA, cart: { create: {} } },
    });
    await db.guestSession.upsert({
      where: { id: sessionB },
      update: {},
      create: { id: sessionB, cart: { create: {} } },
    });
    await clearCart(sessionA);
    await clearCart(sessionB);
  });

  it("strictly isolates shopping carts between two concurrent diners", async () => {
    const dishes = await db.menuItem.findMany({ where: { isAvailable: true }, take: 2 });
    const dishA = dishes[0];
    const dishB = dishes[1];

    // Session A adds dishA
    await addToCart(sessionA, { itemId: dishA.id, quantity: 3 });

    // Session B adds dishB
    await addToCart(sessionB, { itemId: dishB.id, quantity: 1 });

    const cartA = await getCart(sessionA);
    const cartB = await getCart(sessionB);

    expect(cartA.itemCount).toBe(3);
    expect(cartA.items[0].itemId).toBe(dishA.id);

    expect(cartB.itemCount).toBe(1);
    expect(cartB.items[0].itemId).toBe(dishB.id);

    // Verify Session A has none of Session B's items
    expect(cartA.items.some((it) => it.itemId === dishB.id)).toBe(false);
  });

  it("handles duplicate Stripe webhook events with strict idempotency", async () => {
    // Create an order in Session A
    const order = await createOrderFromCart(sessionA, {
      fulfillmentMode: FulfillmentMode.PICKUP,
      customerName: "Idempotent Guest",
      customerPhone: "+15550001111",
    });

    const eventId = `evt_test_${Date.now()}`;
    const mockStripeEvent: any = {
      id: eventId,
      type: "checkout.session.completed",
      data: {
        object: {
          client_reference_id: order.id,
          id: `cs_test_${Date.now()}`,
          payment_intent: `pi_test_${Date.now()}`,
        },
      },
    };

    // First delivery of webhook
    const result1 = await processStripeWebhookEvent(mockStripeEvent);
    expect(result1.processed).toBe(true);

    // Second (duplicate) delivery of the same webhook event ID
    const result2 = await processStripeWebhookEvent(mockStripeEvent);
    expect(result2.duplicate).toBe(true);
    expect(result2.processed).toBe(true);
  });
});
