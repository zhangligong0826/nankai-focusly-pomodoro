/**
 * 大字号倒计时显示
 * @module components/timer/TimerDisplay
 * @description 组合 CircularProgress + MM:SS + 模式标签 + 轮次指示；颜色随模式变化
 */
<script setup>
import { ref, computed } from 'vue'
import { useTimerEngine } from '@/composables/useTimerEngine'
import { useTaskStore } from '@/stores/task'
import { useFocusLock } from '@/composables/useFocusLock'
import CircularProgress from './CircularProgress.vue'
import { useResponsive } from '@/composables/useResponsive'

const { store, displayTime, modeLabel, modeColor, progress } = useTimerEngine()
const taskStore = useTaskStore()
const { isMobile } = useResponsive()
const { emergencyPause } = useFocusLock()

const ringSize = computed(() => (isMobile.value ? 220 : 280))

const boundTask = computed(() =>
  store.boundTaskId ? taskStore.getTaskById(store.boundTaskId) : null
)

const roundDots = computed(() => {
  const total = store.totalRounds || 4
  return Array.from({ length: total }, (_, i) => i + 1)
})

// 长按 3 秒紧急暂停
let pressTimer = null
function startPress() {
  pressTimer = setTimeout(() => {
    emergencyPause()
  }, 3000)
}
function endPress() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}
</script>

<template>
  <div class="timer-display" @touchstart.passive="startPress" @touchend="endPress" @mousedown="startPress" @mouseup="endPress" @mouseleave="endPress">
    <div class="ring-wrapper">
      <CircularProgress
        :progress="progress"
        :size="ringSize"
        :color="modeColor"
      />
      <div class="ring-center">
        <div class="time-text" :style="{ color: modeColor }" role="timer" aria-live="off">{{ displayTime }}</div>
        <div class="mode-label" aria-live="polite">{{ modeLabel }}</div>
      </div>
    </div>

    <div
      class="round-indicator"
      v-if="store.mode === 'focus'"
      role="group"
      :aria-label="`当前第 ${store.currentRound} 轮，共 ${store.totalRounds || 4} 轮`"
    >
      <span
        v-for="n in roundDots"
        :key="n"
        class="round-dot"
        :class="{ 'round-dot--active': n <= store.currentRound, 'round-dot--current': n === store.currentRound }"
      ></span>
    </div>

    <div class="bound-task" v-if="boundTask">
      <span class="bound-task-title">{{ boundTask.title }}</span>
      <span class="bound-task-count">{{ boundTask.completedPomodoros }}/{{ boundTask.plannedPomodoros }} 🍅</span>
    </div>
    <div class="bound-task bound-task--empty" v-else>
      <span>未绑定任务</span>
    </div>

    <p class="longpress-hint text-tertiary">长按计时器 3 秒可紧急暂停</p>
  </div>
</template>

<style scoped>
.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  user-select: none;
}
.ring-wrapper {
  position: relative;
  display: inline-flex;
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.time-text {
  font-size: var(--font-size-timer);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.mode-label {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
}
.round-indicator {
  display: flex;
  gap: var(--spacing-sm);
}
.round-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-border);
  transition: background-color var(--transition-fast);
}
.round-dot--active {
  background-color: var(--color-primary);
}
.round-dot--current {
  transform: scale(1.4);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.bound-task {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
}
.bound-task-title {
  color: var(--color-text);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.bound-task-count {
  color: var(--color-text-tertiary);
}
.bound-task--empty {
  color: var(--color-text-tertiary);
}
.longpress-hint {
  font-size: var(--font-size-xs);
}
</style>
