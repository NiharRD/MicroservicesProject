import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url"; // Import this
import { defineConfig, env } from "prisma/config"; // Make sure this is still here!

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now your path.resolve will work perfectly
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL_USER_SERVICE"),
  },
});
