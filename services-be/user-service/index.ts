import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express, { response } from "express";
import type { Request, Response } from "express";
import logInRouter from "./src/routes/loginRoute.ts";
import signUpRouter from "./src/routes/signUpRoute.ts";
import addressRouter from "./src/routes/addressRoute.ts";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "hello cuite from user service" });
});

app.use("/v1", logInRouter);
app.use("/v1", signUpRouter);
app.use("/v1", addressRouter);
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
