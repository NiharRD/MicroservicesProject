import { Router } from "express";
import { authenticateJWT } from "../middlewares/authMiddleware.ts";
import addressController from "../controllers/addressController.ts";
const addressRouter = Router();

addressRouter.post("/address", authenticateJWT, addressController);

export default addressRouter;
