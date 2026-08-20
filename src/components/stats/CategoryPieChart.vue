/**
 * 任务分类占比饼图（ECharts）
 * @module components/stats/CategoryPieChart
 * @description 按任务分类统计已完成番茄数占比；watch 任务变化 setOption；深色模式颜色运行时读取
 */
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useTaskStore } from '@/stores/task'
import { CATEGORY_META, TASK_CATEGORY } from '@/utils/constants'

echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer])

const taskStore = useTaskStore()
const chartRef = ref(null)
let chart = null

/**
 * 读取 CSS 变量的运行时实际色值（ECharts 无法直接使用 var()）
 * @param {string} varName - 形如 '--color-info'
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

/**
 * 计算各分类已完成番茄数占比
 * @returns {Array<{name:string, value:number, itemStyle:{color:string}}>}
 */
function getCategoryData() {
  const counter = Object.values(TASK_CATEGORY).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})

  taskStore.tasks.forEach((t) => {
    const cat = t.category && counter[cat] !== undefined ? t.category : TASK_CATEGORY.OTHER
    counter[cat] += Number(t.completedPomodoros) || 0
  })

  return Object.entries(CATEGORY_META)
    .map(([key, meta]) => ({
      name: meta.label,
      value: counter[key] || 0,
      itemStyle: { color: cssVar(meta.color.replace('var(', '').replace(')', ''), '#999') },
    }))
    .filter((d) => d.value > 0)
}

function getOption() {
  const data = getCategoryData()
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 番茄 ({d}%)',
    },
    legend: {
      bottom: 0,
      left: 'center',
      textStyle: { color: cssVar('--color-text-secondary', '#606060') },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: cssVar('--color-bg', '#fff'),
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 18, fontWeight: 'bold' },
        },
        labelLine: { show: false },
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
    render()
    window.addEventListener('resize', onResize)
  }
})

// 任务变化（含番茄累加）时刷新
watch(
  () => taskStore.tasks,
  () => render(),
  { deep: true }
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
    <div ref="chartRef" class="chart-canvas"></div>
    <p v-if="!taskStore.tasks.length" class="chart-empty text-tertiary">
      暂无任务数据，完成番茄后这里会展示分类占比
    </p>
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
.chart-empty {
  text-align: center;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
}
</style>
