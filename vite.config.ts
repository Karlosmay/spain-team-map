import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/spain-team-map/" // ✅ use YOUR repo name here
});
