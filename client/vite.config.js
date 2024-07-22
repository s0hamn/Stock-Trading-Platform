import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'


export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd());
  console.log('Loaded environment variables:', env);

  // Assign environment variables to process.env
  Object.assign(process.env, env);

  // import.meta.env.YinYang -> process.env.YinYang

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  });
}
