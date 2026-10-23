import { describe, it, expect, beforeAll } from "vitest";
import { db } from "@/lib/db";
import { tools } from "@/lib/concierge/tools";
import { clearCart } from "@/lib/cart/operations";
import { SessionContext } from "@/types";

describe("Integration: 14-Tool Concierge Pipeline", () => {
  const session: SessionContext = {
    sessionId: "integ-test-session-tools",
    locale: "en",
  };

  beforeAll(async () => {
    await db.guestSession.upsert({
      where: { id: session.sessionId },
      update: {},
      create: {
        id: session.sessionId,
        cart: { create: {} },
      },
    });
    await clearCart(session.sessionId);
  });

  it("executes the complete dining concierge sequence across tools", async () => {
    // 1. browse_menu
    const menu = await tools.browse_menu.execute({ category: "hearth-starters" }, session);
    expect(menu.length).toBeGreaterThan(0);
    const starter = menu[0];

    // 2. get_item_details
    const details = await tools.get_item_details.execute({ itemId: starter.id }, session);
    expect(details.id).toBe(starter.id);

    // 3. recommend_items
    const recs = await tools.recommend_items.execute(
      { tasteNotes: "smoky, rich, wood-fired" },
      session
    );
    expect(recs.highlight).toBeDefined();

    // 4. customize_item
    const customResult = await tools.customize_item.execute(
      { itemId: starter.id },
      session
    );
    expect(customResult.unitPriceMinor).toBeGreaterThan(0);

    // 5. add_to_cart
    const addResult = await tools.add_to_cart.execute(
      { itemId: starter.id, quantity: 2 },
      session
    );
    expect(addResult.summary.itemCount).toBe(2);

    // 6. view_cart
    const cartResult = await tools.view_cart.execute({}, session);
    expect(cartResult.itemCount).toBe(2);
    expect(cartResult.items.length).toBe(1);
    const cartItemId = cartResult.items[0].id;

    // 7. update_cart_item
    const updateResult = await tools.update_cart_item.execute(
      { cartItemId, quantity: 3 },
      session
    );
    expect(updateResult.itemCount).toBe(3);

    // 8. get_restaurant_information
    const info = await tools.get_restaurant_information.execute({}, session);
    expect(info.name).toBe("ECHO");
    expect(info.phone).toBeDefined();

    // 9. prepare_checkout
    const prepCheckout = await tools.prepare_checkout.execute(
      { fulfillmentMode: "DINE_IN", tableNumber: "8" },
      session
    );
    expect(prepCheckout.summary.itemCount).toBe(3);

    // 10. create_checkout_session
    const checkoutResult = await tools.create_checkout_session.execute(
      {
        fulfillmentMode: "DINE_IN",
        tableNumber: "8",
        customerName: "Audrey Hepburn",
        customerPhone: "+15554321987",
      },
      session
    );
    expect(checkoutResult.orderRef).toBeDefined();
    const createdOrderRef = checkoutResult.orderRef;

    // 11. get_order_status
    const statusResult = await tools.get_order_status.execute(
      { orderRef: createdOrderRef },
      session
    );
    expect(statusResult.orderRef).toBe(createdOrderRef);

    // 12. get_order_history
    const history = await tools.get_order_history.execute({}, session);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].orderRef).toBe(createdOrderRef);

    // 13. cancel_order
    const cancelResult = await tools.cancel_order.execute(
      { orderRef: createdOrderRef, reason: "Guest requested cancellation" },
      session
    );
    expect(cancelResult.success).toBe(true);

    // 14. remove_from_cart (clean up remaining or future items)
    // Add 1 more item then remove it
    await tools.add_to_cart.execute({ itemId: starter.id, quantity: 1 }, session);
    const cartNow = await tools.view_cart.execute({}, session);
    const itemToRemove = cartNow.items[0].id;
    const removeResult = await tools.remove_from_cart.execute(
      { cartItemId: itemToRemove },
      session
    );
    expect(removeResult.success).toBe(true);
    expect(removeResult.itemCount).toBe(0);

    // 15. book_table
    const tableRes = await tools.book_table.execute(
      { partySize: 2, time: "7:30 PM", seatingArea: "Hearthside Sanctuary" },
      session
    );
    expect(tableRes.type).toBe("reservation");
    expect(tableRes.availableSlots).toContain("7:30 PM");

    // 16. web_search
    const searchRes = await tools.web_search.execute(
      { query: "white oak wood fired gastronomy" },
      session
    );
    expect(searchRes).toHaveProperty("query");
    expect(Array.isArray(searchRes.results)).toBe(true);
  });
});
