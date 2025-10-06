import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6000, // Web版本使用不同端口
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Web代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Web发送请求到后端:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Web收到后端响应:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
