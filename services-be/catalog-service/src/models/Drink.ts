import mongoose, { Schema, Document, Types } from "mongoose";
import {
  Country,
  ServingTemperature,
  FlavorProfile,
  DietaryTag,
} from "../types/enums";

export interface IDrink extends Document {
  name: string;
  slug: string;
  description?: string;
  brand: Types.ObjectId; // Reference to Brand
  isAlcoholic: boolean;
  abv?: number;
  country: Country[];
  flavorProfile: FlavorProfile[];
  dietaryTags: DietaryTag[];
  servingTemp: ServingTemperature;
  requiresAgeCheck: boolean;
  isFragile: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DrinkSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },

    // Relation to Brand
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true, // Indexing this field makes querying drinks by brand much faster
    },

    isAlcoholic: { type: Boolean, default: false },
    abv: {
      type: Number,
      min: [0, "ABV cannot be negative"],
      max: [100, "ABV cannot exceed 100"],
    },

    country: [
      {
        type: String,
        enum: Object.values(Country),
      },
    ],

    flavorProfile: [
      {
        type: String,
        enum: Object.values(FlavorProfile),
      },
    ],

    dietaryTags: [
      {
        type: String,
        enum: Object.values(DietaryTag),
      },
    ],

    servingTemp: {
      type: String,
      enum: Object.values(ServingTemperature),
      required: true,
    },

    requiresAgeCheck: { type: Boolean, default: false },
    isFragile: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// Compound index example: Useful if you often search for active/available drinks in a specific country
DrinkSchema.index({ country: 1, isAlcoholic: 1 });

export const Drink = mongoose.model<IDrink>("Drink", DrinkSchema);
