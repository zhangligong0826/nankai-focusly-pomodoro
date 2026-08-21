/**
 * 匿名自习室陪学（P3-1）
 * @module components/social/StudyRoom
 * @description peer 卡片网格 + 我的卡片 + 加入/退出按钮；纯前端模拟实时变化
 */
<script setup>
import { onMounted } from 'vue'
import { useSocialStore } from '@/stores/social'
import { minutesToChinese } from '@/utils/format'
import BaseButton from '@/components/common/BaseButton.vue'

const social = useSocialStore()

onMounted(() => {
  social.init()
})
</script>

<template>
  <div class="study-room">
    <div class="room-header card">
      <div>
        <h3 class="room-title">匿名自习室</h3>
        <p class="room-desc text-tertiary">和 {{ social.peers.length }} 位同学一起专注，互相监督</p>
      </div>
      <BaseButton
        v-if="!social.isRoomJoined"
        type="primary"
        @click="social.joinRoom()"
      >
        加入自习室
      </BaseButton>
      <BaseButton v-else type="secondary" @click="social.leaveRoom()">
        离开
      </BaseButton>
    </div>

    <div v-if="social.isRoomJoined" class="room-status text-tertiary">
      <span class="status-dot" aria-hidden="true"></span> 已加入，专注时长实时同步中…
    </div>

    <div class="peer-grid">
      <!-- 我的卡片 -->
      <div class="peer-card card peer-card--me">
        <div class="peer-avatar" aria-hidden="true">⭐</div>
        <div class="peer-info">
          <div class="peer-name">我</div>
          <div class="peer-goal">专注进行中</div>
        </div>
        <div class="peer-minutes tnum">{{ minutesToChinese(social.myMinutes) }}</div>
      </div>

      <!-- 他人卡片 -->
      <div v-for="p in social.peers" :key="p.id" class="peer-card card">
        <div class="peer-avatar" aria-hidden="true">{{ p.avatar }}</div>
        <div class="peer-info">
          <div class="peer-name">{{ p.name }}</div>
          <div class="peer-goal">{{ p.goal }}</div>
        </div>
        <div class="peer-meta">
          <span class="peer-minutes tnum">{{ minutesToChinese(p.focusMinutes) }}</span>
          <span v-if="p.studying" class="peer-state peer-state--on" aria-label="专注中">专注中</span>
          <span v-else class="peer-state" aria-label="休息中">休息</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.study-room {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
}
.room-title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}
.room-desc {
  font-size: var(--font-size-sm);
  margin-top: 2px;
}
.room-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-success);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.peer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-sm);
}
.peer-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}
.peer-card--me {
  border: 1px solid var(--color-primary);
}
.peer-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border-radius: 50%;
  background-color: var(--color-bg-secondary);
}
.peer-info {
  flex: 1;
  min-width: 0;
}
.peer-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}
.peer-goal {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.peer-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.peer-minutes {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.peer-state {
  font-size: 10px;
  color: var(--color-text-tertiary);
}
.peer-state--on {
  color: var(--color-success-text);
}
</style>
