import { Request, Response, NextFunction } from "express";
import {
  createDrink,
  BrandNotFoundError,
  DuplicateSlugError,
  CreateDrinkInput,
  drinkAdditionToKafkaTopic,
} from "../services/drink.private.service";

/**
 * POST /drinks
 * Body: CreateDrinkInput
 */
export const createDrinkHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.body as CreateDrinkInput;

    if (
      !payload.name ||
      !payload.slug ||
      !payload.brand ||
      !payload.servingTemp ||
      payload.price === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "name, slug, brand, servingTemp and price are required",
      });
      return;
    }

    const drink = await createDrink(payload);

    try {
      await drinkAdditionToKafkaTopic(payload, drink._id.toString());
    } catch (kafkaError) {
      console.error("Failed to publish DRINK_ADDED event", kafkaError);
      // Optionally: persist to a retry/outbox collection
    }

    res.status(201).json({
      success: true,
      data: drink,
    });
  } catch (error) {
    if (error instanceof BrandNotFoundError) {
      res.status(404).json({ success: false, message: error.message });
      return;
    }

    if (error instanceof DuplicateSlugError) {
      res.status(409).json({ success: false, message: error.message });
      return;
    }

    next(error);
  }
};
