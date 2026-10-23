import { describe, it, expect, beforeAll } from "vitest";
import { tools } from "@/lib/concierge/tools";
import { getOrCreateConversation, recordMessage } from "@/lib/concierge/context";
import { executeFallbackIntent } from "@/lib/concierge/engine";
import { db } from "@/lib/db";
import { SessionContext } from "@/types";

describe("AI Concierge Tools & Engine", () => {
  const testSession: SessionContext = {
    sessionId: "test-concierge-session-1",
    locale: "en",
  };

  beforeAll(async () => {
    // Ensure test session exists
    await db.guestSession.upsert({
      where: { id: testSession.sessionId },
      update: {},
      create: {
        id: testSession.sessionId,
        cart: { create: {} },
      },
    });
  });

  it("browse_menu returns available items", async () => {
    const items = await tools.browse_menu.execute({}, testSession);
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty("name");
    expect(items[0]).toHaveProperty("priceMinor");
    expect(items[0]).toHaveProperty("dietaryFlags");
  });

  it("browse_menu filters by dietary requirements", async () => {
    const veganItems = await tools.browse_menu.execute({ dietaryFlags: ["VEGAN"] }, testSession);
    expect(Array.isArray(veganItems)).toBe(true);
    for (const item of veganItems) {
      expect(item.dietaryFlags).toContain("VEGAN");
    }
  });

  it("get_item_details returns verified ingredients and allergens", async () => {
    const menuItems = await tools.browse_menu.execute({}, testSession);
    const firstDish = menuItems[0];
    const details = await tools.get_item_details.execute({ itemId: firstDish.id }, testSession);

    expect(details).toHaveProperty("id", firstDish.id);
    expect(details).toHaveProperty("ingredients");
    expect(Array.isArray(details.allergens)).toBe(true);
    expect(Array.isArray(details.customizationGroups)).toBe(true);
  });

  it("recommend_items returns centerpiece and pairing", async () => {
    const recommendation = await tools.recommend_items.execute(
      { tasteNotes: "smoky, rich, umami" },
      testSession
    );
    expect(recommendation).toHaveProperty("highlight");
    expect(recommendation).toHaveProperty("complement");
    expect(recommendation).toHaveProperty("pairingSuggestion");
  });

  it("get_restaurant_information returns authoritative details", async () => {
    const info = await tools.get_restaurant_information.execute({}, testSession);
    expect(info).toHaveProperty("name", "ECHO");
    expect(info).toHaveProperty("hours");
    expect(info).toHaveProperty("address");
  });

  it("view_cart reflects empty or active cart", async () => {
    const cart = await tools.view_cart.execute({}, testSession);
    expect(cart).toHaveProperty("itemCount");
    expect(cart).toHaveProperty("formattedTotal");
  });

  it("maintains conversation context and persistence", async () => {
    const isolateSessionId = `test-persist-${Date.now()}`;
    await db.guestSession.upsert({
      where: { id: isolateSessionId },
      update: {},
      create: { id: isolateSessionId, cart: { create: {} } },
    });

    const conv = await getOrCreateConversation(isolateSessionId, "en");
    expect(conv).toHaveProperty("conversationId");

    await recordMessage(conv.conversationId, "user", "What are the fire starters?");
    const updated = await getOrCreateConversation(isolateSessionId, "en");
    expect(updated.recentMessages.length).toBeGreaterThan(0);
    expect(updated.recentMessages[updated.recentMessages.length - 1].content).toBe(
      "What are the fire starters?"
    );
  });

  it("fallback intent engine responds intelligently to recommendation inquiry", async () => {
    const response = await executeFallbackIntent("What do you recommend for dinner?", testSession);
    expect(response.text).toBeDefined();
    expect(response.text.length).toBeGreaterThan(20);
    expect(response.toolCalls).toBeDefined();
    expect(response.toolCalls![0].name).toBe("recommend_items");
  });

  it("fallback intent engine handles vegan dietary inquiry", async () => {
    const response = await executeFallbackIntent("Do you have vegan dishes?", testSession);
    expect(response.text.toLowerCase()).toContain("vegan");
    expect(response.toolCalls![0].name).toBe("browse_menu");
  });

  it("fallback intent engine handles table reservation inquiry with interactive slots", async () => {
    const response = await executeFallbackIntent("Can I book a table for 2 tonight?", testSession);
    expect(response.text.toLowerCase()).toContain("table");
    expect(response.toolCalls![0].name).toBe("book_table");
    expect(response.toolResults![0].result.availableSlots.length).toBeGreaterThan(0);
  });

  it("fallback intent engine handles web research inquiry and cites sources", async () => {
    const response = await executeFallbackIntent("What is the history of fruitwood cooking and gastronomy?", testSession);
    expect(response.text).toBeDefined();
    expect(response.toolCalls).toBeDefined();
    expect(response.toolCalls![0].name).toBe("web_search");
    expect(response.toolResults![0].result.results.length).toBeGreaterThan(0);
  });
});
