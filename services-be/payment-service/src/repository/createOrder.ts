import prisma from "../../prisma/client.ts";
export async function createOrder(
  userId: string,
  drinkId: string,
  amount: number,
  totalPrice: number,
  idempotencyKey: string,
) {
  try {
    const order = await prisma.order.create({
      data: {
        userId,
        drinkId,
        amount,
        totalPrice,
        idempotencyKey,
      },
    });
    return order;
  } catch (error) {
    console.error("Error creating order:", error);
    throw new Error("Failed to create order");
  }
}
