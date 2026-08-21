/**
 * 高效时段图（ECharts 柱状图）
 * @module components/stats/PeakHoursChart
 * @description 24 小时专注分钟分布，标注峰值时段
 */
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue'
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

const peakLabel = computed(() => {
  const peak = statsStore.peakHours.peak
  if (peak === null || peak === undefined) return ''
  const end = (peak + 1) % 24
  return `${String(peak).padStart(2, '0')}:00 - ${String(end).padStart(2, '0')}:00`
})

function getOption() {
  const buckets = statsStore.peakHours.buckets || []
  const hours = buckets.map((b) => `${String(b.hour).padStart(2, '0')}:00`)
  const minutes = buckets.map((b) => b.minutes || 0)
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0] || {}
        const b = buckets[p.dataIndex] || {}
        return `${hours[p.dataIndex]}<br/>专注 ${p.value || 0} 分钟<br/>${b.count || 0} 次`
      },
    },
    grid: { left: 40, right: 16, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: cssVar('--color-border', '#e0e0e0') } },
      axisLabel: {
        color: cssVar('--color-text-tertiary', '#737373'),
        interval: 2,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: cssVar('--color-text-tertiary', '#737373') },
      splitLine: { lineStyle: { color: cssVar('--color-border-light', '#f0f0f0') } },
    },
    series: [
      {
        type: 'bar',
        data: minutes,
        itemStyle: {
          color: cssVar('--color-primary', '#e74c3c'),
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '60%',
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
    await statsStore.fetchPeakHours()
    render()
    window.addEventListener('resize', onResize)
  }
})

watch(
  () => statsStore.peakHours,
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
  <div class="peak-wrapper">
    <div class="chart-wrapper card">
      <div
        ref="chartRef"
        class="chart-canvas"
        role="img"
        aria-label="24 小时专注时长分布图"
      ></div>
    </div>
    <p v-if="peakLabel" class="peak-hint">
      <span aria-hidden="true">⚡</span> 你的高效时段是
      <strong>{{ peakLabel }}</strong>
    </p>
  </div>
</template>

<style scoped>
.peak-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.chart-wrapper {
  padding: var(--spacing-md);
  position: relative;
  min-height: 320px;
}
.chart-canvas {
  width: 100%;
  height: 260px;
}
.peak-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  text-align: center;
}
.peak-hint strong {
  color: var(--color-primary-text);
}
</style>
