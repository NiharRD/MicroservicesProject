import express, { response } from "express";
import type { Request, Response } from "express";
import loginRoute from "./src/routes/loginRoute.ts";
import signUpRoute from "./src/routes/signUpRoute.ts";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "hello cuite" });
});

app.use("/v1", loginRoute);
app.use("/v1", signUpRoute);

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});
