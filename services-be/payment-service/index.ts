import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import paymentRouter from "./src/routes/paymentRoute.js";

import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payment/webhook") {
    next(); // Skip json parsing for webhooks
  } else {
    express.json()(req, res, next); // Parse json for everything else (like checkout)
  }
});
app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "hello cuite from payments service" });
});
app.use("/api/payment", paymentRouter); // yeah yeah allowed , check from the CMS backend ehehhe.

app.listen(PORT, () => {
  console.log(`Payment service is running on port ${PORT}`);
});
