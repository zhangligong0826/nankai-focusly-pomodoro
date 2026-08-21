/**
 * 设置面板容器
 * @module components/settings/SettingsPanel
 * @description 分组：计时配置 / 外观主题 / 声音白噪音 / 每日目标 / 数据管理
 */
<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import TimerConfigForm from './TimerConfigForm.vue'
import ThemeToggle from './ThemeToggle.vue'
import WhiteNoisePlayer from './WhiteNoisePlayer.vue'
import DataExportPanel from './DataExportPanel.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { LIMITS, FOCUS_LOCK_MODE } from '@/utils/constants'

const settingsStore = useSettingsStore()
const config = computed(() => settingsStore.config)

const dailyGoal = computed({
  get: () => settingsStore.settings.dailyGoal,
  set: (v) => settingsStore.setDailyGoal(v),
})

const focusLock = computed(() => settingsStore.settings.focusLock)
const lockOptions = [
  { value: FOCUS_LOCK_MODE.OFF, label: '关闭' },
  { value: FOCUS_LOCK_MODE.SOFT, label: '软提醒' },
  { value: FOCUS_LOCK_MODE.HARD, label: '强锁' },
]
function setFocusLock(mode) {
  settingsStore.setFocusLockMode(mode)
}

/** 全局快捷键清单（与 useKeyboardShortcuts / useFocusLock 保持一致） */
const shortcuts = [
  { keys: ['Space'], desc: '开始 / 暂停计时（聚焦计时按钮时）' },
  { keys: ['Ctrl', 'P'], desc: '紧急暂停专注（Mac 为 Cmd + P）' },
  { keys: ['1', '2', '3', '4'], desc: '切换 Tab（计时 / 任务 / 统计 / 设置）' },
  { keys: ['?'], desc: '显示 / 隐藏快捷键帮助' },
  { keys: ['Esc'], desc: '关闭弹窗' },
]
</script>

<template>
  <div class="settings-panel">
    <!-- 计时配置 -->
    <section class="settings-section card">
      <h3 class="section-title">⏱ 计时配置</h3>
      <TimerConfigForm :config="config" />
    </section>

    <!-- 外观主题 -->
    <section class="settings-section card">
      <h3 class="section-title">🎨 外观主题</h3>
      <div class="section-row">
        <span class="row-label">深色模式</span>
        <ThemeToggle />
      </div>
      <div class="section-row">
        <span class="row-label" id="focus-lock-label">专注锁定</span>
        <div class="lock-selector" role="radiogroup" aria-labelledby="focus-lock-label">
          <button
            v-for="opt in lockOptions"
            :key="opt.value"
            class="lock-option"
            :class="{ 'lock-option--active': focusLock === opt.value }"
            role="radio"
            :aria-checked="focusLock === opt.value"
            @click="setFocusLock(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <p class="row-tip text-tertiary">
        软提醒：切走页面弹警告；强锁：切走立即中止，本次专注不计入（Ctrl/Cmd+P 可紧急暂停）
      </p>
    </section>

    <!-- 声音白噪音 -->
    <section class="settings-section card">
      <h3 class="section-title">🔊 声音与白噪音</h3>
      <WhiteNoisePlayer />
    </section>

    <!-- 快捷键 -->
    <section class="settings-section card">
      <h3 class="section-title">⌨️ 快捷键</h3>
      <ul class="shortcut-list">
        <li v-for="s in shortcuts" :key="s.keys.join('-')" class="shortcut-item">
          <span class="shortcut-keys">
            <kbd v-for="k in s.keys" :key="k">{{ k }}</kbd>
          </span>
          <span class="shortcut-desc">{{ s.desc }}</span>
        </li>
      </ul>
    </section>

    <!-- 每日目标 -->
    <section class="settings-section card">
      <h3 class="section-title">🎯 每日目标</h3>
      <div class="goal-row">
        <label class="row-label" for="daily-goal-input">每日目标番茄数</label>
        <input
          id="daily-goal-input"
          v-model.number="dailyGoal"
          type="number"
          class="goal-input"
          :min="LIMITS.DAILY_GOAL_MIN"
          :max="LIMITS.DAILY_GOAL_MAX"
        />
      </div>
      <p class="row-tip text-tertiary">达到目标当日首次会弹出庆祝弹窗</p>
    </section>

    <!-- 数据管理 -->
    <section class="settings-section card">
      <h3 class="section-title">💾 数据管理</h3>
      <DataExportPanel />
    </section>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 720px;
  margin: 0 auto;
}
.settings-section {
  padding: var(--spacing-lg);
}
.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}
.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}
.row-label {
  font-size: var(--font-size-md);
  color: var(--color-text);
}
.row-tip {
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
}
.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.shortcut-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm);
}
.shortcut-keys {
  display: flex;
  gap: 4px;
  min-width: 120px;
}
.shortcut-desc {
  color: var(--color-text-secondary);
}
.goal-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.goal-input {
  width: 80px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-md);
}
.lock-selector {
  display: flex;
  gap: var(--spacing-xs);
  background-color: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
}
.lock-option {
  padding: var(--spacing-xs) var(--spacing-12);
  min-height: 32px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.lock-option:hover {
  color: var(--color-text);
}
.lock-option--active {
  background-color: var(--color-bg);
  color: var(--color-primary-text);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
/* 触屏设备放大命中区 */
@media (pointer: coarse) {
  .lock-option {
    min-height: var(--touch-target-min);
  }
}
</style>
