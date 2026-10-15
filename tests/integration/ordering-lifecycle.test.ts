import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { getCart, addToCart, clearCart } from "@/lib/cart/operations";
import { createOrderFromCart, transitionOrder, getOrderByRef } from "@/lib/orders/operations";
import { FulfillmentMode, FulfillmentStatus } from "@/types";

describe("Integration: Complete Order Lifecycle & Fulfillment Modes", () => {
  const sessionId = "integ-test-session-lifecycle";

  beforeAll(async () => {
    // Ensure clean test guest session
    await db.guestSession.upsert({
      where: { id: sessionId },
      update: {},
      create: {
        id: sessionId,
        cart: { create: {} },
      },
    });
    await clearCart(sessionId);
  });

  it("adds dishes with customizations and verifies integer price calculation", async () => {
    const dishes = await db.menuItem.findMany({
      where: { isAvailable: true },
      include: {
        customizationGroups: { include: { options: true } },
      },
      take: 2,
    });

    expect(dishes.length).toBeGreaterThanOrEqual(2);
    const dish1 = dishes[0];
    const dish2 = dishes[1];

    // Add first dish
    const cartAfter1 = await addToCart(sessionId, {
      itemId: dish1.id,
      quantity: 2,
    });
    expect(cartAfter1.itemCount).toBe(2);

    // Add second dish with customization option if available
    const customOptionId = dish2.customizationGroups[0]?.options[0]?.id;
    const cartAfter2 = await addToCart(sessionId, {
      itemId: dish2.id,
      quantity: 1,
      customizationOptionIds: customOptionId ? [customOptionId] : undefined,
    });
    expect(cartAfter2.itemCount).toBe(3);

    // Verify subtotal integer math
    const cart = await getCart(sessionId);
    expect(cart.subtotalMinor).toBeGreaterThan(0);
    expect(cart.taxMinor).toBe(Math.round((cart.subtotalMinor * 825) / 10000));
    expect(cart.totalMinor).toBe(cart.subtotalMinor + cart.taxMinor);
  });

  it("converts cart into a DINE_IN order with Table number and tracks state transitions", async () => {
    const order = await createOrderFromCart(sessionId, {
      fulfillmentMode: FulfillmentMode.DINE_IN,
      tableNumber: "14",
      customerName: "Lord Julian Vance",
      customerPhone: "+15551234567",
    });

    expect(order.orderRef).toMatch(/^ECHO-[A-Z0-9]+$/);
    expect(order.fulfillmentMode).toBe(FulfillmentMode.DINE_IN);
    const dineInDetails = JSON.parse(order.fulfillmentDetails);
    expect(dineInDetails.tableNumber).toBe("14");
    expect(order.fulfillmentStatus).toBe(FulfillmentStatus.PENDING_PAYMENT);
    expect(order.items.length).toBe(2);

    // Simulate payment verification
    await transitionOrder(order.id, FulfillmentStatus.CONFIRMED, "payment", "Tab opened at table");

    // Advance order to PREPARING
    const preparingOrder = await transitionOrder(
      order.id,
      FulfillmentStatus.PREPARING,
      "head-chef",
      "Placed in white oak hearth"
    );
    expect(preparingOrder.fulfillmentStatus).toBe(FulfillmentStatus.PREPARING);

    // Advance order to READY
    const readyOrder = await transitionOrder(
      order.id,
      FulfillmentStatus.READY,
      "line-cook",
      "Plated with wild chive oil"
    );
    expect(readyOrder.fulfillmentStatus).toBe(FulfillmentStatus.READY);

    // Complete order
    const completedOrder = await transitionOrder(
      order.id,
      FulfillmentStatus.COMPLETED,
      "floor-captain",
      "Served to table 14"
    );
    expect(completedOrder.fulfillmentStatus).toBe(FulfillmentStatus.COMPLETED);

    // Verify audit trail
    const retrieved = await getOrderByRef(order.orderRef);
    expect(retrieved).toBeDefined();
    expect(retrieved!.statusEvents.length).toBe(5); // PENDING_PAYMENT, CONFIRMED, PREPARING, READY, COMPLETED
  });

  it("handles DELIVERY orders with address validation and dispatch", async () => {
    // Add dish for delivery
    const dish = await db.menuItem.findFirst({ where: { isAvailable: true } });
    await addToCart(sessionId, { itemId: dish!.id, quantity: 1 });

    const order = await createOrderFromCart(sessionId, {
      fulfillmentMode: FulfillmentMode.DELIVERY,
      deliveryAddress: "742 Evergreen Terrace, Hearth District",
      customerName: "Elena Rostova",
      customerPhone: "+15559876543",
    });

    expect(order.fulfillmentMode).toBe(FulfillmentMode.DELIVERY);
    const deliveryDetails = JSON.parse(order.fulfillmentDetails);
    expect(deliveryDetails.deliveryAddress).toBe("742 Evergreen Terrace, Hearth District");
    expect(order.deliveryFeeMinor).toBe(500); // $5.00 delivery fee

    // Payment confirmation
    await transitionOrder(order.id, FulfillmentStatus.CONFIRMED, "payment", "Card charged");

    // Advance to PREPARING -> READY -> OUT_FOR_DELIVERY -> COMPLETED
    await transitionOrder(order.id, FulfillmentStatus.PREPARING, "kitchen");
    await transitionOrder(order.id, FulfillmentStatus.READY, "packaging");
    const outOrder = await transitionOrder(order.id, FulfillmentStatus.OUT_FOR_DELIVERY, "dispatch");
    expect(outOrder.fulfillmentStatus).toBe(FulfillmentStatus.OUT_FOR_DELIVERY);

    const doneOrder = await transitionOrder(order.id, FulfillmentStatus.COMPLETED, "courier");
    expect(doneOrder.fulfillmentStatus).toBe(FulfillmentStatus.COMPLETED);
  });
});
