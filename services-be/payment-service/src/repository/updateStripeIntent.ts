import prisma from "../../prisma/client.ts";

export async function updateStripeIntent(
  orderId: string,
  stripeIntentId: string,
) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { stripeIntentId },
    });
    return order;
  } catch (error) {
    console.error("Error updating Stripe intent:", error);
    throw new Error("Failed to update Stripe intent");
  }
}
