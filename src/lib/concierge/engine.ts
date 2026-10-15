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
      ? "Your dining cart is currently empty. May I suggest beginning with our Ember-Roasted King Oyster Mushrooms or Wood-Fired Sourdough?"
      : `Your cart contains ${result.itemCount} creation${result.itemCount > 1 ? "s" : ""} totaling ${result.formattedTotal}. Would you like to proceed to checkout or explore dessert?`;
    
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
      text = `Before we can proceed to checkout, ${result.error}. Would you like to browse our hearth selections?`;
    } else {
      text = `Your dining selection is confirmed at ${result.summary.formattedTotal} for ${result.summary.itemCount} items. You may now complete your table or delivery checkout securely.`;
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

  // 4. Add to cart intent (e.g. "add ember flatbread", "order duck", "add sourdough")
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
      const text = `I have added ${qty}x **${matched.name}** ($${(matched.basePriceMinor / 100).toFixed(2)}) to your cart. Cart subtotal is now ${result.summary.formattedSubtotal}.`;
      await recordMessage(conv.conversationId, "assistant", text, [{ name: "add_to_cart", args: { itemId: matched.id, quantity: qty } }], [{ tool: "add_to_cart", result }]);
      return {
        text,
        toolCalls: [{ name: "add_to_cart", args: { itemId: matched.id, quantity: qty } }],
        toolResults: [{ tool: "add_to_cart", result }],
        conversationId: conv.conversationId,
        suggestions: ["View Cart", "Proceed to checkout", "Pair with a beverage"],
      };
    }
  }

  // 5. Dietary inquiries (vegan, vegetarian, gluten-free, dairy-free)
  const isVegan = q.includes("vegan");
  const isVegetarian = q.includes("vegetarian") || q.includes("veg ");
  const isGlutenFree = q.includes("gluten") || q.includes("celiac");

  if (isVegan || isVegetarian || isGlutenFree) {
    const flags: string[] = [];
    if (isVegan) flags.push("VEGAN");
    if (isVegetarian) flags.push("VEGETARIAN");
    if (isGlutenFree) flags.push("GLUTEN_FREE");

    const result = await tools.browse_menu.execute({ dietaryFlags: flags }, session);
    const text = `We have crafted several wood-fired selections meeting your ${flags.join(" & ").toLowerCase()} preferences, including our **${result.slice(0, 3).map((r: any) => r.name).join("**, **")}**. Would you like details on any of these?`;
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "browse_menu", args: { dietaryFlags: flags } }], [{ tool: "browse_menu", result }]);
    return {
      text,
      toolCalls: [{ name: "browse_menu", args: { dietaryFlags: flags } }],
      toolResults: [{ tool: "browse_menu", result: result.slice(0, 4) }],
      conversationId: conv.conversationId,
      suggestions: result.slice(0, 3).map((r: any) => `Tell me more about ${r.name}`),
    };
  }

  // 6. Recommendations / pairing inquiries
  if (q.includes("recommend") || q.includes("suggestion") || q.includes("signature") || q.includes("pair") || q.includes("special")) {
    const result = await tools.recommend_items.execute({ tasteNotes: "smoky, aromatic, umami" }, session);
    const text = `Tonight, Chef recommends our centerpiece **${result.highlight.name}** (${result.highlight.priceFormatted}), alongside **${result.complement.name}** (${result.complement.priceFormatted}). Each dish celebrates live white-oak fire and wild seasonal botanicals.`;
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
      ],
    };
  }

  // 7. Restaurant information (hours, address, philosophy)
  if (q.includes("hours") || q.includes("address") || q.includes("location") || q.includes("phone") || q.includes("contact") || q.includes("parking")) {
    const result = await tools.get_restaurant_information.execute({}, session);
    const text = `ECHO is located at **${result.address}**. Our dining room is open **${result.hours}**. For inquiries, you may reach our hosts at **${result.phone}**.`;
    await recordMessage(conv.conversationId, "assistant", text, [{ name: "get_restaurant_information", args: {} }], [{ tool: "get_restaurant_information", result }]);
    return {
      text,
      toolCalls: [{ name: "get_restaurant_information", args: {} }],
      toolResults: [{ tool: "get_restaurant_information", result }],
      conversationId: conv.conversationId,
      suggestions: ["Explore Our Menu", "Check Reservation Info", "Chat with Alexa"],
    };
  }

  // 8. General menu browse fallback
  const menuItems = await tools.browse_menu.execute({}, session);
  const text = `Welcome to ECHO. Tonight we are featuring exquisite creations from our white oak hearth, including our **${menuItems[0]?.name || "Wood-Fired Specialties"}** and **${menuItems[1]?.name || "Seasonal Botanicals"}**. How may I guide your dining experience this evening?`;
  
  await recordMessage(conv.conversationId, "assistant", text);
  return {
    text,
    conversationId: conv.conversationId,
    suggestions: promptConfig.sampleQuestions.slice(0, 3),
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
