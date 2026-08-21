/**
 * 好友专注时长榜（P3-2）
 * @module components/social/FriendRank
 * @description 本周专注时长排行，前三奖牌，高亮「我」
 */
<script setup>
import { onMounted, computed } from 'vue'
import { useSocialStore } from '@/stores/social'
import { minutesToChinese } from '@/utils/format'

const social = useSocialStore()

const rankMedals = ['🥇', '🥈', '🥉']

const list = computed(() => social.leaderboard)

onMounted(() => {
  social.init()
})
</script>

<template>
  <div class="friend-rank card">
    <div class="rank-header">
      <h3 class="rank-title">好友专注时长榜</h3>
      <span class="rank-sub text-tertiary">本周</span>
    </div>
    <ul class="rank-list">
      <li
        v-for="(f, i) in list"
        :key="f.id"
        class="rank-item"
        :class="{ 'rank-item--me': f.isMe }"
      >
        <span class="rank-index">
          <span v-if="i < 3" class="rank-medal" aria-hidden="true">{{ rankMedals[i] }}</span>
          <span v-else class="rank-num tnum">{{ i + 1 }}</span>
        </span>
        <span class="rank-avatar" aria-hidden="true">{{ f.avatar }}</span>
        <span class="rank-name">{{ f.name }}</span>
        <span class="rank-minutes tnum">{{ minutesToChinese(f.weeklyMinutes) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.friend-rank {
  padding: var(--spacing-md) var(--spacing-lg);
}
.rank-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}
.rank-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}
.rank-sub {
  font-size: var(--font-size-sm);
}
.rank-list {
  display: flex;
  flex-direction: column;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border-light);
}
.rank-item:last-child {
  border-bottom: none;
}
.rank-item--me {
  background-color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  padding-left: var(--spacing-sm);
  padding-right: var(--spacing-sm);
}
.rank-index {
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}
.rank-medal {
  font-size: 18px;
}
.rank-num {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}
.rank-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 50%;
  background-color: var(--color-bg-secondary);
}
.rank-name {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text);
}
.rank-minutes {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary-text);
}
</style>
