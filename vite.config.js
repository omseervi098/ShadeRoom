import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [], // Removes console logs in production
  },
  assetsInclude: ["**/*.onnx", "**/*.wasm"],
  optimizeDeps: {
    exclude: ["onnxruntime-web"],
  }
}));
