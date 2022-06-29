import eslintPlugin from '@nabla/vite-plugin-eslint';
import reactPlugin from '@vitejs/plugin-react';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

// @ts-expect-error
const PORT = parseInt(process.env.PORT) || 9999;

export default defineConfig({
  base: '/exportify/',

  server: {
    port: PORT,
    strictPort: true,
    open: true,
  },

  preview: {
    port: PORT,
  },

  plugins: [reactPlugin(), tsConfigPathsPlugin(), eslintPlugin({ eslintOptions: { cache: false } })],
});
