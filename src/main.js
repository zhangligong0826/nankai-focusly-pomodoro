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
import { useLocalStorage } from './composables/useLocalStorage'
import { useSettingsStore } from './stores/settings'
import { useTaskStore } from './stores/task'
import { useCheckinStore } from './stores/checkin'
import { useStatsStore } from './stores/stats'
import { useTimerStore } from './stores/timer'
import { LS_KEY, THEME } from './utils/constants'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// 同步应用主题，避免首屏闪烁
const storage = useLocalStorage()
const lsSettings = storage.getItem(LS_KEY.SETTINGS, null)
let theme = lsSettings && lsSettings.theme
if (!theme) {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  theme = prefersDark ? THEME.DARK : THEME.LIGHT
}
document.documentElement.setAttribute('data-theme', theme)

app.mount('#app')

// 挂载后异步初始化各 store（API 刷新 + LS 兜底）
;(async () => {
  const settingsStore = useSettingsStore()
  await settingsStore.init()
  const taskStore = useTaskStore()
  const checkinStore = useCheckinStore()
  const statsStore = useStatsStore()
  const timerStore = useTimerStore()
  await Promise.all([
    taskStore.init(),
    checkinStore.init(),
    statsStore.init(),
  ])
  timerStore.init()
})()
