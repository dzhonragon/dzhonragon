import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://dzhonragon.com",
  output: "static",
  integrations: [tailwind()],
});
