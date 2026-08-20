/**
 * 统计页
 * @module views/StatsView
 * @description StatsSummary + [本周][本月] Tab + 图表 + StreakBadge；onMounted 并行请求
 */
<script setup>
import { ref, onMounted } from 'vue'
import { useStatsStore } from '@/stores/stats'
import StatsSummary from '@/components/stats/StatsSummary.vue'
import WeeklyChart from '@/components/stats/WeeklyChart.vue'
import MonthlyChart from '@/components/stats/MonthlyChart.vue'
import StreakBadge from '@/components/stats/StreakBadge.vue'

const statsStore = useStatsStore()

const activeTab = ref('weekly')

function switchTab(tab) {
  activeTab.value = tab
  if (tab === 'weekly') statsStore.fetchWeekly()
  else statsStore.fetchMonthly()
}

onMounted(() => {
  // 并行请求 summary + weekly（init 已做，这里确保）
  statsStore.fetchSummary()
  statsStore.fetchWeekly()
})
</script>

<template>
  <div class="stats-view">
    <h2 class="page-title">专注统计</h2>

    <StatsSummary />

    <div class="chart-tabs">
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'weekly' }"
        @click="switchTab('weekly')"
      >
        本周
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'monthly' }"
        @click="switchTab('monthly')"
      >
        本月
      </button>
    </div>

    <WeeklyChart
      v-if="activeTab === 'weekly'"
      :data="statsStore.weeklyData"
      :loading="statsStore.isLoading"
    />
    <MonthlyChart
      v-else
      :data="statsStore.monthlyData"
      :loading="statsStore.isLoading"
    />

    <StreakBadge />
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
  padding: 6px 20px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.chart-tab--active {
  background-color: var(--color-bg);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
</style>
