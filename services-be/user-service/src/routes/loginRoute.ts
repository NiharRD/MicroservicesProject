import loginController from "../controllers/loginController.js";

const loginRoute = (app: any) => {
  app.post("/login", loginController);
};

export default loginRoute;
