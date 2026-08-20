/**
 * Vite 构建配置
 * @module vite.config
 * @description Vue3 + vite-plugin-mock + ECharts 分包 + GitHub Pages 部署 base 路径
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteMockServe } from 'vite-plugin-mock'
import { VitePWA } from 'vite-plugin-pwa'
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
    // PWA：离线可用 + 添加到主屏（仅生产构建时生成 Service Worker）
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Focusly 番茄时钟',
        short_name: 'Focusly',
        description: '专注学习打卡工具，集番茄计时、任务管理、每日打卡、数据统计于一体',
        theme_color: '#E74C3C',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/nankai-focusly-pomodoro/',
        scope: '/nankai-focusly-pomodoro/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/nankai-focusly-pomodoro/index.html',
      },
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
    emptyOutDir: false,
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
