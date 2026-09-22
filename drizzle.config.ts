import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { parse } from "pg-connection-string";

const config = parse(process.env.DATABASE_URL!);

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    host: config.host!,
    port: config.port ? parseInt(config.port) : 5432,
    user: config.user!,
    password: config.password!,
    database: config.database!,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
