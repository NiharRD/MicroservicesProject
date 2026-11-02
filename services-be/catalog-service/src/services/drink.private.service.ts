import { Drink, IDrink } from "../models/Drink";
import { Brand } from "../models/Brand";
import {
  Country,
  ServingTemperature,
  FlavorProfile,
  DietaryTag,
} from "../types/enums";
import { producer } from "../lib/kafka";

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
  price: number;
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

export const drinkAdditionToKafkaTopic = async (
  payload: any,
  mongoId: string,
) => {
  // This is the Kafka topic name for drink addition events

  await producer.send({
    topic: "drink-addition",
    messages: [
      {
        value: JSON.stringify({
          type: "DRINK_ADDED",
          details: payload,
          timestamp: new Date(),
          mongoId: mongoId,
        }),
      },
    ],
  });
};

// This is the Kafka topic name for drink addition events
