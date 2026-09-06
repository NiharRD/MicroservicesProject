import { Router } from "express";
import { checkOutController } from "../controllers/checkOutController.ts";
import { webHookController } from "../controllers/webHookController.ts";
const paymentRouter = Router();

paymentRouter.post("/checkout", checkOutController);

paymentRouter.post("/webhook", webHookController);

export default paymentRouter;
