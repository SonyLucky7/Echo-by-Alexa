import { db } from "@/lib/db";
import { getCart, clearCart } from "@/lib/cart/operations";
import { isValidTransition, isCancellable } from "./state-machine";
import { FulfillmentStatus, PaymentStatus } from "@/types";

export interface CreateOrderInput {
  fulfillmentMode: "DINE_IN" | "PICKUP" | "DELIVERY";
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  tableNumber?: string;
  pickupTime?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  paymentProvider?: "STRIPE" | "SANDBOX";
}

export async function createOrderFromCart(
  sessionId: string,
  input: CreateOrderInput
) {
  const isDelivery = input.fulfillmentMode === "DELIVERY";
  const isPickup = input.fulfillmentMode === "PICKUP";

  const cart = await getCart(sessionId, {
    includeDeliveryFee: isDelivery,
    includePackagingFee: isPickup || isDelivery,
  });

  if (cart.items.length === 0) {
    throw new Error("Your cart is empty. Please select menu items before checkout.");
  }

  // Generate unique order reference
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderRef = `ECHO-${randomSuffix}`;

  // Package fulfillment details into JSON
  const fulfillmentDetails = JSON.stringify({
    mode: input.fulfillmentMode,
    tableNumber: input.tableNumber,
    pickupTime: input.pickupTime,
    deliveryAddress: input.deliveryAddress,
    deliveryNotes: input.deliveryNotes,
  });

  const order = await db.order.create({
    data: {
      orderRef,
      guestSessionId: sessionId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      fulfillmentMode: input.fulfillmentMode,
      fulfillmentDetails,
      currency: cart.currency,
      subtotalMinor: cart.subtotalMinor,
      taxMinor: cart.taxMinor,
      deliveryFeeMinor: cart.deliveryFeeMinor,
      packagingFeeMinor: cart.packagingFeeMinor,
      totalMinor: cart.totalMinor,
      paymentStatus: PaymentStatus.PENDING,
      fulfillmentStatus: FulfillmentStatus.PENDING_PAYMENT,
      items: {
        create: cart.items.map((line) => ({
          itemName: line.name,
          variantName: line.variantName,
          customizationsSnapshot: JSON.stringify(line.customizations),
          quantity: line.quantity,
          unitPriceMinor: line.unitPriceMinor,
          totalPriceMinor: line.lineTotalMinor,
        })),
      },
      statusEvents: {
        create: {
          status: FulfillmentStatus.PENDING_PAYMENT,
          changedBy: "customer",
          note: "Order created awaiting payment confirmation",
        },
      },
      payment: {
        create: {
          provider: input.paymentProvider || "STRIPE",
          amountMinor: cart.totalMinor,
          currency: cart.currency,
          status: PaymentStatus.PENDING,
        },
      },
    },
    include: {
      items: true,
      payment: true,
    },
  });

  // Clear cart after order creation
  await clearCart(sessionId);

  return order;
}

export async function transitionOrder(
  orderId: string,
  newStatus: FulfillmentStatus | string,
  changedBy: string = "system",
  note?: string
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (!isValidTransition(order.fulfillmentStatus, newStatus)) {
    throw new Error(
      `Invalid order state transition: cannot change from ${order.fulfillmentStatus} to ${newStatus}`
    );
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      fulfillmentStatus: newStatus,
      statusEvents: {
        create: {
          status: newStatus,
          changedBy,
          note,
        },
      },
    },
    include: {
      items: true,
      statusEvents: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  return updated;
}

export async function getOrderByRef(orderRef: string, sessionId?: string) {
  const where: any = { orderRef };
  if (sessionId) {
    // Session authorization check
    where.guestSessionId = sessionId;
  }

  const order = await db.order.findFirst({
    where,
    include: {
      items: true,
      statusEvents: { orderBy: { createdAt: "asc" } },
      payment: true,
    },
  });

  return order;
}

export async function cancelOrder(orderRef: string, sessionId?: string, reason?: string) {
  const order = await getOrderByRef(orderRef, sessionId);
  if (!order) {
    throw new Error("Order not found or unauthorized");
  }

  if (!isCancellable(order.fulfillmentStatus)) {
    throw new Error(
      `Order ${orderRef} is already in state "${order.fulfillmentStatus}" and cannot be cancelled.`
    );
  }

  const updated = await transitionOrder(
    order.id,
    FulfillmentStatus.CANCELLED,
    "customer",
    reason || "Cancelled by customer request"
  );

  // If already paid, update payment record to REFUNDED
  if (order.paymentStatus === PaymentStatus.PAID) {
    await db.payment.update({
      where: { orderId: order.id },
      data: { status: PaymentStatus.REFUNDED },
    });
    await db.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.REFUNDED },
    });
  }

  return updated;
}
