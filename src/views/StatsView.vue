/**
 * 统计页
 * @module views/StatsView
 * @description StatsSummary + [本周][本月] Tab + 图表 + StreakBadge；onMounted 并行请求
 */
<script setup>
import { ref, onMounted, watch } from 'vue'
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

const statsStore = useStatsStore()
const checkinStore = useCheckinStore()

const activeTab = ref('weekly')

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'weekly') statsStore.fetchWeekly()
  else if (tab === 'monthly') statsStore.fetchMonthly()
  else if (tab === 'heatmap') {
    statsStore.fetchHeatmap()
    statsStore.fetchPeakHours()
  }
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
    <h2 class="page-title">专注统计</h2>

    <StatsSummary />

    <div class="chart-tabs" role="tablist" aria-label="统计图表切换">
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

    <WeeklyChart
      v-if="activeTab === 'weekly'"
      :data="statsStore.weeklyData"
      :loading="statsStore.isLoading"
    />
    <MonthlyChart
      v-else-if="activeTab === 'monthly'"
      :data="statsStore.monthlyData"
      :loading="statsStore.isLoading"
    />
    <CategoryPieChart v-else-if="activeTab === 'category'" />
    <template v-else>
      <HeatmapChart />
      <PeakHoursChart />
    </template>

    <StreakBadge />

    <GardenCard />
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
.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}
.chart-tabs {
  display: flex;
  gap: var(--spacing-xs);
  background-color: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
  width: fit-content;
}
.chart-tab {
  padding: var(--spacing-sm) 20px;
  min-height: 36px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
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
