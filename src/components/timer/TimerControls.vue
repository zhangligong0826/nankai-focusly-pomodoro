/**
 * 计时控制按钮组
 * @module components/timer/TimerControls
 * @description idle→[开始专注（先弹意图）]，running→[暂停][重置][跳过]，paused→[继续][重置]
 */
<script setup>
import { ref, computed } from 'vue'
import { useTimerStore } from '@/stores/timer'
import BaseButton from '@/components/common/BaseButton.vue'
import IntentDialog from './IntentDialog.vue'
import { TIMER_STATUS } from '@/utils/constants'

const store = useTimerStore()

const status = computed(() => store.status)
const IDLE = TIMER_STATUS.IDLE
const RUNNING = TIMER_STATUS.RUNNING
const PAUSED = TIMER_STATUS.PAUSED

const showIntent = ref(false)

function onClickStart() {
  showIntent.value = true
}
function onConfirmIntent(intentText) {
  showIntent.value = false
  store.start(intentText)
}
</script>

<template>
  <div class="timer-controls">
    <template v-if="status === IDLE">
      <BaseButton type="primary" size="lg" @click="onClickStart">开始专注</BaseButton>
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

    <IntentDialog
      :visible="showIntent"
      @close="showIntent = false"
      @confirm="onConfirmIntent"
    />
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
