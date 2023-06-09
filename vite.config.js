import { resolve } from "path";
import { defineConfig } from "vite";
import dsv from '@rollup/plugin-dsv';

export default defineConfig({
  envDir: resolve(__dirname),
  publicDir: resolve(__dirname, "public"),
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        "blr-flyovers": resolve(__dirname, "src/blr-flyovers/index.html"),
        "bmtc-trips-heatmap": resolve(__dirname, "src/bmtc-trips-heatmap/index.html"),
        "blr-metro-feeder": resolve(__dirname, "src/blr-metro-feeder/index.html"),
      },
    },
    outDir: resolve(__dirname, "dist"),
  },
  plugins: [
    dsv()
  ],
});
