Here is exactly how these three components work together to secure the payment loop and prevent duplicate charges:

STRIPE_SECRET_KEY (Outbound Authentication): This is your server's private password. When your microservice asks Stripe to create a Payment Intent, it includes this key in the request header. It proves to Stripe that the request is legitimately coming from your business, ensuring no one else can initiate charges on your behalf. It is strictly kept on the server and never exposed to the frontend.

idempotencyKey (Double-Charge Prevention): Before calling Stripe, your server generates a unique string (like a UUID) for the specific order. You send this key alongside your request. If your server loses network connection and you retry the exact same checkout request, Stripe recognizes the idempotencyKey. Instead of processing a second payment, Stripe simply returns the cached success response from the first attempt.

Webhook Secret (Inbound Verification): Once the user pays, Stripe sends a webhook (an HTTP POST request) back to your server to notify you. Because your webhook URL must be public for Stripe to reach it, a malicious user could theoretically send a fake "payment successful" payload to steal inventory. To prevent this, Stripe cryptographically signs the payload using your Webhook Secret. Your server uses this same secret to verify the Stripe-Signature header. If the signature math matches, you know with absolute certainty the message came from Stripe and has not been tampered with.

The Secure Flow in Action \n
Checkout Initiation: Your server uses the STRIPE_SECRET_KEY and an idempotencyKey to safely create a payment intent with Stripe.

Client Payment: Your server passes a temporary token to the frontend. The user inputs their credit card directly into Stripe's secure UI. Your server never touches the raw card data.

Webhook Fulfillment: Stripe processes the card and pings your public webhook route. Your server uses the Webhook Secret to verify the signature, confirms the payment is real, and updates your database status to PAID.
