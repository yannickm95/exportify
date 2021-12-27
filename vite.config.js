const eslintPlugin = require('@nabla/vite-plugin-eslint');
const reactPlugin = require('@vitejs/plugin-react');
const { default: tsConfigPathsPlugin } = require('vite-tsconfig-paths');
const { defineConfig } = require('vite');

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
