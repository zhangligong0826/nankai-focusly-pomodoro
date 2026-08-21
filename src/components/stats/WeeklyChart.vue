/**
 * 周柱状图（ECharts）
 * @module components/stats/WeeklyChart
 * @description X 轴周一~周日，Y 轴专注分钟数；颜色运行时读取 CSS 变量，
 *   暗色模式切换时自动重渲；watch 数据变化 setOption；resize 自适应
 */
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useStatsStore } from '@/stores/stats'
import { useSettingsStore } from '@/stores/settings'
import { formatDate } from '@/utils/date'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const props = defineProps({
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

const statsStore = useStatsStore()
const settingsStore = useSettingsStore()
const chartRef = ref(null)
let chart = null

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

/**
 * 读取 CSS 变量的运行时实际色值（ECharts 无法直接使用 var()）
 * @param {string} varName - 形如 '--color-text-tertiary'
 * @param {string} fallback - 回退色值
 * @returns {string}
 */
function cssVar(varName, fallback) {
  if (typeof getComputedStyle === 'undefined') return fallback
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return val || fallback
}

function getOption(data) {
  const safe = Array.isArray(data) ? data : []
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0] || {}
        const item = safe[p.dataIndex] || {}
        return `${formatDate(item.date || '', 'MM-DD')}<br/>专注 ${p.value || 0} 分钟<br/>${item.pomodoroCount || 0} 个番茄`
      },
    },
    grid: { left: 40, right: 16, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: safe.map((d, i) => weekDays[i] || formatDate(d.date, 'MM-DD')),
      axisLine: { lineStyle: { color: cssVar('--color-border', '#e0e0e0') } },
      axisLabel: { color: cssVar('--color-text-tertiary', '#737373') },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: cssVar('--color-text-tertiary', '#737373') },
      splitLine: { lineStyle: { color: cssVar('--color-border-light', '#f0f0f0') } },
    },
    series: [
      {
        type: 'bar',
        data: safe.map((d) => d.focusMinutes || 0),
        itemStyle: {
          color: cssVar('--color-primary', '#e74c3c'),
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '50%',
      },
    ],
  }
}

function render() {
  if (!chart) return
  chart.setOption(getOption(props.data), true)
}

function onResize() {
  chart && chart.resize()
}

onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    render()
    window.addEventListener('resize', onResize)
  }
})

watch(
  () => props.data,
  () => render(),
  { deep: true }
)

// 主题切换后坐标轴/网格线颜色需重取
watch(
  () => settingsStore.isDark,
  () => nextTick(render)
)

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  if (chart) {
    chart.dispose()
    chart = null
  }
})
</script>

<template>
  <div class="chart-wrapper card">
    <div v-if="loading" class="chart-skeleton skeleton"></div>
    <div
      ref="chartRef"
      class="chart-canvas"
      role="img"
      aria-label="本周每日专注时长柱状图"
    ></div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  padding: var(--spacing-md);
  position: relative;
  min-height: 320px;
}
.chart-canvas {
  width: 100%;
  height: 300px;
}
.chart-skeleton {
  position: absolute;
  inset: var(--spacing-md);
  height: 300px;
}
</style>
