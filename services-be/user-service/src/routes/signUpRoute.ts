import signUpController from "../controllers/signUpController.js";

const signUpRoute = (app: any) => {
  app.post("/signUp", signUpController);
};

export default signUpRoute;
