import signUpController from "../controllers/signUpController.ts";

const signUpRoute = (app: any) => {
  app.post("/signUp", signUpController);
};

export default signUpRoute;
