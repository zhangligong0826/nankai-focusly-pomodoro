/**
 * 应用入口
 * @module main
 * @description 创建 app → 挂载 Pinia + Router → 引入全局样式 → 同步应用主题 → 异步初始化 stores
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/global.css'
import { registerSW } from 'virtual:pwa-register'
import { useLocalStorage } from './composables/useLocalStorage'
import { showToast } from './composables/useToast'
import { migrateLegacyData } from './utils/migrate'
import { useSettingsStore } from './stores/settings'
import { useTaskStore } from './stores/task'
import { useCheckinStore } from './stores/checkin'
import { useStatsStore } from './stores/stats'
import { useTimerStore } from './stores/timer'
import { useGardenStore } from './stores/garden'
import { LS_KEY, THEME } from './utils/constants'

// 注册 Service Worker（PWA：离线可用 + 自动更新）
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      showToast('有新版本可用，刷新页面即可更新', 'info', 4000)
    },
    onOfflineReady() {
      showToast('应用已可离线使用', 'success')
    },
  })
}

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 同步应用主题，避免首屏闪烁
const storage = useLocalStorage()
const lsSettings = storage.getItem<Record<string, unknown> | null>(LS_KEY.SETTINGS, null)
let theme: string = (lsSettings && (lsSettings.theme as string)) || ''
if (!theme) {
  const prefersDark =
    typeof window !== 'undefined' &&
    !!window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  theme = prefersDark ? THEME.DARK : THEME.LIGHT
}
document.documentElement.setAttribute('data-theme', theme)

app.mount('#app')

// 挂载后异步初始化各 store（API 刷新 + 本地兜底）
;(async () => {
  // 先迁移旧 localStorage 大块历史数据 → IndexedDB（幂等）
  await migrateLegacyData()

  const settingsStore = useSettingsStore()
  await settingsStore.init()
  const taskStore = useTaskStore()
  const checkinStore = useCheckinStore()
  const statsStore = useStatsStore()
  const timerStore = useTimerStore()
  const gardenStore = useGardenStore()
  await Promise.all([
    taskStore.init(),
    checkinStore.init(),
    statsStore.init(),
  ])
  gardenStore.init()
  gardenStore.reconcile()
  timerStore.init()
})()
