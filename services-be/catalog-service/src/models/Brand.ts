import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  // Timestamps are auto-injected by Mongoose
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
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
    logoUrl: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Crucial for virtual population
    toObject: { virtuals: true },
  },
);

// Virtual population: Find Drinks where local `_id` matches Drink's `brand`
BrandSchema.virtual("drinks", {
  ref: "Drink",
  localField: "_id",
  foreignField: "brand",
});

export const Brand = mongoose.model<IBrand>("Brand", BrandSchema);
