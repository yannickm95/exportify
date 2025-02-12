import eslintPlugin from '@nabla/vite-plugin-eslint';
import reactPlugin from '@vitejs/plugin-react-swc';
import tsConfigPathsPlugin from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

// @ts-expect-error
const PORT = parseInt(process.env.PORT) || 9999;

export default defineConfig(({ mode }) => ({
  base: '/exportify/',

  server: {
    port: PORT,
    strictPort: true,
    open: false,
  },

  preview: {
    port: PORT,
  },

  plugins: [
    reactPlugin(),
    tsConfigPathsPlugin(),
    mode === 'development' && eslintPlugin({ eslintOptions: { cache: false } }),
  ],
}));
