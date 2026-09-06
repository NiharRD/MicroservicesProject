import { Router } from "express";
import { checkOutController } from "../controllers/checkoutController.ts";
import { webHookController } from "../controllers/webHookController.ts";
const paymentRouter = Router();

paymentRouter.post("/checkout", checkOutController); // should be Authenticated endpoint , a user should
// be logged in , and it should be make sure that  only the user can only and only order on his behalf .

paymentRouter.post("/webhook", webHookController); // should be public endpoint

export default paymentRouter;
