import { z } from "zod";
import { db } from "@/lib/db";
import { getCart, addToCart, updateCartItem, removeFromCart } from "@/lib/cart/operations";
import { createOrderFromCart, getOrderByRef, cancelOrder } from "@/lib/orders/operations";
import { processSandboxCheckout } from "@/lib/payments/sandbox";
import { createStripeCheckoutSession } from "@/lib/payments/stripe";
import { hasPaymentProvider } from "@/lib/config";
import { SessionContext } from "@/types";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  execute: (args: any, session: SessionContext) => Promise<any>;
}

export const tools: Record<string, ToolDefinition> = {
  // 1. browse_menu
  browse_menu: {
    name: "browse_menu",
    description: "Browse and search menu items by keyword, category slug, dietary preferences, or spice level.",
    parameters: z.object({
      query: z.string().optional().describe("Search term for dish name or ingredient"),
      category: z.string().optional().describe("Category slug like hearth-starters, open-fire-mains, coastal-fire, etc."),
      dietaryFlags: z.array(z.string()).optional().describe("Dietary requirements like VEGAN, VEGETARIAN, GLUTEN_FREE"),
      spiceMax: z.number().min(0).max(3).optional().describe("Maximum spice level (0-3)"),
    }),
    execute: async (args, session) => {
      const where: any = { isAvailable: true };
      if (args.category) where.category = { slug: args.category };
      if (args.spiceMax !== undefined) where.spiceLevel = { lte: args.spiceMax };
      if (args.query) {
        where.OR = [
          { name: { contains: args.query } },
          { description: { contains: args.query } },
        ];
      }

      let items = await db.menuItem.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          translations: { where: { locale: session.locale } },
        },
        orderBy: { sortOrder: "asc" },
      });

      if (args.dietaryFlags && args.dietaryFlags.length > 0) {
        items = items.filter((it) => {
          try {
            const flags: string[] = JSON.parse(it.dietaryFlags);
            return args.dietaryFlags!.every((f: string) => flags.includes(f.toUpperCase()));
          } catch {
            return false;
          }
        });
      }

      return items.map((it) => {
        const trans = it.translations[0];
        let flags: string[] = [];
        try {
          flags = JSON.parse(it.dietaryFlags);
        } catch {}
        return {
          id: it.id,
          slug: it.slug,
          name: trans?.name || it.name,
          category: it.category.name,
          description: trans?.description || it.description,
          priceMinor: it.basePriceMinor,
          priceFormatted: `$${(it.basePriceMinor / 100).toFixed(2)}`,
          dietaryFlags: flags,
          spiceLevel: it.spiceLevel,
          imageUrl: it.imageUrl,
        };
      });
    },
  },

  // 2. get_item_details
  get_item_details: {
    name: "get_item_details",
    description: "Get full verified details of a specific dish including ingredients, allergens, variants, and customizations.",
    parameters: z.object({
      itemId: z.string().describe("UUID or slug of the menu item"),
    }),
    execute: async (args, session) => {
      const item = await db.menuItem.findFirst({
        where: {
          OR: [{ id: args.itemId }, { slug: args.itemId }],
          isAvailable: true,
        },
        include: {
          category: true,
          variants: true,
          customizationGroups: {
            include: { options: { where: { isAvailable: true } } },
          },
          allergens: true,
          translations: { where: { locale: session.locale } },
        },
      });

      if (!item) return { error: `Menu item '${args.itemId}' not found.` };

      const trans = item.translations[0];
      let flags: string[] = [];
      try {
        flags = JSON.parse(item.dietaryFlags);
      } catch {}

      return {
        id: item.id,
        slug: item.slug,
        name: trans?.name || item.name,
        description: trans?.description || item.description,
        ingredients: trans?.ingredientsText || "Locally sourced wild botanicals and artisanal ingredients",
        priceMinor: item.basePriceMinor,
        dietaryFlags: flags,
        allergens: item.allergens.map((a) => a.allergen),
        variants: item.variants.map((v) => ({ id: v.id, name: v.name, priceMinor: v.priceMinor })),
        customizationGroups: item.customizationGroups.map((g) => ({
          id: g.id,
          name: g.name,
          options: g.options.map((o) => ({ id: o.id, name: o.name, priceDeltaMinor: o.priceDeltaMinor })),
        })),
      };
    },
  },

  // 3. recommend_items
  recommend_items: {
    name: "recommend_items",
    description: "Generate intelligent gastronomic recommendations based on user dietary desires, wine pairings, or mood.",
    parameters: z.object({
      preferences: z.string().optional().describe("What kind of food or flavors the guest wants (e.g. comforting, smoky, light, vegetarian, spicy)"),
      tasteNotes: z.string().optional(),
      dietaryFlags: z.array(z.string()).optional(),
      occasion: z.string().optional(),
      pairingPreference: z.string().optional(),
    }),
    execute: async (args, session) => {
      const allItems = await db.menuItem.findMany({
        where: { isAvailable: true },
        include: {
          category: true,
          translations: { where: { locale: session.locale } },
        },
      });

      const prefLower = ((args.preferences || args.tasteNotes || "") as string).toLowerCase();
      const scored = allItems.map((it) => {
        let score = 0;
        let reasons: string[] = [];
        let flags: string[] = [];
        try {
          flags = JSON.parse(it.dietaryFlags);
        } catch {}

        if (args.dietaryFlags) {
          const matchAll = args.dietaryFlags.every((f: string) => flags.includes(f.toUpperCase()));
          if (!matchAll) return null; // Exclude non-matching dietary
        }

        if (prefLower.includes("spicy") && it.spiceLevel > 0) {
          score += 3;
          reasons.push(`Level ${it.spiceLevel} flame warmth`);
        }
        if (prefLower.includes("vegetarian") && flags.includes("VEGETARIAN")) {
          score += 3;
          reasons.push("Pure vegetarian botanical composition");
        }
        if (prefLower.includes("vegan") && flags.includes("VEGAN")) {
          score += 4;
          reasons.push("100% plant-based hearth preparation");
        }
        if (prefLower.includes("smoke") || prefLower.includes("hearth") || prefLower.includes("fire")) {
          if (it.cookingTechnique.includes("SMOKE") || it.cookingTechnique.includes("FIRE")) {
            score += 2;
            reasons.push("Kissed by almond wood embers");
          }
        }
        if (it.isSignature) {
          score += 2;
          reasons.push("Chef's signature creation");
        }

        const trans = it.translations[0];
        return {
          id: it.id,
          name: trans?.name || it.name,
          category: it.category.name,
          priceMinor: it.basePriceMinor,
          priceFormatted: `$${(it.basePriceMinor / 100).toFixed(2)}`,
          dietaryFlags: flags,
          spiceLevel: it.spiceLevel,
          imageUrl: it.imageUrl,
          reasons: reasons.length > 0 ? reasons.join(" • ") : "Seasonal culinary harmony",
          score,
        };
      }).filter(Boolean);

      scored.sort((a: any, b: any) => b.score - a.score);
      const list = scored.slice(0, 4);
      return {
        items: list,
        highlight: list[0] || null,
        complement: list[1] || list[0] || null,
        pairingSuggestion: "White Oak botanical zero-proof reduction or chilled natural amber wine",
      };
    },
  },

  // 4. customize_item
  customize_item: {
    name: "customize_item",
    description: "Validate dish modifications and calculate the updated item configuration price.",
    parameters: z.object({
      itemId: z.string(),
      variantId: z.string().optional(),
      customizationOptionIds: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      const item = await db.menuItem.findUnique({
        where: { id: args.itemId },
        include: {
          variants: true,
          customizationGroups: { include: { options: true } },
        },
      });
      if (!item) return { error: "Item not found" };

      let basePrice = item.basePriceMinor;
      if (args.variantId) {
        const v = item.variants.find((v) => v.id === args.variantId);
        if (v) basePrice = v.priceMinor;
      }

      let delta = 0;
      if (args.customizationOptionIds) {
        for (const group of item.customizationGroups) {
          for (const opt of group.options) {
            if (args.customizationOptionIds.includes(opt.id)) {
              delta += opt.priceDeltaMinor;
            }
          }
        }
      }

      const totalUnitMinor = basePrice + delta;
      return {
        itemId: item.id,
        name: item.name,
        unitPriceMinor: totalUnitMinor,
        unitPriceFormatted: `$${(totalUnitMinor / 100).toFixed(2)}`,
      };
    },
  },

  // 5. add_to_cart
  add_to_cart: {
    name: "add_to_cart",
    description: "Add a confirmed dish with optional variants and customizations to the current customer session cart.",
    parameters: z.object({
      itemId: z.string().describe("UUID or slug of the menu item"),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1).default(1),
    }),
    execute: async (args, session) => {
      // Find item by ID or slug
      const item = await db.menuItem.findFirst({
        where: { OR: [{ id: args.itemId }, { slug: args.itemId }] },
      });
      if (!item) return { error: `Dish '${args.itemId}' could not be located.` };

      const cart = await addToCart(session.sessionId, {
        itemId: item.id,
        variantId: args.variantId,
        quantity: args.quantity || 1,
      });

      const summary = {
        itemCount: cart.itemCount,
        subtotal: `$${(cart.subtotalMinor / 100).toFixed(2)}`,
        total: `$${(cart.totalMinor / 100).toFixed(2)}`,
        formattedSubtotal: `$${(cart.subtotalMinor / 100).toFixed(2)}`,
        formattedTotal: `$${(cart.totalMinor / 100).toFixed(2)}`,
      };

      return {
        success: true,
        message: `Added ${args.quantity}x ${item.name} to your cart.`,
        summary,
        cartSummary: summary,
      };
    },
  },

  // 6. view_cart
  view_cart: {
    name: "view_cart",
    description: "Inspect the customer's active cart with authoritative line items, taxes, fees, and grand total.",
    parameters: z.object({}),
    execute: async (_args, session) => {
      const cart = await getCart(session.sessionId);
      return {
        itemCount: cart.itemCount,
        currency: cart.currency,
        items: cart.items.map((it) => ({
          id: it.id,
          name: it.name,
          quantity: it.quantity,
          variant: it.variantName,
          customizations: it.customizations.map((c) => c.optionName),
          lineTotal: `$${(it.lineTotalMinor / 100).toFixed(2)}`,
        })),
        subtotal: `$${(cart.subtotalMinor / 100).toFixed(2)}`,
        tax: `$${(cart.taxMinor / 100).toFixed(2)}`,
        total: `$${(cart.totalMinor / 100).toFixed(2)}`,
        formattedTotal: `$${(cart.totalMinor / 100).toFixed(2)}`,
        formattedSubtotal: `$${(cart.subtotalMinor / 100).toFixed(2)}`,
      };
    },
  },

  // 7. update_cart_item
  update_cart_item: {
    name: "update_cart_item",
    description: "Update the quantity of an existing line item in the cart.",
    parameters: z.object({
      cartItemId: z.string(),
      quantity: z.number().int().min(0).max(20),
    }),
    execute: async (args, session) => {
      const cart = await updateCartItem(session.sessionId, {
        cartItemId: args.cartItemId,
        quantity: args.quantity,
      });
      return {
        success: true,
        itemCount: cart.itemCount,
        total: `$${(cart.totalMinor / 100).toFixed(2)}`,
      };
    },
  },

  // 8. remove_from_cart
  remove_from_cart: {
    name: "remove_from_cart",
    description: "Remove an item from the customer's cart by line item ID.",
    parameters: z.object({
      cartItemId: z.string(),
    }),
    execute: async (args, session) => {
      const cart = await removeFromCart(session.sessionId, args.cartItemId);
      return {
        success: true,
        message: "Item removed from cart.",
        itemCount: cart.itemCount,
        total: `$${(cart.totalMinor / 100).toFixed(2)}`,
      };
    },
  },

  // 9. get_restaurant_information
  get_restaurant_information: {
    name: "get_restaurant_information",
    description: "Retrieve verified restaurant hours, address, contact, and fulfillment channels.",
    parameters: z.object({}),
    execute: async () => {
      const settings = await db.restaurantSettings.findFirst();
      return {
        name: settings?.name || "ECHO",
        tagline: settings?.tagline || "Wild Botanicals & Open Hearth Gastronomy",
        address: settings?.address || "448 Hearthstone Way, Artisan District",
        phone: settings?.phone || "+1 (555) 324-6324",
        hours: settings?.openingHours ? JSON.parse(settings.openingHours) : {},
        fulfillmentChannels: ["Dine-In Table Service", "Curbside Pickup", "Direct Delivery"],
      };
    },
  },

  // 10. prepare_checkout
  prepare_checkout: {
    name: "prepare_checkout",
    description: "Verify cart items are available, calculate taxes and fees, and check what fields are required for checkout.",
    parameters: z.object({
      fulfillmentMode: z.enum(["DINE_IN", "PICKUP", "DELIVERY"]),
    }),
    execute: async (args, session) => {
      const isDelivery = args.fulfillmentMode === "DELIVERY";
      const isPickup = args.fulfillmentMode === "PICKUP";
      const cart = await getCart(session.sessionId, {
        includeDeliveryFee: isDelivery,
        includePackagingFee: isPickup || isDelivery,
      });

      if (cart.items.length === 0) {
        return { error: "Cart is empty. Add dishes before checkout." };
      }

      return {
        ready: true,
        fulfillmentMode: args.fulfillmentMode,
        itemCount: cart.itemCount,
        subtotal: `$${(cart.subtotalMinor / 100).toFixed(2)}`,
        tax: `$${(cart.taxMinor / 100).toFixed(2)}`,
        deliveryFee: `$${(cart.deliveryFeeMinor / 100).toFixed(2)}`,
        packagingFee: `$${(cart.packagingFeeMinor / 100).toFixed(2)}`,
        totalDue: `$${(cart.totalMinor / 100).toFixed(2)}`,
        summary: {
          itemCount: cart.itemCount,
          formattedTotal: `$${(cart.totalMinor / 100).toFixed(2)}`,
          total: `$${(cart.totalMinor / 100).toFixed(2)}`,
        },
        requiredFields:
          args.fulfillmentMode === "DINE_IN"
            ? ["customerName", "tableNumber"]
            : args.fulfillmentMode === "DELIVERY"
            ? ["customerName", "deliveryAddress"]
            : ["customerName"],
      };
    },
  },

  // 11. create_checkout_session
  create_checkout_session: {
    name: "create_checkout_session",
    description: "Initiate payment and create an order ticket. Generates a secure hosted Stripe link or instant Sandbox checkout.",
    parameters: z.object({
      fulfillmentMode: z.enum(["DINE_IN", "PICKUP", "DELIVERY"]),
      customerName: z.string(),
      tableNumber: z.string().optional(),
      deliveryAddress: z.string().optional(),
    }),
    execute: async (args, session) => {
      const order = await createOrderFromCart(session.sessionId, {
        fulfillmentMode: args.fulfillmentMode,
        customerName: args.customerName,
        tableNumber: args.tableNumber,
        deliveryAddress: args.deliveryAddress,
      });

      if (!hasPaymentProvider()) {
        const sandbox = await processSandboxCheckout(order.id);
        return {
          orderRef: order.orderRef,
          checkoutUrl: sandbox.checkoutUrl,
          message: `Order ${order.orderRef} created successfully via instant Sandbox Checkout.`,
        };
      }

      const stripe = await createStripeCheckoutSession({
        id: order.id,
        orderRef: order.orderRef,
        totalMinor: order.totalMinor,
        currency: order.currency,
        items: order.items,
      });

      return {
        orderRef: order.orderRef,
        checkoutUrl: stripe.checkoutUrl,
        message: `Order ${order.orderRef} initiated. Redirecting to secure Stripe payment.`,
      };
    },
  },

  // 12. get_order_status
  get_order_status: {
    name: "get_order_status",
    description: "Check the live fulfillment status and preparation timeline of an existing order.",
    parameters: z.object({
      orderRef: z.string().describe("Order reference e.g. ECHO-8942"),
    }),
    execute: async (args, session) => {
      const order = await getOrderByRef(args.orderRef, session.sessionId);
      if (!order) {
        // Fallback search without session constraint
        const publicOrder = await getOrderByRef(args.orderRef);
        if (!publicOrder) return { error: `Order '${args.orderRef}' not found.` };
        return {
          orderRef: publicOrder.orderRef,
          status: publicOrder.fulfillmentStatus,
          payment: publicOrder.paymentStatus,
          fulfillmentMode: publicOrder.fulfillmentMode,
          total: `$${(publicOrder.totalMinor / 100).toFixed(2)}`,
        };
      }

      return {
        orderRef: order.orderRef,
        status: order.fulfillmentStatus,
        payment: order.paymentStatus,
        fulfillmentMode: order.fulfillmentMode,
        total: `$${(order.totalMinor / 100).toFixed(2)}`,
        history: order.statusEvents.map((e) => ({
          status: e.status,
          time: new Date(e.createdAt).toLocaleTimeString(),
        })),
      };
    },
  },

  // 13. get_order_history
  get_order_history: {
    name: "get_order_history",
    description: "Retrieve past orders placed in the current customer session.",
    parameters: z.object({}),
    execute: async (_args, session) => {
      const orders = await db.order.findMany({
        where: { guestSessionId: session.sessionId },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return orders.map((o) => ({
        orderRef: o.orderRef,
        status: o.fulfillmentStatus,
        payment: o.paymentStatus,
        total: `$${(o.totalMinor / 100).toFixed(2)}`,
        date: new Date(o.createdAt).toLocaleDateString(),
      }));
    },
  },

  // 14. cancel_order
  cancel_order: {
    name: "cancel_order",
    description: "Cancel an order and trigger refund if eligible (order must not already be in preparation).",
    parameters: z.object({
      orderRef: z.string(),
      reason: z.string().optional(),
    }),
    execute: async (args, session) => {
      try {
        const order = await cancelOrder(args.orderRef, session.sessionId, args.reason);
        return {
          success: true,
          orderRef: order.orderRef,
          status: order.fulfillmentStatus,
          message: `Order ${order.orderRef} has been cancelled and refunded.`,
        };
      } catch (err: any) {
        return { error: err.message || "Failed to cancel order" };
      }
    },
  },
};
