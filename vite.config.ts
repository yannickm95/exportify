import { defineConfig } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
import eslintPlugin from '@nabla/vite-plugin-eslint';

const PORT = parseInt(process.env.PORT) || 3000;

export default defineConfig({
  base: '/exportify/',

  server: {
    open: false,
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
