import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig(async () => ({
  plugins: [sveltekit()],
  build: {
		// inline all imported assets
		assetsInlineLimit: Infinity
	},
}));
