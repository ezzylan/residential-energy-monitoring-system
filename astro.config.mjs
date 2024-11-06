import alpinejs from "@astrojs/alpinejs";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import supabase from "astro-supabase";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const { SUPABASE_URL, SUPABASE_KEY } = loadEnv("", process.cwd(), "SUPABASE");

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    alpinejs(),
    supabase({
      supabaseKey: SUPABASE_KEY,
      supabaseUrl: SUPABASE_URL,
    }),
  ],
  output: "server",
  adapter: vercel(),
});
