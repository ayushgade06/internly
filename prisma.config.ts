import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    adapter: "postgresql",
    url: process.env.DATABASE_URL!,
  },
});
