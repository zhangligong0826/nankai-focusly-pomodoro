/**
 * 顶部导航栏
 * @module components/common/AppHeader
 * @description Logo + 今日打卡状态 + 设置入口按钮
 */
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCheckinStore } from '@/stores/checkin'
import { minutesToChinese } from '@/utils/format'

const router = useRouter()
const checkinStore = useCheckinStore()

const todayChecked = computed(() => checkinStore.todayChecked)
const todayCount = computed(() => checkinStore.todayPomodoroCount)
const todayMin = computed(() => checkinStore.todayMinutes)

function goSettings() {
  router.push('/settings')
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <span class="logo-icon" aria-hidden="true">🍅</span>
        <span class="logo-text">Focusly</span>
      </div>
    </div>

    <div class="header-right">
      <div class="checkin-status" :class="{ 'is-checked': todayChecked }">
        <span class="check-icon" aria-hidden="true">{{ todayChecked ? '✓' : '○' }}</span>
        <span class="check-text">
          <template v-if="todayChecked">
            今日 {{ todayCount }} 番茄 · {{ minutesToChinese(todayMin) }}
          </template>
          <template v-else>今天还没有开始专注哦</template>
        </span>
      </div>
      <button class="settings-btn" aria-label="设置" @click="goSettings">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border-light);
  position: sticky;
  top: 0;
  z-index: var(--z-header);
}
.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--color-primary);
}
.logo-icon {
  font-size: var(--font-size-xl);
}
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
.checkin-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-secondary);
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}
.checkin-status.is-checked {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
.check-icon {
  font-size: var(--font-size-sm);
}
.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: background-color var(--transition-fast);
}
.settings-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-primary);
}
@media (max-width: 480px) {
  .check-text {
    display: none;
  }
}
</style>
