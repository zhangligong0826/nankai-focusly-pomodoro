/**
 * 周报 PDF 模板（P2-3）
 * @module components/stats/WeeklyReport
 * @description 隐藏的 A4 模板 DOM，供 html2canvas 截图生成 PDF。
 *   样式用字面量颜色（html2canvas 不支持 CSS 变量）。
 */
<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useStatsStore } from '@/stores/stats'
import { useCheckinStore } from '@/stores/checkin'
import { minutesToHHMM, formatNumber } from '@/utils/format'
import { getWeekStart, getTodayStr, addDays, formatDate } from '@/utils/date'
import { DAILY_QUOTES } from '@/utils/constants'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const statsStore = useStatsStore()
const checkinStore = useCheckinStore()

const chartRef = ref(null)
const rootEl = ref(null)
let chart = null

// 暴露根元素与图表渲染，供 pdfExport 截图
defineExpose({
  getEl: () => rootEl.value,
  renderChart,
})

const weekStart = computed(() => getWeekStart())
const weekEnd = computed(() => addDays(weekStart.value, 6))

const weekLabel = computed(() => {
  return `${weekStart.value} ~ ${weekEnd.value}`
})

const quote = computed(() => {
  const hash = [...getTodayStr()].reduce((a, ch) => a + ch.charCodeAt(0), 0)
  return DAILY_QUOTES[hash % DAILY_QUOTES.length]
})

const weekMinutes = computed(() => {
  const start = weekStart.value
  const end = weekEnd.value
  return checkinStore.checkins
    .filter((c) => c.date >= start && c.date <= end)
    .reduce((sum, c) => sum + (c.totalMinutes || 0), 0)
})

const weekPomodoros = computed(() => {
  const start = weekStart.value
  const end = weekEnd.value
  return checkinStore.checkins
    .filter((c) => c.date >= start && c.date <= end)
    .reduce((sum, c) => sum + (c.pomodoroCount || 0), 0)
})

const weekDays = computed(() => checkinStore.checkins.filter((c) => c.date >= weekStart.value && c.date <= weekEnd.value).length)

async function renderChart() {
  await nextTick()
  if (!chartRef.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const data = statsStore.weeklyData
  const safe = Array.isArray(data) ? data : []
  chart.setOption({
    grid: { left: 40, right: 16, top: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      data: safe.map((_, i) => ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]),
      axisLabel: { color: '#737373' },
      axisLine: { lineStyle: { color: '#e0e0e0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#737373' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [
      {
        type: 'bar',
        data: safe.map((d) => d.focusMinutes || 0),
        itemStyle: { color: '#E74C3C', borderRadius: [4, 4, 0, 0] },
        barWidth: '50%',
      },
    ],
  })
}

onMounted(() => {
  if (props.visible) renderChart()
})
</script>

<template>
  <div v-if="visible" ref="rootEl" class="weekly-report">
    <div class="report-header">
      <h1 class="report-title">Focusly 学习周报</h1>
      <p class="report-sub">{{ weekLabel }}</p>
    </div>

    <div class="report-metrics">
      <div class="metric">
        <div class="metric-value">{{ minutesToHHMM(weekMinutes) }}</div>
        <div class="metric-label">本周专注时长</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ formatNumber(weekPomodoros) }} 个</div>
        <div class="metric-label">本周番茄数</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ weekDays }} 天</div>
        <div class="metric-label">打卡天数</div>
      </div>
      <div class="metric">
        <div class="metric-value">{{ statsStore.summary.currentStreak }} 天</div>
        <div class="metric-label">连续打卡</div>
      </div>
    </div>

    <div class="report-chart">
      <div ref="chartRef" class="report-chart-canvas"></div>
    </div>

    <div class="report-quote">
      <span>「{{ quote }}」</span>
    </div>

    <div class="report-footer">生成时间：{{ formatDate(Date.now(), 'YYYY-MM-DD HH:mm') }}</div>
  </div>
</template>

<style scoped>
.weekly-report {
  position: fixed;
  left: -9999px;
  top: 0;
  width: 794px;
  background-color: #ffffff;
  color: #333333;
  padding: 48px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.report-header {
  text-align: center;
  margin-bottom: 32px;
}
.report-title {
  font-size: 28px;
  font-weight: 700;
  color: #E74C3C;
  margin: 0 0 8px;
}
.report-sub {
  font-size: 14px;
  color: #737373;
  margin: 0;
}
.report-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.metric {
  text-align: center;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
}
.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: #333333;
}
.metric-label {
  font-size: 12px;
  color: #737373;
  margin-top: 4px;
}
.report-chart {
  margin-bottom: 24px;
}
.report-chart-canvas {
  width: 100%;
  height: 280px;
}
.report-quote {
  text-align: center;
  font-size: 15px;
  color: #595959;
  font-style: italic;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
.report-footer {
  text-align: center;
  font-size: 11px;
  color: #b0b0b0;
  margin-top: 24px;
}
</style>
