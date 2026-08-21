/**
 * 社交页（P3）
 * @module views/SocialView
 * @description 两个 Tab：匿名自习室 / 好友时长榜
 */
<script setup>
import { ref } from 'vue'
import StudyRoom from '@/components/social/StudyRoom.vue'
import FriendRank from '@/components/social/FriendRank.vue'

const activeTab = ref('room')
</script>

<template>
  <div class="social-view">
    <h2 class="page-title">一起专注</h2>

    <div class="chart-tabs" role="tablist" aria-label="社交视图切换">
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'room' }"
        role="tab"
        :aria-selected="activeTab === 'room'"
        @click="activeTab = 'room'"
      >
        匿名自习室
      </button>
      <button
        class="chart-tab"
        :class="{ 'chart-tab--active': activeTab === 'rank' }"
        role="tab"
        :aria-selected="activeTab === 'rank'"
        @click="activeTab = 'rank'"
      >
        好友时长榜
      </button>
    </div>

    <StudyRoom v-if="activeTab === 'room'" />
    <FriendRank v-else />
  </div>
</template>

<style scoped>
.social-view {
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
  white-space: nowrap;
}
.chart-tab--active {
  background-color: var(--color-bg);
  color: var(--color-primary-text);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
</style>
