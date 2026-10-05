import { Router } from "express";
import express from "express";
import { checkOutController } from "../controllers/checkoutController.ts";
import { webHookController } from "../controllers/webHookController.ts";
const paymentRouter = Router();

paymentRouter.post("/checkout", checkOutController); // should be Authenticated endpoint , a user should
// be logged in , and it should be make sure that  only the user can only and only order on his behalf .

paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webHookController,
); // should be public  hehhe ,endpoint

export default paymentRouter;

// CRUX :the payment provider's SDK needs the exact, unaltered byte sequence of the payload.

// express.raw() is a built-in Express middleware that reads the incoming request payload and converts it into a raw Buffer (a sequence of bytes) instead of parsing it into a JavaScript object.

// In your code, express.raw({ type: "application/json" }) tells Express: "If a request comes in with the Content-Type 'application/json', do not parse it into a JSON object. Leave it as a raw Buffer."

// Why is this used for Webhooks?
// Payment gateways like Stripe send webhooks to your server when a payment succeeds or fails. To prove the webhook actually came from Stripe (and not a malicious hacker), Stripe includes a cryptographic signature in the request headers.

// To verify this signature, the payment provider's SDK needs the exact, unaltered byte sequence of the payload. If you use express.json() instead, Express converts the payload into a JavaScript object, which strips out formatting (like whitespace) and changes the byte signature. The signature verification will then fail.
