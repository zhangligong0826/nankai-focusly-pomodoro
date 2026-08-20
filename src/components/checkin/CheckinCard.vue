/**
 * 今日打卡状态卡片
 * @module components/checkin/CheckinCard
 * @description 已打卡显示大对勾 + "今日已专注 N 番茄，M 分钟"；未打卡灰色
 */
<script setup>
import { computed } from 'vue'
import { useCheckinStore } from '@/stores/checkin'
import { minutesToChinese } from '@/utils/format'

const checkinStore = useCheckinStore()

const checked = computed(() => checkinStore.todayChecked)
const pomodoroCount = computed(() => checkinStore.todayPomodoroCount)
const totalMinutes = computed(() => checkinStore.todayMinutes)
const streak = computed(() => checkinStore.streak)
</script>

<template>
  <div class="checkin-card card" :class="{ 'is-checked': checked }">
    <div class="checkin-left">
      <div class="check-circle" :class="{ 'is-checked': checked }">
        <svg v-if="checked" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M5 13l4 4L19 7" />
        </svg>
        <span v-else class="empty-dot"></span>
      </div>
    </div>
    <div class="checkin-right">
      <template v-if="checked">
        <div class="checkin-title">今日已专注</div>
        <div class="checkin-detail">
          <strong>{{ pomodoroCount }}</strong> 个番茄 · {{ minutesToChinese(totalMinutes) }}
        </div>
        <div class="checkin-streak" v-if="streak > 0">
          🔥 连续打卡 {{ streak }} 天
        </div>
      </template>
      <template v-else>
        <div class="checkin-title">今天还没有开始专注哦</div>
        <div class="checkin-detail text-tertiary">完成一个番茄即可打卡</div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.checkin-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  cursor: default;
  transition: box-shadow var(--transition-base);
}
.checkin-card.is-checked {
  box-shadow: 0 4px 16px var(--color-primary-light);
}
.check-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}
.check-circle.is-checked {
  background-color: var(--color-success);
  color: #fff;
}
.empty-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-text-tertiary);
}
.checkin-title {
  font-size: var(--font-size-md);
  color: var(--color-text);
  font-weight: 500;
}
.checkin-detail {
  font-size: var(--font-size-lg);
  color: var(--color-text);
  margin-top: var(--spacing-xs);
}
.checkin-detail strong {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
}
.checkin-streak {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--color-warning);
}
</style>
