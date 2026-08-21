/**
 * 统计页
 * @module views/StatsView
 * @description StatsSummary + [本周][本月] Tab + 图表 + StreakBadge；onMounted 并行请求
 */
<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { useCheckinStore } from '@/stores/checkin'
import StatsSummary from '@/components/stats/StatsSummary.vue'
import WeeklyChart from '@/components/stats/WeeklyChart.vue'
import MonthlyChart from '@/components/stats/MonthlyChart.vue'
import CategoryPieChart from '@/components/stats/CategoryPieChart.vue'
import StreakBadge from '@/components/stats/StreakBadge.vue'
import GardenCard from '@/components/garden/GardenCard.vue'
import HeatmapChart from '@/components/stats/HeatmapChart.vue'
import PeakHoursChart from '@/components/stats/PeakHoursChart.vue'
import DailyReport from '@/components/stats/DailyReport.vue'
import YearlyChart from '@/components/stats/YearlyChart.vue'
import WeeklyReport from '@/components/stats/WeeklyReport.vue'
import { exportWeeklyReportPDF } from '@/utils/pdfExport'
import { showToast } from '@/composables/useToast'

const statsStore = useStatsStore()
const checkinStore = useCheckinStore()

const activeTab = ref('weekly')
const weeklyReportRef = ref(null)
const exporting = ref(false)

async function onExportReport() {
  if (exporting.value) return
  exporting.value = true
  showToast('正在生成周报...', 'info', 1500)
  try {
    // 先确保周数据已加载
    await statsStore.fetchWeekly()
    await statsStore.fetchSummary()
    await nextTick()
    // 渲染模板图表
    await weeklyReportRef.value?.renderChart()
    // 等待图表渲染 + 模板绘制完成
    await new Promise((r) => setTimeout(r, 150))
    const el = weeklyReportRef.value?.getEl()
    const ok = await exportWeeklyReportPDF(el)
    if (ok) showToast('周报导出成功', 'success')
    else showToast('周报导出失败，请重试', 'error')
  } catch (e) {
    console.error('[StatsView] 导出周报失败:', e)
    showToast('周报导出失败，请重试', 'error')
  } finally {
    exporting.value = false
  }
}

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'weekly') statsStore.fetchWeekly()
  else if (tab === 'monthly') statsStore.fetchMonthly()
  else if (tab === 'heatmap') {
    statsStore.fetchHeatmap()
    statsStore.fetchPeakHours()
  } else if (tab === 'daily') statsStore.fetchDaily()
  else if (tab === 'yearly') statsStore.fetchYearly()
  // category 不依赖 statsStore，由 CategoryPieChart 自行读取 taskStore
}

onMounted(() => {
  // 并行请求 summary + weekly（init 已做，这里确保）
  statsStore.fetchSummary()
  statsStore.fetchWeekly()
})

// 计时器跨路由持续运行；统计页停留期间也应在新的打卡产生后刷新。
watch(
  () => checkinStore.checkins,
  () => {
    statsStore.fetchSummary()
    if (activeTab.value === 'weekly') statsStore.fetchWeekly()
    else statsStore.fetchMonthly()
  },
  { deep: true }
)
</script>

<template>
  <div class="stats-view">
    <div class="page-header">
      <h2 class="page-title">专注统计</h2>
      <button class="export-btn" :disabled="exporting" @click="onExportReport">
        {{ exporting ? '生成中...' : '导出周报' }}
      </button>
    </div>

    <StatsSummary />

    <div class="chart-tabs" role="tablist" aria-label="统计图表切换">
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'daily' }"
        role="tab"
        :aria-selected="activeTab === 'daily'"
        @click="switchTab('daily')"
      >
        日报
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'weekly' }"
        role="tab"
        :aria-selected="activeTab === 'weekly'"
        @click="switchTab('weekly')"
      >
        本周
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'monthly' }"
        role="tab"
        :aria-selected="activeTab === 'monthly'"
        @click="switchTab('monthly')"
      >
        本月
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'yearly' }"
        role="tab"
        :aria-selected="activeTab === 'yearly'"
        @click="switchTab('yearly')"
      >
        年报
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'category' }"
        role="tab"
        :aria-selected="activeTab === 'category'"
        @click="switchTab('category')"
      >
        分类占比
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'heatmap' }"
        role="tab"
        :aria-selected="activeTab === 'heatmap'"
        @click="switchTab('heatmap')"
      >
        热力图
      </button>
    </div>

    <DailyReport v-if="activeTab === 'daily'" />
    <WeeklyChart
      v-else-if="activeTab === 'weekly'"
      :data="statsStore.weeklyData"
      :loading="statsStore.isLoading"
    />
    <MonthlyChart
      v-else-if="activeTab === 'monthly'"
      :data="statsStore.monthlyData"
      :loading="statsStore.isLoading"
    />
    <YearlyChart v-else-if="activeTab === 'yearly'" />
    <CategoryPieChart v-else-if="activeTab === 'category'" />
    <template v-else>
      <HeatmapChart />
      <PeakHoursChart />
    </template>

    <StreakBadge />

    <GardenCard />

    <!-- 周报 PDF 模板（隐藏，导出时截图） -->
    <WeeklyReport ref="weeklyReportRef" :visible="exporting" />
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 960px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}
.export-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  min-height: 36px;
  border-radius: var(--radius-md);
  background-color: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: opacity var(--transition-fast);
}
.export-btn:hover:not(:disabled) {
  opacity: 0.9;
}
.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.chart-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  background-color: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
  width: fit-content;
  max-width: 100%;
}
.chart-tab {
  padding: var(--spacing-sm) 16px;
  min-height: 36px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.chart-tab--active {
  background-color: var(--color-bg);
  color: var(--color-primary-text);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
/* 触屏设备放大命中区 */
@media (pointer: coarse) {
  .chart-tab {
    min-height: var(--touch-target-min);
  }
}
</style>
