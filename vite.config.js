// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

export default defineConfig(({ mode }) => {
  // Load API URL from env
  const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';

  return {
    resolve: {
      alias: {
        src: resolve(__dirname, 'src'),
      },
    },
    assetsInclude: ['**/*.PNG'],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    server: {
      proxy: mode === 'development' ? { '/api': 'http://localhost:5000' } : undefined,
    },
    optimizeDeps: {
      esbuildOptions: {
        plugins: [
          {
            name: 'load-js-files-as-jsx',
            setup(build) {
              build.onLoad({ filter: /src\\.*\.js$/ }, async (args) => ({
                loader: 'jsx',
                contents: await fs.readFile(args.path, 'utf8'),
              }));
            },
          },
        ],
      },
    },
    plugins: [svgr(), react()],
    base: './',
    define: {
      'process.env.VITE_API_URL': JSON.stringify(API_URL), // make available in frontend code
    },
    build: {
      outDir: 'build',
      sourcemap: false,
      chunkSizeWarningLimit: 2400,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['lodash', 'axios'],
          },
        },
      },
    },
  };
});
