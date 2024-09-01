import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd());
  console.log('Loaded environment variables:', env);

  // Assign environment variables to process.env
  Object.assign(process.env, env);

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          // Change this to your API server URL
          // target: process.env.VITE_PROXY_URL,
          target: 'http://localhost:3001',
          // target: 'https://stock-trading-platform-o3zp.onrender.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  });
}
