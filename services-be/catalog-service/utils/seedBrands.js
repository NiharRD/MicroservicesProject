import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
// Define the Brand Schema matching your Mongoose definition
const BrandSchema = new mongoose.Schema(
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
  },
);

const Brand = mongoose.models.Brand || mongoose.model("Brand", BrandSchema);

const indianDrinkBrands = [
  // --- Non-Alcoholic Brands ---
  {
    name: "Thums Up",
    slug: "thums-up",
    description:
      "Iconic Indian carbonated cola brand known for its strong, fizzy taste and 'Taste the Thunder' tagline.",
    logoUrl: "https://example.com/logos/thums-up.png",
    website: "https://www.coca-colacompany.com/in",
  },
  {
    name: "Paper Boat",
    slug: "paper-boat",
    description:
      "Indian brand by Hector Beverages specializing in traditional ethnic drinks like Aam Panna, Jaljeera, and Kokum.",
    logoUrl: "https://example.com/logos/paper-boat.png",
    website: "https://www.paperboatdrinks.com",
  },
  {
    name: "Frooti",
    slug: "frooti",
    description:
      "One of India's oldest and most popular mango-flavored beverage brands, manufactured by Parle Agro.",
    logoUrl: "https://example.com/logos/frooti.png",
    website: "https://www.parleagro.com",
  },
  {
    name: "Rooh Afza",
    slug: "rooh-afza",
    description:
      "Classic herbal rose-flavored concentrate formulated by Hamdard Laboratories, widely enjoyed with milk or water.",
    logoUrl: "https://example.com/logos/rooh-afza.png",
    website: "https://www.hamdard.com",
  },
  {
    name: "Limca",
    slug: "limca",
    description:
      "Popular Indian lemon and lime-flavored carbonated soft drink known for its crisp, refreshing taste.",
    logoUrl: "https://example.com/logos/limca.png",
    website: "https://www.coca-colacompany.com/in",
  },
  {
    name: "Bisleri",
    slug: "bisleri",
    description:
      "Household Indian brand renowned for packaged drinking water, club sodas, and carbonated beverages.",
    logoUrl: "https://example.com/logos/bisleri.png",
    website: "https://www.bisleri.com",
  },
  {
    name: "Lahori Zeera",
    slug: "lahori-zeera",
    description:
      "Fast-growing Indian beverage brand known for its traditional spiced cumin (zeera) flavored soda.",
    logoUrl: "https://example.com/logos/lahori-zeera.png",
    website: "https://www.lahorizeera.com",
  },

  // --- Alcoholic Brands ---
  {
    name: "Kingfisher",
    slug: "kingfisher",
    description:
      "India's flagship beer brand manufactured by United Breweries Group, famous for its Kingfisher Premium and Strong lagers.",
    logoUrl: "https://example.com/logos/kingfisher.png",
    website: "https://www.kingfisherworld.com",
  },
  {
    name: "Bira 91",
    slug: "bira-91",
    description:
      "Modern Indian craft beer brand by B9 Beverages, known for its flavorful wheat ales, blondes, and IPAs.",
    logoUrl: "https://example.com/logos/bira91.png",
    website: "https://www.bira91.com",
  },
  {
    name: "Old Monk",
    slug: "old-monk",
    description:
      "Legendary vatted Indian dark rum produced by Mohan Meakin, celebrated for its distinct vanilla-forward flavor.",
    logoUrl: "https://example.com/logos/old-monk.png",
    website: "https://www.mohanmeakin.com",
  },
  {
    name: "Amrut",
    slug: "amrut",
    description:
      "Pioneering Indian single malt whisky distillery based in Bengaluru, globally acclaimed for luxury single malts.",
    logoUrl: "https://example.com/logos/amrut.png",
    website: "https://www.amrutdistilleries.com",
  },
  {
    name: "Paul John",
    slug: "paul-john",
    description:
      "Goa-based premium single malt whisky distillery recognized internationally for its unpeated and peated single malts.",
    logoUrl: "https://example.com/logos/paul-john.png",
    website: "https://www.pauljohnwhisky.com",
  },
  {
    name: "Magic Moments",
    slug: "magic-moments",
    description:
      "Leading Indian grain vodka brand by Radico Khaitan, offered in original and flavored variants.",
    logoUrl: "https://example.com/logos/magic-moments.png",
    website: "https://www.radicokhaitan.com",
  },
  {
    name: "Sula Vineyards",
    slug: "sula-vineyards",
    description:
      "India's premier winery based in Nashik, producing a wide portfolio of red, white, and sparkling wines.",
    logoUrl: "https://example.com/logos/sula.png",
    website: "https://www.sulavineyards.com",
  },
];

async function seedBrands() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    // Clear existing brands (optional: change to upsert if appending)
    console.log("Clearing existing brands...");
    await Brand.deleteMany({});

    console.log("Seeding Indian beverage brands...");
    const inserted = await Brand.insertMany(indianDrinkBrands);

    console.log(`Successfully seeded ${inserted.length} brands!`);
  } catch (error) {
    console.error("Error seeding brands:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seedBrands();
