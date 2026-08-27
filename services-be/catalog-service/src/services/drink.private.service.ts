import { Drink, IDrink } from "../models/Drink";
import { Brand } from "../models/Brand";
import {
  Country,
  ServingTemperature,
  FlavorProfile,
  DietaryTag,
} from "../types/enums";

export interface CreateDrinkInput {
  name: string;
  slug: string;
  description?: string;
  brand: string; // Brand ObjectId as string
  isAlcoholic?: boolean;
  abv?: number;
  country?: Country[];
  flavorProfile?: FlavorProfile[];
  dietaryTags?: DietaryTag[];
  servingTemp: ServingTemperature;
  requiresAgeCheck?: boolean;
  isFragile?: boolean;
}

export class BrandNotFoundError extends Error {
  constructor(brandId: string) {
    super(`Brand with id "${brandId}" does not exist`);
    this.name = "BrandNotFoundError";
  }
}

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`A drink with slug "${slug}" already exists`);
    this.name = "DuplicateSlugError";
  }
}

/**
 * Creates a new Drink document.
 * Validates that the referenced Brand actually exists before writing,
 * since Mongoose refs don't enforce referential integrity on their own.
 */
export const createDrink = async (input: CreateDrinkInput): Promise<IDrink> => {
  const brandExists = await Brand.exists({ _id: input.brand });
  if (!brandExists) {
    throw new BrandNotFoundError(input.brand);
  }

  const existingSlug = await Drink.exists({ slug: input.slug.toLowerCase() });
  if (existingSlug) {
    throw new DuplicateSlugError(input.slug);
  }

  const drink = new Drink({
    ...input,
    isAlcoholic: input.isAlcoholic ?? false,
    requiresAgeCheck: input.requiresAgeCheck ?? false,
    isFragile: input.isFragile ?? true,
  });

  return drink.save();
};
