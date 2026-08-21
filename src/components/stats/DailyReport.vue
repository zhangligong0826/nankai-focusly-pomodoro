/**
 * 日报（P2-1）
 * @module components/stats/DailyReport
 * @description 今日指标卡（番茄数/专注分钟/完成任务数）+ 任务专注分布列表
 */
<script setup>
import { computed, onMounted } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { minutesToChinese } from '@/utils/format'
import { getTodayStr } from '@/utils/date'

const statsStore = useStatsStore()

const data = computed(() => statsStore.dailyData)
const distribution = computed(() => data.value?.taskDistribution || [])

const cards = computed(() => {
  const d = data.value || {}
  return [
    { label: '今日番茄数', value: (d.pomodoroCount || 0) + ' 个', icon: '🍅', color: 'var(--color-warning)' },
    { label: '今日专注时长', value: minutesToChinese(d.totalMinutes || 0), icon: '⏱', color: 'var(--color-primary)' },
    { label: '完成任务数', value: (d.completedTasks || 0) + ' 个', icon: '✅', color: 'var(--color-success)' },
  ]
})

const maxMinutes = computed(() =>
  Math.max(1, ...distribution.value.map((t) => t.minutes || 0))
)

function barWidth(t) {
  return ((t.minutes || 0) / maxMinutes.value) * 100 + '%'
}

onMounted(() => {
  statsStore.fetchDaily(getTodayStr())
})
</script>

<template>
  <div class="daily-report">
    <div class="daily-cards">
      <div v-for="c in cards" :key="c.label" class="daily-card card">
        <div class="daily-icon" :style="{ color: c.color }" aria-hidden="true">{{ c.icon }}</div>
        <div class="daily-body">
          <div class="daily-value tnum">{{ c.value }}</div>
          <div class="daily-label">{{ c.label }}</div>
        </div>
      </div>
    </div>

    <div class="daily-distribution card">
      <h3 class="distribution-title">今日任务分布</h3>
      <ul v-if="distribution.length" class="distribution-list">
        <li v-for="t in distribution" :key="t.taskId" class="distribution-item">
          <span class="distribution-name">{{ t.title }}</span>
          <span class="distribution-bar-wrap">
            <span class="distribution-bar" :style="{ width: barWidth(t) }"></span>
          </span>
          <span class="distribution-meta tnum">{{ minutesToChinese(t.minutes) }} · {{ t.count }} 番茄</span>
        </li>
      </ul>
      <p v-else class="distribution-empty text-tertiary">今天还没有专注记录，去开始第一个番茄吧 🍅</p>
    </div>
  </div>
</template>

<style scoped>
.daily-report {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.daily-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}
.daily-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}
.daily-icon {
  font-size: 24px;
}
.daily-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}
.daily-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.daily-distribution {
  padding: var(--spacing-md);
}
.distribution-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.distribution-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.distribution-name {
  flex-shrink: 0;
  width: 120px;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.distribution-bar-wrap {
  flex: 1;
  height: 8px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.distribution-bar {
  display: block;
  height: 100%;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
}
.distribution-meta {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
.distribution-empty {
  font-size: var(--font-size-sm);
  text-align: center;
  padding: var(--spacing-md) 0;
}
@media (max-width: 480px) {
  .daily-cards {
    grid-template-columns: 1fr;
  }
  .distribution-name {
    width: 80px;
  }
}
</style>
