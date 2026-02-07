import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const processEnv: Record<string, string> = {};
  Object.keys(env).forEach((key) => {
    processEnv[key] = env[key];
    if (key.startsWith("VITE_")) {
      processEnv[key.replace(/^VITE_/, "")] = env[key];
    }
  });

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",  
      port: 5173,
    },
    define: {
      "process.env": JSON.stringify(processEnv),
    },
  };
});
