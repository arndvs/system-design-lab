import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// `base` matches the GitHub Pages path: https://<user>.github.io/system-design-lab/
export default defineConfig({
  base: "/system-design-lab/",
  plugins: [tailwindcss()],
});
