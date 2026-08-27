import { Drink, IDrink } from "../models/Drink";
import {
  Country,
  ServingTemperature,
  FlavorProfile,
  DietaryTag,
} from "../types/enums";

export interface DrinkQueryParams {
  page?: string | number;
  limit?: string | number;
  brand?: string;
  isAlcoholic?: string | boolean;
  country?: Country | Country[];
  flavorProfile?: FlavorProfile | FlavorProfile[];
  dietaryTags?: DietaryTag | DietaryTag[];
  servingTemp?: ServingTemperature;
  search?: string; // matches against name
  sortBy?: string; // e.g. "createdAt", "name"
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Normalizes a query value that may arrive as a single value or CSV string
 * into an array, useful for enum-array filters like country/flavorProfile.
 */
const toArray = <T>(value?: T | T[] | string): T[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",") as unknown as T[];
  return [value];
};

/**
 * Local stand-in for mongoose's FilterQuery<IDrink>, since this project's
 * installed mongoose version doesn't expose that type export. Keeps us
 * loosely typed on the Mongo query shape (operators like $in, $regex)
 * without fighting the mongoose type surface.
 */
type DrinkFilter = {
  [key: string]: unknown;
};

const buildDrinkFilter = (params: DrinkQueryParams): DrinkFilter => {
  const filter: DrinkFilter = {};

  if (params.brand) {
    filter.brand = params.brand;
  }

  if (params.isAlcoholic !== undefined) {
    filter.isAlcoholic =
      params.isAlcoholic === true || params.isAlcoholic === "true";
  }

  const countries = toArray(params.country);
  if (countries?.length) {
    filter.country = { $in: countries };
  }

  const flavors = toArray(params.flavorProfile);
  if (flavors?.length) {
    filter.flavorProfile = { $in: flavors };
  }

  const dietary = toArray(params.dietaryTags);
  if (dietary?.length) {
    filter.dietaryTags = { $in: dietary };
  }

  if (params.servingTemp) {
    filter.servingTemp = params.servingTemp;
  }

  if (params.search) {
    filter.name = { $regex: params.search, $options: "i" };
  }

  return filter;
};

/**
 * Fetches a paginated, filterable list of drinks.
 * Brand is populated with a lean projection since public consumers
 * typically only need brand name/logo for a listing view.
 */
export const getAllDrinks = async (
  params: DrinkQueryParams,
): Promise<PaginatedResult<IDrink>> => {
  const page = Math.max(Number(params.page) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(Number(params.limit) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const skip = (page - 1) * limit;

  const filter = buildDrinkFilter(params);

  const sortField = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder === "asc" ? 1 : -1;

  const [data, total] = await Promise.all([
    Drink.find(filter)
      .populate("brand", "name slug logoUrl")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Drink.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    data: data as unknown as IDrink[],
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Fetches a single drink by its Mongo _id.
 * Returns null if not found so the controller can decide the response shape.
 */
export const getDrinkById = async (id: string): Promise<IDrink | null> => {
  return Drink.findById(id)
    .populate("brand", "name slug logoUrl website")
    .lean();
};
