/**
 * 日历热力图（ECharts Heatmap + Calendar）
 * @module components/stats/HeatmapChart
 * @description GitHub 风格：近 12 月逐日专注时长深浅；主题切换自动重渲
 */
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import {
  CalendarComponent,
  VisualMapComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useStatsStore } from '@/stores/stats'
import { useSettingsStore } from '@/stores/settings'

echarts.use([
  HeatmapChart,
  CalendarComponent,
  VisualMapComponent,
  TooltipComponent,
  CanvasRenderer,
])

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

function getRange() {
  const data = statsStore.heatmapData
  if (!data.length) return ['2026-01-01', '2026-12-31']
  return [data[0][0], data[data.length - 1][0]]
}

function getOption() {
  const data = statsStore.heatmapData
  const [min, max] = getRange()
  const maxVal = Math.max(1, ...data.map((d) => d[1]))
  return {
    tooltip: {
      formatter: (p) => `${p.value[0]}<br/>专注 ${p.value[1]} 分钟`,
    },
    visualMap: {
      min: 0,
      max: maxVal,
      type: 'piecewise',
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      pieces: [
        { value: 0, color: cssVar('--color-bg-secondary', '#f0f0f0') },
        { min: 1, max: Math.max(1, Math.round(maxVal / 4)), color: cssVar('--color-primary-light', '#fbe4e1') },
        { min: Math.round(maxVal / 4) + 1, max: Math.round(maxVal / 2), color: '#f5b7b1' },
        { min: Math.round(maxVal / 2) + 1, max: Math.round(maxVal * 3 / 4), color: '#e98b82' },
        { min: Math.round(maxVal * 3 / 4) + 1, color: cssVar('--color-primary', '#e74c3c') },
      ],
      textStyle: { color: cssVar('--color-text-secondary', '#595959') },
    },
    calendar: {
      top: 40,
      left: 30,
      right: 20,
      range: [min, max],
      cellSize: ['auto', 14],
      splitLine: { lineStyle: { color: cssVar('--color-border-light', '#f0f0f0') } },
      itemStyle: {
        color: cssVar('--color-bg', '#ffffff'),
        borderWidth: 1,
        borderColor: cssVar('--color-border-light', '#f0f0f0'),
      },
      dayLabel: { color: cssVar('--color-text-tertiary', '#737373') },
      monthLabel: { color: cssVar('--color-text-tertiary', '#737373') },
      yearLabel: { color: cssVar('--color-text-tertiary', '#737373') },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data,
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
    await statsStore.fetchHeatmap()
    render()
    window.addEventListener('resize', onResize)
  }
})

watch(
  () => statsStore.heatmapData,
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
      aria-label="近一年每日专注时长热力图"
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
  height: 220px;
}
</style>
