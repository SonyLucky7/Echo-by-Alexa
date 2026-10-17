import { db } from "@/lib/db";
import { transitionOrder } from "@/lib/orders/operations";
import { FulfillmentStatus, PaymentStatus } from "@/types";

export async function processSandboxCheckout(orderId: string): Promise<{ orderRef: string; checkoutUrl: string }> {
  const order = await db.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  // Update payment status to SUCCEEDED
  await db.payment.update({
    where: { orderId },
    data: {
      status: PaymentStatus.PAID,
      providerPaymentId: `sim_pay_${Date.now()}`,
    },
  });

  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: PaymentStatus.PAID,
    },
  });

  // Transition order to CONFIRMED
  await transitionOrder(
    orderId,
    FulfillmentStatus.CONFIRMED,
    "hearth_system",
    "Order verified and placed in live hearth queue"
  );

  return {
    orderRef: order.orderRef,
    checkoutUrl: `/orders/${order.orderRef}?status=success&sandbox=true`,
  };
}
