import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import connectDB from "./src/config/db.ts";
import drinkRouter from "./src/routes/drinkRoutes.ts";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express, { response } from "express";
import type { Request, Response } from "express";
const app = express();
const PORT = process.env.PORT || 9000;

connectDB();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "hello cutie , from the catalog service" });
});

app.use("/api", drinkRouter);

console.log(drinkRouter.stack.map(l => l.route?.path)); app.listen(PORT, () => {
  console.log(`Catalog service is running on port ${PORT}`);
});
