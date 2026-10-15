import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const BASE_URL_CATALOG_SERVICE =
  process.env.BASE_URL_CATALOG_SERVICE || "http://localhost:3000";

export async function getDrinkDetails(drinkId: string) {
  try {
    const response = await fetch(
      `${BASE_URL_CATALOG_SERVICE}/${drinkId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch drink details");
    }
    return await response.json(); // this is important as to get price etc details form the backend only not the frontend
  } catch (error) {
    console.error("Error fetching drink details:", error);
    throw new Error("Failed to fetch drink details");
  }
}
