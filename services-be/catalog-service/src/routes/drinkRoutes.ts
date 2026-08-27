import { Router } from "express";
import { getDrinks, getDrink } from "../controllers/drink.public.controller";
import { createDrinkHandler } from "../controllers/drink.private.controller";
// TODO: wire up your actual auth/admin middleware for private routes, e.g.:
// import { authenticate } from "../middlewares/authenticate";
// import { requireAdmin } from "../middlewares/requireAdmin";

const drinkRouter = Router();

/**
 * Public routes — read-only, no auth required
 */
drinkRouter.get("/v1", getDrinks); // GET /drinks?page=&limit=&country=&...
drinkRouter.get("/v1/:id", getDrink); // GET /drinks/:id

/**
 * Private routes — mutation, should be protected
 * Uncomment and apply your auth middleware once available:
 * drinkRouter.post("/", authenticate, requireAdmin, createDrinkHandler);
 */
drinkRouter.post("/v1", createDrinkHandler); // POST /drinks

export default drinkRouter;
