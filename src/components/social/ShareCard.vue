/**
 * 分享卡片模板（P3-3）
 * @module components/social/ShareCard
 * @description 隐藏的分享图模板 DOM，供 html2canvas 截图下载。
 *   样式用字面量颜色（html2canvas 不支持 CSS 变量）。
 */
<script setup>
import { ref, computed } from 'vue'
import { useCheckinStore } from '@/stores/checkin'
import { useStatsStore } from '@/stores/stats'
import { minutesToHHMM, formatNumber } from '@/utils/format'
import { getWeekStart, getTodayStr, addDays, formatDate } from '@/utils/date'
import { DAILY_QUOTES } from '@/utils/constants'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const checkinStore = useCheckinStore()
const statsStore = useStatsStore()

const rootEl = ref(null)

defineExpose({ getEl: () => rootEl.value })

const weekStart = computed(() => getWeekStart())
const weekEnd = computed(() => addDays(weekStart.value, 6))

const weekPomodoros = computed(() =>
  checkinStore.checkins
    .filter((c) => c.date >= weekStart.value && c.date <= weekEnd.value)
    .reduce((sum, c) => sum + (c.pomodoroCount || 0), 0)
)

const weekMinutes = computed(() =>
  checkinStore.checkins
    .filter((c) => c.date >= weekStart.value && c.date <= weekEnd.value)
    .reduce((sum, c) => sum + (c.totalMinutes || 0), 0)
)

const streak = computed(() => statsStore.summary.currentStreak || 0)

const quote = computed(() => {
  const hash = [...getTodayStr()].reduce((a, ch) => a + ch.charCodeAt(0), 0)
  return DAILY_QUOTES[hash % DAILY_QUOTES.length]
})
</script>

<template>
  <div v-if="visible" ref="rootEl" class="share-card">
    <div class="share-brand">🍅 Focusly</div>
    <div class="share-title">本周专注报告</div>
    <div class="share-hero">
      <span class="share-num">{{ formatNumber(weekPomodoros) }}</span>
      <span class="share-unit">番茄</span>
    </div>
    <div class="share-sub">共专注 {{ minutesToHHMM(weekMinutes) }}</div>

    <div class="share-stats">
      <div class="stat">
        <div class="stat-value">{{ formatNumber(weekPomodoros) }}</div>
        <div class="stat-label">本周番茄</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ streak }}</div>
        <div class="stat-label">连续打卡</div>
      </div>
      <div class="stat">
        <div class="stat-value">{{ minutesToHHMM(weekMinutes) }}</div>
        <div class="stat-label">专注时长</div>
      </div>
    </div>

    <div class="share-quote">「{{ quote }}」</div>
    <div class="share-footer">Focusly 番茄时钟 · {{ formatDate(Date.now(), 'YYYY-MM-DD') }}</div>
  </div>
</template>

<style scoped>
.share-card {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 480px;
  background: linear-gradient(160deg, #ffffff 0%, #fff5f3 100%);
  border-radius: 20px;
  padding: 40px 36px;
  box-sizing: border-box;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333333;
}
.share-brand {
  font-size: 15px;
  color: #E74C3C;
  font-weight: 700;
  letter-spacing: 1px;
}
.share-title {
  font-size: 22px;
  font-weight: 700;
  color: #333333;
  margin: 12px 0 20px;
}
.share-hero {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 4px;
}
.share-num {
  font-size: 72px;
  font-weight: 800;
  color: #E74C3C;
  line-height: 1;
}
.share-unit {
  font-size: 22px;
  font-weight: 600;
  color: #E74C3C;
}
.share-sub {
  font-size: 15px;
  color: #737373;
  margin-bottom: 28px;
}
.share-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}
.stat {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #333333;
}
.stat-label {
  font-size: 12px;
  color: #737373;
  margin-top: 4px;
}
.share-quote {
  font-size: 14px;
  color: #595959;
  font-style: italic;
  margin-bottom: 20px;
}
.share-footer {
  font-size: 11px;
  color: #b0b0b0;
}
</style>
