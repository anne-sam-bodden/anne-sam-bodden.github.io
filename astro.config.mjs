import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://anne-sam-bodden.github.io",
  output: "static",
  trailingSlash: "always",
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
