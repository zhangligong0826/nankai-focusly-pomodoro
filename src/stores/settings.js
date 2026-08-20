/**
 * 设置 Store（计时器配置 + 应用设置）
 * @module stores/settings
 * @description config 与 TimerStore 共享引用；settings 含主题/白噪音/目标/锁定
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import settingsApi from '@/api/settings'
import timerApi from '@/api/timer'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import {
  LS_KEY,
  DEFAULT_TIMER_CONFIG,
  DEFAULT_SETTINGS,
  THEME,
} from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  const storage = useLocalStorage()

  /** 计时器配置（与 TimerStore 共享） */
  const config = ref({ ...DEFAULT_TIMER_CONFIG })
  /** 应用设置 */
  const settings = ref({ ...DEFAULT_SETTINGS })
  /** 是否已初始化 */
  const inited = ref(false)

  /** 是否深色模式 */
  const isDark = computed(() => settings.value.theme === THEME.DARK)

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', settings.value.theme)
    }
  }

  /**
   * 初始化：LS 优先（真实持久数据）→ API 刷新（首次无数据时用演示数据）
   */
  async function init() {
    const lsConfig = storage.getItem(LS_KEY.TIMER_CONFIG, null)
    const lsSettings = storage.getItem(LS_KEY.SETTINGS, null)
    if (lsConfig && typeof lsConfig === 'object') {
      config.value = { ...DEFAULT_TIMER_CONFIG, ...lsConfig }
    }
    if (lsSettings && typeof lsSettings === 'object') {
      settings.value = { ...DEFAULT_SETTINGS, ...lsSettings }
    }
    // 首次进入跟随系统主题
    if (!lsSettings) {
      const prefersDark =
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      settings.value.theme = prefersDark ? THEME.DARK : THEME.LIGHT
    }
    applyTheme()

    // API 刷新（失败不影响已加载的 LS 数据）
    try {
      const [apiConfig, apiSettings] = await Promise.all([
        timerApi.getTimerConfig().catch(() => null),
        settingsApi.getSettings().catch(() => null),
      ])
      if (!lsConfig && apiConfig) {
        config.value = { ...DEFAULT_TIMER_CONFIG, ...apiConfig }
        storage.setItem(LS_KEY.TIMER_CONFIG, config.value)
      }
      if (!lsSettings && apiSettings) {
        settings.value = { ...DEFAULT_SETTINGS, ...apiSettings }
        storage.setItem(LS_KEY.SETTINGS, settings.value)
        applyTheme()
      }
    } catch (_) {
      /* LS 已加载，忽略 */
    }
    inited.value = true
  }

  /**
   * 更新计时器配置
   * @param {object} payload - 部分字段
   */
  async function updateConfig(payload) {
    config.value = { ...config.value, ...payload }
    storage.setItem(LS_KEY.TIMER_CONFIG, config.value)
    try {
      await timerApi.updateTimerConfig(payload)
      showToast('计时配置已保存', 'success')
    } catch (_) {
      showToast('网络异常，已离线保存', 'warning')
    }
  }

  /**
   * 更新应用设置
   * @param {object} payload - 部分字段
   */
  async function updateSettings(payload) {
    settings.value = { ...settings.value, ...payload }
    storage.setItem(LS_KEY.SETTINGS, settings.value)
    if (payload.theme !== undefined) applyTheme()
    try {
      await settingsApi.updateSettings(payload)
    } catch (_) {
      showToast('网络异常，已离线保存', 'warning')
    }
  }

  /** 切换深色/浅色模式 */
  function toggleTheme() {
    const next = settings.value.theme === THEME.DARK ? THEME.LIGHT : THEME.DARK
    updateSettings({ theme: next })
  }

  /** 设置白噪音类型 */
  function setWhiteNoise(type) {
    updateSettings({ whiteNoise: type })
  }

  /** 设置每日目标 */
  function setDailyGoal(n) {
    const v = Math.max(1, Math.min(20, Number(n) || 4))
    updateSettings({ dailyGoal: v })
  }

  /** 切换专注锁定 */
  function toggleFocusLock() {
    updateSettings({ focusLock: !settings.value.focusLock })
  }

  return {
    config,
    settings,
    inited,
    isDark,
    init,
    applyTheme,
    updateConfig,
    updateSettings,
    toggleTheme,
    setWhiteNoise,
    setDailyGoal,
    toggleFocusLock,
  }
})

export default useSettingsStore
