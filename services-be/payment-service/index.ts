import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import paymentRouter from "./src/routes/paymentRoute.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "hello cuite from payments service" });
});
app.use("/payments", paymentRouter);

app.listen(PORT, () => {
  console.log(`Payment service is running on port ${PORT}`);
});
