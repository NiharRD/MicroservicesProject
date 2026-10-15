import type { Request, Response } from "express";
import { getDrinkDetails } from "../services/getDrinkDetails.ts";
import { createOrder } from "../repository/createOrder.ts";
import { updateStripeIntent } from "../repository/updateStripeIntent.ts";
import { stripe } from "../lib/stripe.ts";

import { v4 as uuidv4 } from "uuid";
export async function checkOutController(req: Request, res: Response) {
  try {
    const { drinkId, amount } = req.body;
    // Order.userId is a String in the DB; clients may send a number
    const userId = req.body.userId != null ? String(req.body.userId) : "";
    if (!userId || !drinkId || !Number.isInteger(amount) || amount < 1) {
      return res.status(400).json({
        message: "userId, drinkId and a positive integer amount are required",
      });
    }

    const drinkDetails = await getDrinkDetails(drinkId);
    const price = drinkDetails?.data?.price;
    if (typeof price !== "number") {
      return res.status(422).json({ message: "Drink has no valid price" });
    }
    const totalPrice = price * amount;
    const idempotencyKey = uuidv4();
    const order = await createOrder(
      userId,
      drinkId,
      amount,
      totalPrice,
      idempotencyKey,
    ); // create order in the database

    // 3. Create a payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalPrice * 100, // Stripe expects amount in cents
        currency: "usd",
        metadata: { orderId: order.id }, // Attach order ID for the webhook
      },
      { idempotencyKey },
    );

    await updateStripeIntent(order.id, paymentIntent.id);
    // // 4. Save the Stripe Intent ID
    // await prisma.order.update({
    //   where: { id: order.id },
    //   data: { stripeIntentId: paymentIntent.id },
    // });

    res.status(200).json({
      message: "Order created successfully",
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error during checkout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
