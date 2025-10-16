import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';
// import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
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
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                {
                    name: 'load-js-files-as-jsx',
                    setup(build) {
                        build.onLoad(
                            { filter: /src\\.*\.js$/ },
                            async (args) => ({
                                loader: 'jsx',
                                contents: await fs.readFile(args.path, 'utf8'),
                            })
                        );
                    },
                },
            ],
        },
    },

    
    // plugins: [react(),svgr({
    //   exportAsDefault: true
    // })],

    plugins: [react(), svgr()],
    base: '/',
    build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 2400,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    mui: ['@mui/material', '@mui/icons-material'],
                    utils: ['lodash', 'axios']
                }
            }
        }
    }
});
