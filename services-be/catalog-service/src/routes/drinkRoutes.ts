import { Router } from "express";
import { getDrinks, getDrink } from "../controllers/drink.public.controller";
import { createDrinkHandler } from "../controllers/drink.private.controller";
// TODO: wire up your actual auth/admin middleware for private routes, e.g.:
// import { authenticate } from "../middlewares/authenticate";
// import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

/**
 * Public routes — read-only, no auth required
 */
router.get("/", getDrinks); // GET /drinks?page=&limit=&country=&...
router.get("/:id", getDrink); // GET /drinks/:id

/**
 * Private routes — mutation, should be protected
 * Uncomment and apply your auth middleware once available:
 * router.post("/", authenticate, requireAdmin, createDrinkHandler);
 */
router.post("/", createDrinkHandler); // POST /drinks

export default router;
