/**
 * 累计指标卡片组
 * @module components/stats/StatsSummary
 * @description 4 个指标卡片（累计时长/番茄数/打卡天数/连续天数），时长用 minutesToHHMM
 */
<script setup>
import { computed } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { minutesToHHMM, formatNumber } from '@/utils/format'

const statsStore = useStatsStore()

const cards = computed(() => [
  {
    key: 'minutes',
    label: '累计专注时长',
    value: minutesToHHMM(statsStore.summary.totalFocusMinutes || 0),
    icon: '⏱',
    color: 'var(--color-primary)',
  },
  {
    key: 'pomodoros',
    label: '累计番茄数',
    value: formatNumber(statsStore.summary.totalPomodoros || 0) + ' 个',
    icon: '🍅',
    color: 'var(--color-warning)',
  },
  {
    key: 'days',
    label: '累计打卡天数',
    value: (statsStore.summary.totalCheckinDays || 0) + ' 天',
    icon: '📅',
    color: 'var(--color-success)',
  },
  {
    key: 'streak',
    label: '连续打卡天数',
    value: (statsStore.summary.currentStreak || 0) + ' 天',
    icon: '🔥',
    color: 'var(--color-warning)',
  },
])
</script>

<template>
  <div class="stats-summary">
    <div
      v-for="c in cards"
      :key="c.key"
      class="summary-card card"
    >
      <div class="summary-icon" :style="{ color: c.color }">{{ c.icon }}</div>
      <div class="summary-body">
        <div class="summary-value">{{ c.value }}</div>
        <div class="summary-label">{{ c.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}
.summary-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}
.summary-icon {
  font-size: 28px;
}
.summary-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}
.summary-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}
@media (max-width: 767px) {
  .stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
