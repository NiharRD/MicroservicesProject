import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { getAllDrinks, getDrinkById } from "../services/drink.public.service";

/**
 * GET /drinks
 * Query params: page, limit, brand, isAlcoholic, country, flavorProfile,
 * dietaryTags, servingTemp, search, sortBy, sortOrder
 */
export const getDrinks = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await getAllDrinks(req.query);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /drinks/:id
 */
export const getDrink = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid drink id",
      });
      return;
    }

    const drink = await getDrinkById(id);

    if (!drink) {
      res.status(404).json({
        success: false,
        message: "Drink not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: drink,
    });
  } catch (error) {
    next(error);
  }
};
