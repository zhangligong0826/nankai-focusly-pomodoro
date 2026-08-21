/**
 * 主题模式选择（P1-9）
 * @module components/settings/ThemeToggle
 * @description 浅色 / 深色 / 跟随系统 三态切换；system 模式监听 prefers-color-scheme
 */
<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { THEME } from '@/utils/constants'

const settingsStore = useSettingsStore()
const current = computed(() => settingsStore.settings.theme)

const options = [
  { value: THEME.LIGHT, label: '浅色', icon: '☀️' },
  { value: THEME.DARK, label: '深色', icon: '🌙' },
  { value: THEME.SYSTEM, label: '跟随系统', icon: '🖥' },
]

function select(value) {
  settingsStore.setTheme(value)
}
</script>

<template>
  <div class="theme-toggle" role="radiogroup" aria-label="主题模式">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="theme-option"
      :class="{ 'theme-option--active': current === opt.value }"
      role="radio"
      :aria-checked="current === opt.value"
      @click="select(opt.value)"
    >
      <span class="theme-icon" aria-hidden="true">{{ opt.icon }}</span>
      <span class="theme-text">{{ opt.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.theme-toggle {
  display: flex;
  gap: var(--spacing-xs);
  background-color: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
}
.theme-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-12);
  min-height: 36px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.theme-option:hover {
  color: var(--color-text);
}
.theme-option--active {
  background-color: var(--color-bg);
  color: var(--color-primary-text);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.theme-icon {
  font-size: 14px;
  line-height: 1;
}
/* 触屏设备放大命中区 */
@media (pointer: coarse) {
  .theme-option {
    min-height: var(--touch-target-min);
  }
}
</style>
