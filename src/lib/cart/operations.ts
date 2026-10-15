import { db } from "@/lib/db";
import { calculateCartTotals } from "./pricing";
import { CartLineSummary, CartTotals } from "@/types";

export async function getOrCreateCart(sessionId: string) {
  // Ensure guest session exists first to satisfy foreign key
  const existingSession = await db.guestSession.findUnique({
    where: { id: sessionId },
  });
  if (!existingSession) {
    await db.guestSession.create({
      data: { id: sessionId },
    });
  }

  let cart = await db.cart.findUnique({
    where: { guestSessionId: sessionId },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { guestSessionId: sessionId },
    });
  }

  return cart;
}

export async function getCart(
  sessionId: string,
  options?: { includeDeliveryFee?: boolean; includePackagingFee?: boolean }
): Promise<CartTotals> {
  const cart = await getOrCreateCart(sessionId);

  const cartWithItems = await db.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          item: true,
          variant: true,
          customizations: {
            include: {
              option: {
                include: {
                  group: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cartWithItems) {
    return calculateCartTotals([], options);
  }

  const lineSummaries: CartLineSummary[] = cartWithItems.items.map((cartItem) => {
    const basePrice = cartItem.variant
      ? cartItem.variant.priceMinor
      : cartItem.item.basePriceMinor;

    const customizationDeltas = cartItem.customizations.map(
      (c) => c.option.priceDeltaMinor
    );

    const unitPriceMinor =
      basePrice + customizationDeltas.reduce((sum, d) => sum + d, 0);
    const lineTotalMinor = unitPriceMinor * cartItem.quantity;

    return {
      id: cartItem.id,
      itemId: cartItem.itemId,
      name: cartItem.item.name,
      variantId: cartItem.variantId ?? undefined,
      variantName: cartItem.variant?.name ?? undefined,
      customizations: cartItem.customizations.map((c) => ({
        groupId: c.option.group.id,
        groupName: c.option.group.name,
        optionId: c.option.id,
        optionName: c.option.name,
        priceDeltaMinor: c.option.priceDeltaMinor,
      })),
      quantity: cartItem.quantity,
      unitPriceMinor,
      lineTotalMinor,
      imageUrl: cartItem.item.imageUrl,
    };
  });

  return calculateCartTotals(lineSummaries, options);
}

export async function addToCart(
  sessionId: string,
  input: {
    itemId: string;
    variantId?: string;
    customizations?: Array<{ groupId: string; optionId: string }>;
    quantity?: number;
  }
): Promise<CartTotals> {
  const { itemId, variantId, customizations = [], quantity = 1 } = input;
  const cart = await getOrCreateCart(sessionId);

  // 1. Verify item availability
  const item = await db.menuItem.findUnique({
    where: { id: itemId },
    include: {
      variants: true,
      customizationGroups: {
        include: { options: true },
      },
    },
  });

  if (!item) {
    throw new Error(`Menu item not found: ${itemId}`);
  }

  if (!item.isAvailable) {
    throw new Error(`"${item.name}" is currently 86'd / sold out`);
  }

  // 2. Validate variant if provided
  let validatedVariantId: string | undefined = undefined;
  if (variantId) {
    const variantMatch = item.variants.find((v) => v.id === variantId);
    if (!variantMatch) {
      throw new Error(`Invalid variant for item ${item.name}`);
    }
    validatedVariantId = variantMatch.id;
  } else if (item.variants.length > 0) {
    // Default to the default variant
    const defaultVar = item.variants.find((v) => v.isDefault) || item.variants[0];
    validatedVariantId = defaultVar.id;
  }

  // 3. Auto-populate default options for required groups if not provided
  const resolvedCustomizations = [...customizations];
  const groupSelections: Record<string, string[]> = {};
  for (const cust of resolvedCustomizations) {
    groupSelections[cust.groupId] = groupSelections[cust.groupId] || [];
    groupSelections[cust.groupId].push(cust.optionId);
  }

  for (const group of item.customizationGroups) {
    if (!groupSelections[group.id] || groupSelections[group.id].length === 0) {
      const defaultOpts = group.options.filter((o) => o.isDefault);
      if (defaultOpts.length > 0) {
        defaultOpts.forEach((defOpt) => {
          resolvedCustomizations.push({ groupId: group.id, optionId: defOpt.id });
          groupSelections[group.id] = groupSelections[group.id] || [];
          groupSelections[group.id].push(defOpt.id);
        });
      }
    }

    const selected = groupSelections[group.id] || [];
    if (group.isRequired && selected.length < group.minSelections) {
      throw new Error(
        `Selection required for "${group.name}": minimum ${group.minSelections}`
      );
    }
    if (selected.length > group.maxSelections) {
      throw new Error(
        `Exceeded maximum selections for "${group.name}": maximum ${group.maxSelections}`
      );
    }
  }

  // 4. Create new cart item
  const cartItem = await db.cartItem.create({
    data: {
      cartId: cart.id,
      itemId: item.id,
      variantId: validatedVariantId,
      quantity,
    },
  });

  // 5. Create customization links
  if (resolvedCustomizations.length > 0) {
    await db.cartItemCustomization.createMany({
      data: resolvedCustomizations.map((c) => ({
        cartItemId: cartItem.id,
        optionId: c.optionId,
      })),
    });
  }

  return getCart(sessionId);
}

export async function updateCartItem(
  sessionId: string,
  input: {
    cartItemId: string;
    quantity?: number;
  }
): Promise<CartTotals> {
  const { cartItemId, quantity } = input;
  const cart = await getOrCreateCart(sessionId);

  // Verify ownership
  const cartItem = await db.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });

  if (!cartItem) {
    throw new Error("Cart item not found or unauthorized");
  }

  if (quantity !== undefined) {
    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: cartItemId } });
    } else {
      await db.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: Math.min(20, Math.max(1, quantity)) },
      });
    }
  }

  return getCart(sessionId);
}

export async function removeFromCart(
  sessionId: string,
  cartItemId: string
): Promise<CartTotals> {
  const cart = await getOrCreateCart(sessionId);

  // Verify ownership
  const cartItem = await db.cartItem.findFirst({
    where: { id: cartItemId, cartId: cart.id },
  });

  if (!cartItem) {
    throw new Error("Cart item not found or unauthorized");
  }

  await db.cartItem.delete({
    where: { id: cartItemId },
  });

  return getCart(sessionId);
}

export async function clearCart(sessionId: string): Promise<void> {
  const cart = await getOrCreateCart(sessionId);
  await db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}
