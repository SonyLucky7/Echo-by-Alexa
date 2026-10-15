import { z } from "zod";

export const menuQuerySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  dietary: z.string().optional(), // Comma-separated: "VEGAN,GLUTEN_FREE"
  spiceMax: z.coerce.number().min(0).max(3).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  locale: z.enum(["en", "hi", "te", "es", "fr"]).default("en"),
});

export const itemIdSchema = z.string().min(1);

export const cartItemCustomizationInputSchema = z.object({
  groupId: z.string(),
  optionId: z.string(),
});

export const addToCartInputSchema = z.object({
  itemId: z.string(),
  variantId: z.string().optional(),
  customizations: z.array(cartItemCustomizationInputSchema).default([]),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const updateCartItemInputSchema = z.object({
  cartItemId: z.string(),
  quantity: z.number().int().min(1).max(20).optional(),
  customizations: z.array(cartItemCustomizationInputSchema).optional(),
});

export const checkoutInputSchema = z.object({
  fulfillmentMode: z.enum(["DINE_IN", "PICKUP", "DELIVERY"]),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  customerPhone: z.string().min(7, "Phone must be at least 7 digits").optional().or(z.literal("")),
  // Details
  tableNumber: z.string().optional(),
  pickupTime: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryNotes: z.string().optional(),
  paymentProvider: z.enum(["STRIPE", "SANDBOX"]).default("STRIPE"),
});
