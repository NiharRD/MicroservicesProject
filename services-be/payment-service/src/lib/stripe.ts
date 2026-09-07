// src/lib/stripe.ts
import Stripe from "stripe";

// Fail fast if the environment variable is missing
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Please set it in your .env file.",
  );
}

// Initialize and export the Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  // It's a good practice to lock your API version to match your types
  typescript: true,
  appInfo: {
    name: "Your-App-Name",
    version: "1.0.0",
  },
});
