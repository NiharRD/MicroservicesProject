import signUpController from "../controllers/signUpController.ts";
import { Router } from "express";

const signUpRouter = Router();

signUpRouter.post("/signUp", signUpController);

// const signUpRoute = (app: any) => {
//   app.post("/signUp", signUpController);
// };

export default signUpRouter;
