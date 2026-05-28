import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/create-a-full-stack-expense-tracker-where-i-can-add-view-and-delete-my-daily-expenses-use-react-for/",
  build: { outDir: "dist", assetsDir: "assets" },
  server: { port: 3000 },
});
