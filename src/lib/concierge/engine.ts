import { GoogleGenerativeAI, SchemaType, FunctionDeclaration } from "@google/generative-ai";
import { getConfig } from "@/lib/config";
import { tools, ToolDefinition } from "@/lib/concierge/tools";
import { getPromptForLocale } from "@/lib/concierge/prompts";
import {
  getOrCreateConversation,
  recordMessage,
  updatePreferences,
} from "@/lib/concierge/context";
import { SessionContext } from "@/types";
import { db } from "@/lib/db";

export interface ConciergeResponse {
  text: string;
  toolCalls?: { name: string; args: any }[];
  toolResults?: { tool: string; result: any }[];
  conversationId: string;
  suggestions?: string[];
}

// Convert our tool registry to Gemini FunctionDeclaration format
function buildGeminiToolDeclarations(): FunctionDeclaration[] {
  return [
    {
      name: "browse_menu",
      description: tools.browse_menu.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: { type: SchemaType.STRING, description: "Keyword for dish or ingredient" },
          category: { type: SchemaType.STRING, description: "Category slug e.g. hearth-starters" },
          spiceMax: { type: SchemaType.INTEGER, description: "Max spice level 0 to 3" },
          dietaryFlags: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Array of dietary requirements e.g. ['VEGAN', 'GLUTEN_FREE']",
          },
        },
      },
    },
    {
      name: "get_item_details",
      description: tools.get_item_details.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          itemId: { type: SchemaType.STRING, description: "Dish UUID or slug" },
        },
        required: ["itemId"],
      },
    },
    {
      name: "recommend_items",
      description: tools.recommend_items.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          tasteNotes: { type: SchemaType.STRING, description: "Flavor preferences e.g. smoky, earthy, umami" },
          dietaryFlags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          occasion: { type: SchemaType.STRING, description: "e.g. date night, light lunch, celebration" },
          pairingPreference: { type: SchemaType.STRING, description: "wine or botanical zero-proof" },
        },
      },
    },
    {
      name: "add_to_cart",
      description: tools.add_to_cart.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          itemId: { type: SchemaType.STRING, description: "Item ID or slug to add" },
          quantity: { type: SchemaType.INTEGER, description: "Quantity (default 1)" },
          variantId: { type: SchemaType.STRING, description: "Optional variant ID" },
          customizationOptionIds: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "Option IDs for extras/removals",
          },
          specialInstructions: { type: SchemaType.STRING },
        },
        required: ["itemId"],
      },
    },
    {
      name: "view_cart",
      description: tools.view_cart.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {},
      },
    },
    {
      name: "update_cart_item",
      description: tools.update_cart_item.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          cartItemId: { type: SchemaType.STRING },
          quantity: { type: SchemaType.INTEGER },
        },
        required: ["cartItemId", "quantity"],
      },
    },
    {
      name: "remove_from_cart",
      description: tools.remove_from_cart.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          cartItemId: { type: SchemaType.STRING },
        },
        required: ["cartItemId"],
      },
    },
    {
      name: "prepare_checkout",
      description: tools.prepare_checkout.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          fulfillmentMode: { type: SchemaType.STRING, description: "DINE_IN, PICKUP, or DELIVERY" },
          tableNumber: { type: SchemaType.STRING },
        },
      },
    },
    {
      name: "get_restaurant_information",
      description: tools.get_restaurant_information.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {},
      },
    },
    {
      name: "get_order_status",
      description: tools.get_order_status.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          orderRef: { type: SchemaType.STRING, description: "Order reference e.g. ECHO-1234" },
        },
        required: ["orderRef"],
      },
    },
    {
      name: "cancel_order",
      description: tools.cancel_order.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          orderRef: { type: SchemaType.STRING },
          reason: { type: SchemaType.STRING },
        },
        required: ["orderRef"],
      },
    },
    {
      name: "book_table",
      description: tools.book_table.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          partySize: { type: SchemaType.INTEGER, description: "Number of guests (default 2)" },
          date: { type: SchemaType.STRING, description: "Date e.g. tonight or tomorrow" },
          time: { type: SchemaType.STRING, description: "Preferred time e.g. 7:00 PM" },
          seatingArea: { type: SchemaType.STRING, description: "Hearthside, Main Dining Room, or Botanical Patio" },
        },
      },
    },
  ];
}

// Deterministic Semantic Intent Router for offline / fallback / zero-credential mode
export async function executeFallbackIntent(
  userMessage: string,
  session: SessionContext
): Promise<ConciergeResponse> {
  const q = userMessage.toLowerCase().trim();
  const promptConfig = getPromptForLocale(session.locale);
  const conv = await getOrCreateConversation(session.sessionId, session.locale);

  // 1. Check order status if ref mentioned or "status"
  const orderRefMatch = userMessage.match(/ECHO-[A-Za-z0-9]+/i);
  if (orderRefMatch || q.includes("status") || q.includes("track my order") || q.includes("where is my order")) {
    let ref = orderRefMatch ? orderRefMatch[0].toUpperCase() : undefined;
    if (!ref) {
      // Find latest order for this session
      const latestOrder = await db.order.findFirst({
        where: { guestSessionId: session.sessionId },
        orderBy: { createdAt: "desc" },
      });
      if (latestOrder) ref = latestOrder.orderRef;
    }

    if (ref) {
      const result = await tools.get_order_status.execute({ orderRef: ref }, session);
      const text = result.error
        ? `I could not locate an active order with reference ${ref}. Would you like me to verify your recent order history?`
        : `Order ${result.orderRef} is currently **${result.status}** (${result.fulfillmentMode}). Payment status: ${result.payment}. Total: ${result.total}.`;
      
      await recordMessage(conv.conversationId, "assistant", text, [{ name: "get_order_status", args: { orderRef: ref } }], [{ tool: "get_order_status", result }]);
      return {
        text,
        toolCalls: [{ name: "get_order_status", args: { orderRef: ref } }],
        toolResults: [{ tool: "get_order_status", result }],
        conversationId: conv.conversationId,
        suggestions: ["View full order timeline", "Cancel this order", "Browse hearth menu"],
      };
    }
  }

  // 2. Cart management intents
  if (q.includes("cart") || q.includes("my bag") || q.includes("show cart") || q.includes("what did i order")) {
    const result = await tools.view_cart.execute({}, session);
    const text = result.itemCount === 0
      ? "Your cart is empty right now. Want me to suggest something?"
      : `You've got ${result.itemCount} item${result.itemCount > 1 ? "s" : ""} in your cart, totaling ${result.formattedTotal}. Ready to check out, or want to add more?`;
    
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "view_cart", args: {} }], [{ tool: "view_cart", result }]);
    return {
      text,
      toolCalls: [{ name: "view_cart", args: {} }],
      toolResults: [{ tool: "view_cart", result }],
      conversationId: conv.conversationId,
      suggestions: result.itemCount > 0 ? ["Proceed to checkout", "Explore dessert", "Clear cart"] : ["View starters", "Chef recommendations"],
    };
  }

  // 3. Checkout intents
  if (q.includes("checkout") || q.includes("ready to pay") || q.includes("bill") || q.includes("place order")) {
    const result = await tools.prepare_checkout.execute({}, session);
    let text = "";
    if (result.error) {
      text = `Hmm, ${result.error}. Want to browse the menu first?`;
    } else {
      text = `All set — ${result.summary.itemCount} items, ${result.summary.formattedTotal} total. You can finish checkout whenever you're ready.`;
    }
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "prepare_checkout", args: {} }], [{ tool: "prepare_checkout", result }]);
    return {
      text,
      toolCalls: [{ name: "prepare_checkout", args: {} }],
      toolResults: [{ tool: "prepare_checkout", result }],
      conversationId: conv.conversationId,
      suggestions: ["Open Checkout", "View Cart", "Add more items"],
    };
  }

  // 4. Table booking / reservation intent (e.g. "book a table", "table for 2", "reserve tonight")
  if (
    q.includes("book") ||
    q.includes("table") ||
    q.includes("reserv") ||
    q.includes("seating") ||
    q.includes("seat for")
  ) {
    const numMatch = q.match(/\b([1-9]|1[0-2])\b/);
    const partySize = numMatch ? parseInt(numMatch[1], 10) : 2;
    const result = await tools.book_table.execute({ partySize }, session);
    const text = `I'd love to arrange a table for ${partySize} at our white oak hearth tonight. Please select your preferred dinner seating:`;

    await recordMessage(
      conv.conversationId,
      "assistant",
      text,
      [{ name: "book_table", args: { partySize } }],
      [{ tool: "book_table", result }]
    );
    return {
      text,
      toolCalls: [{ name: "book_table", args: { partySize } }],
      toolResults: [{ tool: "book_table", result }],
      conversationId: conv.conversationId,
      suggestions: ["6:00 PM", "7:00 PM", "8:00 PM", "Browse dinner menu"],
    };
  }

  // 5. Add to cart intent (e.g. "add ember flatbread", "order duck", "add sourdough")
  if (q.startsWith("add ") || q.includes("add to cart") || q.startsWith("order ") || q.includes("i'd like the ") || q.includes("i want the ")) {
    // Find matching dish from db
    const allDishes = await db.menuItem.findMany({ where: { isAvailable: true } });
    const matched = allDishes.find((d) => {
      const name = d.name.toLowerCase();
      const slug = d.slug.toLowerCase();
      return q.includes(name) || q.includes(slug) || name.split(" ").some((w) => w.length > 3 && q.includes(w));
    });

    if (matched) {
      // Check quantity mentioned
      const numMatch = q.match(/\b([1-9])\b/);
      const qty = numMatch ? parseInt(numMatch[1], 10) : 1;
      const result = await tools.add_to_cart.execute({ itemId: matched.id, quantity: qty }, session);
      const text = `Added ${qty}x **${matched.name}** ($${(matched.basePriceMinor / 100).toFixed(2)}) to your cart. Total so far: ${result.summary.formattedSubtotal}.`;
      await recordMessage(conv.conversationId, "assistant", text, [{ name: "add_to_cart", args: { itemId: matched.id, quantity: qty } }], [{ tool: "add_to_cart", result }]);
      return {
        text,
        toolCalls: [{ name: "add_to_cart", args: { itemId: matched.id, quantity: qty } }],
        toolResults: [{ tool: "add_to_cart", result }],
        conversationId: conv.conversationId,
        suggestions: ["View Cart", "Proceed to checkout", "Pair with wine", "Explore dessert"],
      };
    }
  }

  // 6. Dietary inquiries (vegan, vegetarian, gluten-free, dairy-free)
  const isVegan = q.includes("vegan");
  const isVegetarian = q.includes("vegetarian") || q.includes("veg ");
  const isGlutenFree = q.includes("gluten") || q.includes("celiac");

  if (isVegan || isVegetarian || isGlutenFree) {
    const flags: string[] = [];
    if (isVegan) flags.push("VEGAN");
    if (isVegetarian) flags.push("VEGETARIAN");
    if (isGlutenFree) flags.push("GLUTEN_FREE");

    const result = await tools.browse_menu.execute({ dietaryFlags: flags }, session);
    const names = result.slice(0, 3).map((r: any) => r.name);
    const text = `Sure! We've got some great ${flags.join(" & ").toLowerCase()} options — **${names.join("**, **")}**. Want details on any of these?`;
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "browse_menu", args: { dietaryFlags: flags } }], [{ tool: "browse_menu", result }]);
    return {
      text,
      toolCalls: [{ name: "browse_menu", args: { dietaryFlags: flags } }],
      toolResults: [{ tool: "browse_menu", result: result.slice(0, 4) }],
      conversationId: conv.conversationId,
      suggestions: result.slice(0, 3).map((r: any) => `Tell me more about ${r.name}`),
    };
  }

  // 7. Recommendations / pairing inquiries / what to eat
  if (
    q.includes("recommend") ||
    q.includes("suggestion") ||
    q.includes("signature") ||
    q.includes("pair") ||
    q.includes("special") ||
    q.includes("what is good") ||
    q.includes("what's good") ||
    q.includes("what should i eat") ||
    q.includes("best dish") ||
    q.includes("popular") ||
    q.includes("dinner for two") ||
    q.includes("date night")
  ) {
    const result = await tools.recommend_items.execute({ tasteNotes: "smoky, aromatic, umami" }, session);
    const text = `Tonight I'd go with the **${result.highlight.name}** (${result.highlight.priceFormatted}) — it's really good. And the **${result.complement.name}** (${result.complement.priceFormatted}) pairs nicely with it. Want me to add either to your cart?`;
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "recommend_items", args: {} }], [{ tool: "recommend_items", result }]);
    return {
      text,
      toolCalls: [{ name: "recommend_items", args: {} }],
      toolResults: [{ tool: "recommend_items", result }],
      conversationId: conv.conversationId,
      suggestions: [
        `Add ${result.highlight.name} to cart`,
        `Add ${result.complement.name} to cart`,
        "Show all wood-fired mains",
        "Book a table for 2",
      ],
    };
  }

  // 8. Restaurant information (hours, address, philosophy)
  if (q.includes("hours") || q.includes("address") || q.includes("location") || q.includes("phone") || q.includes("contact") || q.includes("parking")) {
    const result = await tools.get_restaurant_information.execute({}, session);
    const text = `We're at **${result.address}**, open **${result.hours}**. Call us at **${result.phone}** if you need anything.`;
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "get_restaurant_information", args: {} }], [{ tool: "get_restaurant_information", result }]);
    return {
      text,
      toolCalls: [{ name: "get_restaurant_information", args: {} }],
      toolResults: [{ tool: "get_restaurant_information", result }],
      conversationId: conv.conversationId,
      suggestions: ["Book a table", "Explore Our Menu", "Check Reservation Info"],
    };
  }

  // 9. General menu browse and friendly hospitality greeting
  const recResult = await tools.recommend_items.execute({ tasteNotes: "hearth signature" }, session);
  const text = `Hey! Tonight we're featuring dishes cooked over white oak embers, including our **${recResult.highlight.name}** (${recResult.highlight.priceFormatted}) and **${recResult.complement.name}** (${recResult.complement.priceFormatted}). What are you in the mood for?`;

  await recordMessage(conv.conversationId, "assistant", text, undefined, [{ tool: "recommend_items", result: recResult }]);
  return {
    text,
    toolResults: [{ tool: "recommend_items", result: recResult }],
    conversationId: conv.conversationId,
    suggestions: [
      `Add ${recResult.highlight.name}`,
      "Book a table for 2",
      "Tonight's specials",
      "Vegan options",
    ],
  };
}

// Master agentic execution function
export async function processConciergeTurn(
  userMessage: string,
  session: SessionContext
): Promise<ConciergeResponse> {
  const config = getConfig();
  const conv = await getOrCreateConversation(session.sessionId, session.locale);
  const promptConfig = getPromptForLocale(session.locale);

  // Record user's turn in DB
  await recordMessage(conv.conversationId, "user", userMessage);

  // If Gemini API key is configured, use Google Generative AI agent loop
  if (config.googleAiKey) {
    try {
      const genAI = new GoogleGenerativeAI(config.googleAiKey);
      const model = genAI.getGenerativeModel({
        model: config.aiModel || "gemini-2.0-flash",
        systemInstruction: promptConfig.systemPrompt,
        tools: [{ functionDeclarations: buildGeminiToolDeclarations() }],
      });

      // Format recent messages for context
      const chatHistory = conv.recentMessages.slice(-10).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history: chatHistory });
      let result = await chat.sendMessage(userMessage);
      let response = result.response;

      const executedCalls: { name: string; args: any }[] = [];
      const executedResults: { tool: string; result: any }[] = [];

      // Loop while the model requests tool calls (up to 4 steps)
      let iterations = 0;
      while (response.functionCalls() && response.functionCalls()!.length > 0 && iterations < 4) {
        iterations++;
        const calls = response.functionCalls()!;
        const functionResponses = [];

        for (const call of calls) {
          const toolDef = tools[call.name];
          if (toolDef) {
            try {
              const res = await toolDef.execute(call.args, session);
              executedCalls.push({ name: call.name, args: call.args });
              executedResults.push({ tool: call.name, result: res });
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { result: res },
                },
              });
            } catch (err: any) {
              functionResponses.push({
                functionResponse: {
                  name: call.name,
                  response: { error: err.message || "Execution error" },
                },
              });
            }
          }
        }

        result = await chat.sendMessage(functionResponses);
        response = result.response;
      }

      const replyText = response.text() || "How else may I assist with your dining experience tonight?";
      await recordMessage(
        conv.conversationId,
        "assistant",
        replyText,
        executedCalls.length > 0 ? executedCalls : undefined,
        executedResults.length > 0 ? executedResults : undefined
      );

      return {
        text: replyText,
        toolCalls: executedCalls,
        toolResults: executedResults,
        conversationId: conv.conversationId,
        suggestions: promptConfig.sampleQuestions.slice(0, 3),
      };
    } catch (err) {
      console.warn("Gemini agent call encountered an issue, transitioning to deterministic fallback:", err);
      // Seamlessly fall through to deterministic fallback
    }
  }

  // Fallback to deterministic intent execution
  return executeFallbackIntent(userMessage, session);
}
