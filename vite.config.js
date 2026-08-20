/**
 * Vite 构建配置
 * @module vite.config
 * @description Vue3 + vite-plugin-mock + ECharts 分包 + GitHub Pages 部署 base 路径
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    // 本地 Mock：开发服务期拦截 /api/* 请求，与 Apifox Mock 定义对齐
    viteMockServe({
      mockPath: 'mock',
      // 仅在 dev serve 时启用，避免 build 阶段无谓处理
      enable: command === 'serve',
      logger: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  // GitHub Pages 子路径部署
  base: '/nankai-focusly-pomodoro/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // ECharts 体积较大，独立 chunk + 路由懒加载，首屏不加载
          echarts: ['echarts'],
          // Vue 全家桶合并为一个 chunk，减少请求数
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
}))
