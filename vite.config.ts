import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load all env vars from .env.local (both VITE_ prefixed and non-prefixed)
  const env = loadEnv(mode, process.cwd(), '');
  
  // Create a merged env object for process.env (used at build time)
  const processEnv: Record<string, string> = {};
  Object.keys(env).forEach(key => {
    processEnv[key] = env[key];
    // Also expose VITE_ prefixed vars without prefix for backward compatibility
    if (key.startsWith('VITE_')) {
      processEnv[key.replace(/^VITE_/, '')] = env[key];
    }
  });
  
  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify(processEnv)
    }
  };
});