import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      hmr: {
        host: "43.205.111.98", // 🔥 YOUR EC2 PUBLIC IP
        port: 5173,
        protocol: "ws",
      },
    },
    define: {
      "process.env": JSON.stringify(env),
    },
  };
});
