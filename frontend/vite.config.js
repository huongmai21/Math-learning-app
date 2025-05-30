import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Đảm bảo Vite xử lý cả .js và .jsx
  },
});