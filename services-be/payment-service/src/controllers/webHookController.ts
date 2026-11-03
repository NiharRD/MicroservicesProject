import type { Request, Response } from "express";
import Stripe from "stripe"; // Added for strict Stripe typing
import { prisma } from "../../prisma/client.ts";
import { stripe } from "../lib/stripe.ts";
import { sendPaymentSucessfullDetailsToKafkaTopic } from "../services/sendNotification.ts";

export async function webHookController(req: Request, res: Response) {
  // express types header as string | string[] | undefined
  const signature = req.headers["stripe-signature"];

  // Strictly type the Stripe event
  let event: Stripe.Event;

  // process.env values are string | undefined.
  // TypeScript requires a guaranteed string here.
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res
      .status(500)
      .send("Webhook secret is missing from environment variables.");
  }

  try {
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    event = stripe.webhooks.constructEvent(
      req.body, // This must be a Buffer via express.raw()
      signature,
      webhookSecret,
    );
  } catch (err) {
    // In strict TS, 'err' is of type 'unknown'
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    return res.status(400).send(`Webhook Error: ${errorMessage}`);
  }

  // Return a 200 OK immediately so Stripe stops retrying
  res.json({ received: true });

  // Process the business logic asynchronously
  if (event.type === "payment_intent.succeeded") {
    // Cast the generic event object to the specific PaymentIntent type
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Metadata values are always strings.
    const orderId = paymentIntent.metadata.orderId;

    if (orderId) {
      await prisma.order.update({
        where: {
          // Note: If your Prisma ID is an Int, change this to Number(orderId)
          id: orderId,
        },
        data: { status: "PAID" },
      });

      await sendPaymentSucessfullDetailsToKafkaTopic(orderId);
    }

    // TODO: Notify Catalog Service that payment is complete
  }
}
