import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// const PROXY_URL = import.meta.env.VITE_PROXY_URL
// https://vitejs.dev/config/


export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()))

  // import.meta.env.YinYang -> process.env.YinYang

  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
        // Change this to your API server URL
          target: process.env.VITE_PROXY_URL, 
        //  target: 'http://localhost:3001', 
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  });
}
