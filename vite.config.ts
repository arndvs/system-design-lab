import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// Served from the root of the custom domain, https://whythis.dev (see public/CNAME).
export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
});
