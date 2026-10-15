import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { addToCart, getCart, updateCartItem, removeFromCart } from "@/lib/cart/operations";

describe("Cart Operations (Integration with SQLite DB)", () => {
  const testSessionId = "test-session-cart-" + Date.now();
  let firstDish: any;

  beforeAll(async () => {
    firstDish = await db.menuItem.findFirst({
      where: { isAvailable: true },
      include: { variants: true, customizationGroups: { include: { options: true } } },
    });
  });

  it("creates an empty cart for a new session", async () => {
    const cart = await getCart(testSessionId);
    expect(cart.items).toHaveLength(0);
    expect(cart.totalMinor).toBe(0);
  });

  it("adds an available item to the cart", async () => {
    expect(firstDish).toBeDefined();

    const updated = await addToCart(testSessionId, {
      itemId: firstDish.id,
      quantity: 1,
    });

    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].itemId).toBe(firstDish.id);
    expect(updated.subtotalMinor).toBeGreaterThan(0);
  });

  it("updates the quantity of an item in the cart", async () => {
    const cart = await getCart(testSessionId);
    const cartItemId = cart.items[0].id;

    const updated = await updateCartItem(testSessionId, {
      cartItemId,
      quantity: 3,
    });

    expect(updated.items[0].quantity).toBe(3);
    expect(updated.itemCount).toBe(3);
  });

  it("removes an item from the cart", async () => {
    const cart = await getCart(testSessionId);
    const cartItemId = cart.items[0].id;

    const updated = await removeFromCart(testSessionId, cartItemId);
    expect(updated.items).toHaveLength(0);
    expect(updated.itemCount).toBe(0);
    expect(updated.totalMinor).toBe(0);
  });

  it("rejects adding a non-existent dish", async () => {
    await expect(
      addToCart(testSessionId, { itemId: "non-existent-uuid" })
    ).rejects.toThrow(/not found/i);
  });
});
