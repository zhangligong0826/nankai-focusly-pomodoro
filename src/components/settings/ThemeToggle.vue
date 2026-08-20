/**
 * 深色模式开关（P1-9）
 * @module components/settings/ThemeToggle
 * @description 切换时 settingsStore.toggleTheme → document data-theme
 */
<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const isDark = computed(() => settingsStore.isDark)

function toggle() {
  settingsStore.toggleTheme()
}
</script>

<template>
  <button
    class="theme-toggle"
    :class="{ 'is-dark': isDark }"
    role="switch"
    :aria-checked="isDark"
    @click="toggle"
  >
    <span class="toggle-track">
      <span class="toggle-thumb">
        <span class="toggle-icon">{{ isDark ? '🌙' : '☀️' }}</span>
      </span>
    </span>
    <span class="toggle-label">{{ isDark ? '深色' : '浅色' }}</span>
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}
.toggle-track {
  width: 48px;
  height: 26px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  position: relative;
  transition: background-color var(--transition-base);
}
.theme-toggle.is-dark .toggle-track {
  background-color: var(--color-primary);
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-base);
}
.theme-toggle.is-dark .toggle-thumb {
  transform: translateX(22px);
}
.toggle-icon {
  font-size: 11px;
  line-height: 1;
}
.toggle-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
