import loginController from "../controllers/loginController.ts";

const loginRoute = (app: any) => {
  app.post("/login", loginController);
};

export default loginRoute;
