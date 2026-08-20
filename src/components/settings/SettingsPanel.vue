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
import { LIMITS } from '@/utils/constants'

const settingsStore = useSettingsStore()
const config = computed(() => settingsStore.config)

const dailyGoal = computed({
  get: () => settingsStore.settings.dailyGoal,
  set: (v) => settingsStore.setDailyGoal(v),
})

const focusLock = computed(() => settingsStore.settings.focusLock)
function toggleFocusLock() {
  settingsStore.toggleFocusLock()
}
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
        <span class="row-label">专注锁定</span>
        <button
          class="switch"
          :class="{ 'switch--on': focusLock }"
          role="switch"
          :aria-checked="focusLock"
          @click="toggleFocusLock"
        ></button>
      </div>
      <p class="row-tip text-tertiary">开启后专注期间切走页面会弹出警告（Ctrl/Cmd+P 可紧急暂停）</p>
    </section>

    <!-- 声音白噪音 -->
    <section class="settings-section card">
      <h3 class="section-title">🔊 声音与白噪音</h3>
      <WhiteNoisePlayer />
    </section>

    <!-- 每日目标 -->
    <section class="settings-section card">
      <h3 class="section-title">🎯 每日目标</h3>
      <div class="goal-row">
        <label class="row-label">每日目标番茄数</label>
        <input
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
.switch {
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  background-color: var(--color-border);
  position: relative;
  transition: background-color var(--transition-base);
  flex-shrink: 0;
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color-bg);
  transition: transform var(--transition-base);
}
.switch--on {
  background-color: var(--color-primary);
}
.switch--on::after {
  transform: translateX(20px);
}
</style>
