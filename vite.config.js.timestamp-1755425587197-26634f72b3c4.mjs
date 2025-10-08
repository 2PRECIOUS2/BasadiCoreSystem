// vite.config.js
import { defineConfig } from "file:///C:/Users/user/BasadiCoreProject/BasadiCoreProject/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/user/BasadiCoreProject/BasadiCoreProject/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import fs from "fs/promises";
import svgr from "file:///C:/Users/user/BasadiCoreProject/BasadiCoreProject/node_modules/@svgr/rollup/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\user\\BasadiCoreProject\\BasadiCoreProject";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      src: resolve(__vite_injected_original_dirname, "src"),
      assetsInclude: ["**/*.PNG"]
    }
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        {
          name: "load-js-files-as-jsx",
          setup(build) {
            build.onLoad(
              { filter: /src\\.*\.js$/ },
              async (args) => ({
                loader: "jsx",
                contents: await fs.readFile(args.path, "utf8")
              })
            );
          }
        }
      ]
    }
  },
  // plugins: [react(),svgr({
  //   exportAsDefault: true
  // })],
  plugins: [svgr(), react()],
  base: "/Basadi-Core/"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXEJhc2FkaUNvcmVQcm9qZWN0XFxcXEJhc2FkaUNvcmVQcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx1c2VyXFxcXEJhc2FkaUNvcmVQcm9qZWN0XFxcXEJhc2FkaUNvcmVQcm9qZWN0XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy91c2VyL0Jhc2FkaUNvcmVQcm9qZWN0L0Jhc2FkaUNvcmVQcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzL3Byb21pc2VzJztcclxuaW1wb3J0IHN2Z3IgZnJvbSAnQHN2Z3Ivcm9sbHVwJztcclxuLy8gaW1wb3J0IHN2Z3IgZnJvbSAndml0ZS1wbHVnaW4tc3ZncidcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgc3JjOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgICAgICAgICBhc3NldHNJbmNsdWRlOiBbJyoqLyouUE5HJ10sXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICBlc2J1aWxkOiB7XHJcbiAgICAgICAgbG9hZGVyOiAnanN4JyxcclxuICAgICAgICBpbmNsdWRlOiAvc3JjXFwvLipcXC5qc3g/JC8sXHJcbiAgICAgICAgZXhjbHVkZTogW10sXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgICAgICAgcGx1Z2luczogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdsb2FkLWpzLWZpbGVzLWFzLWpzeCcsXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dXAoYnVpbGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnVpbGQub25Mb2FkKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBmaWx0ZXI6IC9zcmNcXFxcLipcXC5qcyQvIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYyAoYXJncykgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2FkZXI6ICdqc3gnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzOiBhd2FpdCBmcy5yZWFkRmlsZShhcmdzLnBhdGgsICd1dGY4JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG5cclxuICAgIFxyXG4gICAgLy8gcGx1Z2luczogW3JlYWN0KCksc3Zncih7XHJcbiAgICAvLyAgIGV4cG9ydEFzRGVmYXVsdDogdHJ1ZVxyXG4gICAgLy8gfSldLFxyXG5cclxuICAgIHBsdWdpbnM6IFtzdmdyKCksIHJlYWN0KCldLFxyXG4gICAgYmFzZTogJy9CYXNhZGktQ29yZS8nXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStVLFNBQVMsb0JBQW9CO0FBQzVXLE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBSmpCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDN0IsZUFBZSxDQUFDLFVBQVU7QUFBQSxJQUM5QjtBQUFBLEVBQ0o7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFNBQVM7QUFBQSxJQUNULFNBQVMsQ0FBQztBQUFBLEVBQ2Q7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWLGdCQUFnQjtBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ0w7QUFBQSxVQUNJLE1BQU07QUFBQSxVQUNOLE1BQU0sT0FBTztBQUNULGtCQUFNO0FBQUEsY0FDRixFQUFFLFFBQVEsZUFBZTtBQUFBLGNBQ3pCLE9BQU8sVUFBVTtBQUFBLGdCQUNiLFFBQVE7QUFBQSxnQkFDUixVQUFVLE1BQU0sR0FBRyxTQUFTLEtBQUssTUFBTSxNQUFNO0FBQUEsY0FDakQ7QUFBQSxZQUNKO0FBQUEsVUFDSjtBQUFBLFFBQ0o7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLEVBQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQU9BLFNBQVMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDO0FBQUEsRUFDekIsTUFBTTtBQUNWLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
