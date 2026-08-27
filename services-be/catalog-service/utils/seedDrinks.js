import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { Brand } from "../src/models/Brand.ts";
import { Drink } from "../src/models/Drink.ts";
import {
  Country,
  ServingTemperature,
  FlavorProfile,
  DietaryTag,
} from "../src/types/enums.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in the environment variables");
    }
    await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

const brandsData = [
  { name: "Thums Up", slug: "thums-up", description: "Taste the thunder! Strong cola." },
  { name: "Frooti", slug: "frooti", description: "Fresh and juicy mango drink." },
  { name: "Old Monk", slug: "old-monk", description: "Legendary Indian dark rum." },
  { name: "Amul", slug: "amul", description: "The taste of India. Dairy based drinks." },
  { name: "Rooh Afza", slug: "rooh-afza", description: "Summer drink of the east. Rose syrup." },
  { name: "Kingfisher", slug: "kingfisher", description: "The king of good times. Premium beer." },
  { name: "Paper Boat", slug: "paper-boat", description: "Drinks and memories. Traditional Indian drinks." },
  { name: "Bira 91", slug: "bira-91", description: "Imagined in India, for the world. Craft beer." },
  { name: "Coca-Cola", slug: "coca-cola", description: "Real magic. Classic cola." },
  { name: "Pepsi", slug: "pepsi", description: "That's what I like." },
  { name: "Red Bull", slug: "red-bull", description: "Gives you wings. Energy drink." },
  { name: "Heineken", slug: "heineken", description: "Open your world. Premium lager." },
  { name: "Monster", slug: "monster", description: "Unleash the beast. Energy." },
  { name: "Johnnie Walker", slug: "johnnie-walker", description: "Keep walking. Blended Scotch Whisky." },
  { name: "Schweppes", slug: "schweppes", description: "Effervescence since 1783." },
  { name: "Jack Daniel's", slug: "jack-daniels", description: "Tennessee Whiskey." },
];

const drinksData = [
  // Thums Up
  {
    brandName: "Thums Up",
    name: "Thums Up Classic",
    description: "Strong, spicy, and fizzy cola that packs a punch.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.SPICY, FlavorProfile.ROASTED],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  {
    brandName: "Thums Up",
    name: "Thums Up Charged",
    description: "Extra caffeine and extra strong taste.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.SPICY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  
  // Frooti
  {
    brandName: "Frooti",
    name: "Frooti Mango",
    description: "The classic, luscious mango drink for everyone.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.FRUITY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE, DietaryTag.GLUTEN_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Old Monk
  {
    brandName: "Old Monk",
    name: "Old Monk Supreme Rum",
    description: "Vatted Indian dark rum with a distinct vanilla and caramel flavor.",
    isAlcoholic: true,
    abv: 42.8,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CARAMEL, FlavorProfile.VANILLA, FlavorProfile.WOODY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.ROOM_TEMP,
    requiresAgeCheck: true,
    isFragile: true,
  },
  {
    brandName: "Old Monk",
    name: "Old Monk Gold Reserve",
    description: "Smoother blend of the classic dark rum, aged longer in oak casks.",
    isAlcoholic: true,
    abv: 42.8,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CARAMEL, FlavorProfile.SPICY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.ROOM_TEMP,
    requiresAgeCheck: true,
    isFragile: true,
  },

  // Amul
  {
    brandName: "Amul",
    name: "Amul Kool Kesar",
    description: "Refreshing saffron flavored milk.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.FLORAL, FlavorProfile.NUTTY],
    dietaryTags: [DietaryTag.VEGETARIAN, DietaryTag.GLUTEN_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: true,
  },
  {
    brandName: "Amul",
    name: "Amul Lassi",
    description: "Traditional sweet yogurt-based drink.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.SOUR],
    dietaryTags: [DietaryTag.VEGETARIAN, DietaryTag.GLUTEN_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Rooh Afza
  {
    brandName: "Rooh Afza",
    name: "Rooh Afza Sharbat",
    description: "Cooling herbal and rose syrup drink.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.FLORAL, FlavorProfile.HERBAL],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE, DietaryTag.GLUTEN_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: true,
  },

  // Kingfisher
  {
    brandName: "Kingfisher",
    name: "Kingfisher Premium",
    description: "Light, crisp, and refreshing Indian lager beer.",
    isAlcoholic: true,
    abv: 4.8,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.CRISP, FlavorProfile.BITTER],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: true,
    isFragile: true,
  },
  {
    brandName: "Kingfisher",
    name: "Kingfisher Strong",
    description: "High gravity strong beer with a full-bodied taste.",
    isAlcoholic: true,
    abv: 8.0,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.BITTER, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: true,
    isFragile: true,
  },

  // Paper Boat
  {
    brandName: "Paper Boat",
    name: "Paper Boat Aam Panna",
    description: "Tangy and sweet raw mango drink with roasted cumin.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SOUR, FlavorProfile.SWEET, FlavorProfile.FRUITY, FlavorProfile.SPICY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  {
    brandName: "Paper Boat",
    name: "Paper Boat Jaljeera",
    description: "Zesty, spicy, and tangy cumin-based digestive drink.",
    isAlcoholic: false,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.SPICY, FlavorProfile.SOUR, FlavorProfile.HERBAL],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Bira 91
  {
    brandName: "Bira 91",
    name: "Bira 91 White",
    description: "Deliciously different wheat beer with a hint of citrus and coriander.",
    isAlcoholic: true,
    abv: 4.7,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.CRISP, FlavorProfile.CITRUS, FlavorProfile.BITTER, FlavorProfile.SPICY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: true,
    isFragile: true,
  },
  {
    brandName: "Bira 91",
    name: "Bira 91 Blonde",
    description: "Extra hoppy craft lager, floral and crisp.",
    isAlcoholic: true,
    abv: 4.5,
    country: [Country.INDIA],
    flavorProfile: [FlavorProfile.CRISP, FlavorProfile.BITTER, FlavorProfile.FLORAL],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: true,
    isFragile: true,
  },

  // Coca-Cola
  {
    brandName: "Coca-Cola",
    name: "Coca-Cola Classic",
    description: "The original cola taste that refreshes the world.",
    isAlcoholic: false,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CARAMEL, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.DAIRY_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  {
    brandName: "Coca-Cola",
    name: "Coca-Cola Zero Sugar",
    description: "Real Coca-Cola taste with zero sugar and zero calories.",
    isAlcoholic: false,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CARAMEL, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.SUGAR_FREE, DietaryTag.LOW_CALORIE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Pepsi
  {
    brandName: "Pepsi",
    name: "Pepsi Regular",
    description: "Bold, refreshing, robust cola.",
    isAlcoholic: false,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CITRUS, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  {
    brandName: "Pepsi",
    name: "Pepsi Black",
    description: "Maximum taste, zero sugar cola.",
    isAlcoholic: false,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CITRUS, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.SUGAR_FREE, DietaryTag.LOW_CALORIE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Red Bull
  {
    brandName: "Red Bull",
    name: "Red Bull Energy Drink",
    description: "Vitalizes body and mind with taurine and caffeine.",
    isAlcoholic: false,
    country: [Country.GERMANY, Country.USA], // Originated in Austria, closest enum match
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.TART, FlavorProfile.FRUITY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  {
    brandName: "Red Bull",
    name: "Red Bull Sugarfree",
    description: "Wings without sugar.",
    isAlcoholic: false,
    country: [Country.GERMANY, Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.TART],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.SUGAR_FREE, DietaryTag.LOW_CALORIE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Heineken
  {
    brandName: "Heineken",
    name: "Heineken Lager",
    description: "Pure malt lager beer with a perfectly balanced taste.",
    isAlcoholic: true,
    abv: 5.0,
    country: [Country.GERMANY], // Originated in Netherlands, using Germany as European rep
    flavorProfile: [FlavorProfile.CRISP, FlavorProfile.BITTER],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: true,
    isFragile: true,
  },

  // Monster
  {
    brandName: "Monster",
    name: "Monster Energy",
    description: "Tear into a can of the meanest energy drink on the planet.",
    isAlcoholic: false,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CITRUS],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },
  {
    brandName: "Monster",
    name: "Monster Ultra",
    description: "Lighter-tasting, zero sugar energy drink.",
    isAlcoholic: false,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.CITRUS, FlavorProfile.SWEET, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.SUGAR_FREE, DietaryTag.LOW_CALORIE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: false,
  },

  // Johnnie Walker
  {
    brandName: "Johnnie Walker",
    name: "Johnnie Walker Black Label",
    description: "A true icon of blended Scotch whisky, aged 12 years.",
    isAlcoholic: true,
    abv: 40.0,
    country: [Country.UK],
    flavorProfile: [FlavorProfile.SMOKY, FlavorProfile.WOODY, FlavorProfile.CARAMEL, FlavorProfile.VANILLA],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.ROOM_TEMP,
    requiresAgeCheck: true,
    isFragile: true,
  },
  {
    brandName: "Johnnie Walker",
    name: "Johnnie Walker Red Label",
    description: "Pioneer blend with a bold, characterful flavor.",
    isAlcoholic: true,
    abv: 40.0,
    country: [Country.UK],
    flavorProfile: [FlavorProfile.SPICY, FlavorProfile.SMOKY, FlavorProfile.SWEET],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.ROOM_TEMP,
    requiresAgeCheck: true,
    isFragile: true,
  },

  // Schweppes
  {
    brandName: "Schweppes",
    name: "Schweppes Tonic Water",
    description: "Classic sparkling tonic water with quinine.",
    isAlcoholic: false,
    country: [Country.UK],
    flavorProfile: [FlavorProfile.BITTER, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.GLUTEN_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: true,
  },
  {
    brandName: "Schweppes",
    name: "Schweppes Ginger Ale",
    description: "Crisp and refreshing ginger ale.",
    isAlcoholic: false,
    country: [Country.UK],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.SPICY, FlavorProfile.CRISP],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN, DietaryTag.GLUTEN_FREE],
    servingTemp: ServingTemperature.CHILLED,
    requiresAgeCheck: false,
    isFragile: true,
  },

  // Jack Daniel's
  {
    brandName: "Jack Daniel's",
    name: "Jack Daniel's Old No. 7",
    description: "Mellowed drop by drop through 10-feet of sugar maple charcoal.",
    isAlcoholic: true,
    abv: 40.0,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.CARAMEL, FlavorProfile.VANILLA, FlavorProfile.WOODY],
    dietaryTags: [DietaryTag.VEGAN, DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.ROOM_TEMP,
    requiresAgeCheck: true,
    isFragile: true,
  },
  {
    brandName: "Jack Daniel's",
    name: "Jack Daniel's Tennessee Honey",
    description: "A blend of Jack Daniel’s Tennessee Whiskey and a unique honey liqueur.",
    isAlcoholic: true,
    abv: 35.0,
    country: [Country.USA],
    flavorProfile: [FlavorProfile.SWEET, FlavorProfile.CARAMEL, FlavorProfile.VANILLA, FlavorProfile.NUTTY],
    dietaryTags: [DietaryTag.VEGETARIAN],
    servingTemp: ServingTemperature.ROOM_TEMP,
    requiresAgeCheck: true,
    isFragile: true,
  },
];

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log("🧹 Clearing existing data...");
    await Drink.deleteMany({});
    await Brand.deleteMany({});

    console.log("🏭 Inserting Brands...");
    const createdBrands = await Brand.insertMany(brandsData);
    
    // Create a brand lookup map for quick access
    const brandMap = {};
    createdBrands.forEach(brand => {
      brandMap[brand.name] = brand._id;
    });

    console.log(`✅ Inserted ${createdBrands.length} brands.`);

    console.log("🍹 Inserting Detailed Drinks...");
    const drinksToInsert = drinksData.map(drinkInfo => {
      const { brandName, ...rest } = drinkInfo;
      // Add the generated slug based on the actual drink name
      const slug = rest.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
      return {
        ...rest,
        slug,
        brand: brandMap[brandName]
      };
    });

    const createdDrinks = await Drink.insertMany(drinksToInsert);
    console.log(`✅ Inserted ${createdDrinks.length} highly accurate drinks.`);

    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();
