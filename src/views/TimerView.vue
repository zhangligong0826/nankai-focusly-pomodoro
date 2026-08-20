/**
 * 计时页（首页）
 * @module views/TimerView
 * @description TimerDisplay + TimerControls + TaskSelector + CheckinCard；
 *   首次进入引导 Notification 授权
 */
<script setup>
import { onMounted } from 'vue'
import { useNotification } from '@/composables/useNotification'
import TimerDisplay from '@/components/timer/TimerDisplay.vue'
import TimerControls from '@/components/timer/TimerControls.vue'
import TaskSelector from '@/components/timer/TaskSelector.vue'
import CheckinCard from '@/components/checkin/CheckinCard.vue'

const notify = useNotification()

onMounted(() => {
  // 首次进入引导通知授权（仅 default 状态且未询问过）
  if (notify.permission() === 'default' && !notify.hasAsked()) {
    // 延迟以避免首次加载立即弹
    setTimeout(() => {
      notify.requestPermission()
    }, 1500)
  }
})
</script>

<template>
  <div class="timer-view">
    <div class="timer-top card">
      <TimerDisplay />
      <div class="timer-controls-area">
        <TimerControls />
      </div>
      <div class="task-selector-area">
        <TaskSelector />
      </div>
    </div>

    <CheckinCard class="checkin-area" />
  </div>
</template>

<style scoped>
.timer-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 640px;
  margin: 0 auto;
}
.timer-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl) var(--spacing-lg);
}
.timer-controls-area {
  margin-top: var(--spacing-sm);
}
.task-selector-area {
  width: 100%;
  display: flex;
  justify-content: center;
}
.checkin-area {
  width: 100%;
}
@media (max-width: 767px) {
  .timer-top {
    padding: var(--spacing-lg) var(--spacing-md);
    gap: var(--spacing-lg);
  }
}
</style>
