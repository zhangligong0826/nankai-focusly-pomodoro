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
  FOCUS_LOCK_MODE,
} from '@/utils/constants'

export const useSettingsStore = defineStore('settings', () => {
  const storage = useLocalStorage()

  /** 计时器配置（与 TimerStore 共享） */
  const config = ref({ ...DEFAULT_TIMER_CONFIG })
  /** 应用设置 */
  const settings = ref({ ...DEFAULT_SETTINGS })
  /** 是否已初始化 */
  const inited = ref(false)

  /** 系统是否偏好深色 */
  const systemPrefersDark = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches

  /** 是否深色模式（system 时跟随系统） */
  const isDark = computed(() => {
    if (settings.value.theme === THEME.SYSTEM) return systemPrefersDark()
    return settings.value.theme === THEME.DARK
  })

  /**
   * 应用主题到 DOM
   */
  function applyTheme() {
    if (typeof document !== 'undefined') {
      const theme = settings.value.theme
      const effective = theme === THEME.SYSTEM
        ? (systemPrefersDark() ? THEME.DARK : THEME.LIGHT)
        : theme
      document.documentElement.setAttribute('data-theme', effective)
    }
  }

  // 系统主题变化时，若当前为 system 模式则自动跟随
  if (typeof window !== 'undefined' && window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (settings.value.theme === THEME.SYSTEM) applyTheme()
      })
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
      // 兼容旧版：whiteNoise 单字符串 → 数组（P1-5 多场景混音）
      if (typeof settings.value.whiteNoise === 'string') {
        const v = settings.value.whiteNoise
        settings.value.whiteNoise =
          v && v !== 'none' && v !== 'silence' ? [v] : []
      }
      // 兼容旧版：focusLock 布尔 → 三态（P1-6 锁机分级）
      if (typeof settings.value.focusLock === 'boolean') {
        settings.value.focusLock = settings.value.focusLock
          ? FOCUS_LOCK_MODE.SOFT
          : FOCUS_LOCK_MODE.OFF
      }
    }
    // 首次进入跟随系统主题
    if (!lsSettings) {
      settings.value.theme = THEME.SYSTEM
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
    const next = isDark.value ? THEME.LIGHT : THEME.DARK
    updateSettings({ theme: next })
  }

  /** 设置主题模式（light / dark / system） */
  function setTheme(theme) {
    if (Object.values(THEME).includes(theme)) {
      updateSettings({ theme })
    }
  }

  /** 设置白噪音场景（多选数组） */
  function setWhiteNoise(types) {
    const list = Array.isArray(types) ? types : [types]
    updateSettings({ whiteNoise: list })
  }

  /** 设置每日目标 */
  function setDailyGoal(n) {
    const v = Math.max(1, Math.min(20, Number(n) || 4))
    updateSettings({ dailyGoal: v })
  }

  /** 设置专注锁定级别（off/soft/hard） */
  function setFocusLockMode(mode) {
    if (Object.values(FOCUS_LOCK_MODE).includes(mode)) {
      updateSettings({ focusLock: mode })
    }
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
    setTheme,
    setWhiteNoise,
    setDailyGoal,
    setFocusLockMode,
  }
})

export default useSettingsStore
