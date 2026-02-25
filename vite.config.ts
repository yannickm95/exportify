import reactPlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import oxlintPlugin from "vite-plugin-oxlint";
import tsConfigPathsPlugin from "vite-tsconfig-paths";

// @ts-expect-error
const PORT = parseInt(process.env.PORT) || 9999;

export default defineConfig(({ mode }) => ({
  base: "/exportify/",

  server: {
    port: PORT,
    strictPort: true,
    open: false,
  },

  preview: {
    port: PORT,
  },

  plugins: [reactPlugin(), tsConfigPathsPlugin(), mode === "development" && oxlintPlugin()],
}));
