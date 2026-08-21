/**
 * 年报柱状图（P2-1）
 * @module components/stats/YearlyChart
 * @description 12 个月专注分钟柱状图；复用 ECharts + cssVar 主题适配模式
 */
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useStatsStore } from '@/stores/stats'
import { useSettingsStore } from '@/stores/settings'

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer])

const statsStore = useStatsStore()
const settingsStore = useSettingsStore()
const chartRef = ref(null)
let chart = null

function cssVar(varName, fallback) {
  if (typeof getComputedStyle === 'undefined') return fallback
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim()
  return val || fallback
}

function getOption() {
  const data = statsStore.yearlyData
  const safe = Array.isArray(data) ? data : []
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const p = params[0] || {}
        const item = safe[p.dataIndex] || {}
        return `${item.month}<br/>专注 ${p.value || 0} 分钟<br/>${item.pomodoroCount || 0} 个番茄`
      },
    },
    grid: { left: 40, right: 16, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: safe.map((d) => (d.month || '').slice(5) + '月'),
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
        barWidth: '55%',
      },
    ],
  }
}

function render() {
  if (!chart) return
  chart.setOption(getOption(), true)
}

function onResize() {
  chart && chart.resize()
}

onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    await statsStore.fetchYearly(new Date().getFullYear())
    render()
    window.addEventListener('resize', onResize)
  }
})

watch(
  () => statsStore.yearlyData,
  () => render(),
  { deep: true }
)

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
    <div
      ref="chartRef"
      class="chart-canvas"
      role="img"
      aria-label="本年度每月专注时长柱状图"
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
</style>
