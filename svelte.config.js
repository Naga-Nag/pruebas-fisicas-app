// svelte.config.js
import adapterGhpages from "svelte-adapter-ghpages";

/** @type {import('@sveltejs/kit').Config} */
const config = {

  kit: {
    paths: {
      base: "/pruebas-fisicas-app",
    },
    adapter: adapterGhpages(),
    output: {
      bundleStrategy: 'inline'
    }
  },
};

export default config;