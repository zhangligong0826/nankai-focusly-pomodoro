/**
 * 计时控制按钮组
 * @module components/timer/TimerControls
 * @description idle→[开始]，running→[暂停][重置][跳过]，paused→[继续][重置]
 */
<script setup>
import { computed } from 'vue'
import { useTimerStore } from '@/stores/timer'
import BaseButton from '@/components/common/BaseButton.vue'
import { TIMER_STATUS } from '@/utils/constants'

const store = useTimerStore()

const status = computed(() => store.status)
const IDLE = TIMER_STATUS.IDLE
const RUNNING = TIMER_STATUS.RUNNING
const PAUSED = TIMER_STATUS.PAUSED
</script>

<template>
  <div class="timer-controls">
    <template v-if="status === IDLE">
      <BaseButton type="primary" size="lg" @click="store.start()">开始专注</BaseButton>
    </template>
    <template v-else-if="status === RUNNING">
      <BaseButton type="secondary" size="lg" @click="store.pause()">暂停</BaseButton>
      <BaseButton type="ghost" size="lg" @click="store.reset()">重置</BaseButton>
      <BaseButton type="ghost" size="lg" @click="store.skip()">跳过</BaseButton>
    </template>
    <template v-else-if="status === PAUSED">
      <BaseButton type="primary" size="lg" @click="store.resume()">继续</BaseButton>
      <BaseButton type="ghost" size="lg" @click="store.reset()">重置</BaseButton>
    </template>
  </div>
</template>

<style scoped>
.timer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
</style>
