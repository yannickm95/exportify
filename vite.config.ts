import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// @ts-expect-error
const PORT = parseInt(process.env.PORT) || 9999;

export default defineConfig({
  base: "/exportify/",

  resolve: {
    tsconfigPaths: true,
  },

  server: {
    port: PORT,
    strictPort: true,
    open: false,
  },

  preview: {
    port: PORT,
  },

  plugins: [reactPlugin()],
});
