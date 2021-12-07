import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
import eslintPlugin from '@nabla/vite-plugin-eslint';

const PORT = parseInt(process.env.PORT) || 9999;

export default defineConfig({
  base: '/exportify/',

  server: {
    port: PORT,
    // shared with preview
    strictPort: true,
    open: true,
  },

  preview: {
    port: PORT,
  },

  plugins: [
    reactPlugin(),
    tsConfigPathsPlugin(),
    eslintPlugin({
      eslintOptions: { cache: false },
    }),
  ],
});
