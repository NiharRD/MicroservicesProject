import loginController from "../controllers/loginController.ts";

import { Router } from "express";

const logInRouter = Router();

logInRouter.post("/login", loginController);

// const signUpRoute = (app: any) => {
//   app.post("/signUp", signUpController);
// };

export default logInRouter;
