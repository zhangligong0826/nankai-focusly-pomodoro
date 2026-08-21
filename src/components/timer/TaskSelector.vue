/**
 * 当前任务下拉选择
 * @module components/timer/TaskSelector
 * @description v-model 绑定 boundTaskId，显示标题 + 已完成/计划番茄数；计时中锁定
 */
<script setup>
import { computed } from 'vue'
import { useTimerStore } from '@/stores/timer'
import { useTaskStore } from '@/stores/task'
import { TIMER_STATUS, TASK_STATUS } from '@/utils/constants'

const timerStore = useTimerStore()
const taskStore = useTaskStore()

/** 可选任务：未完成 */
const selectableTasks = computed(() =>
  taskStore.tasks.filter((t) => t.status !== TASK_STATUS.DONE)
)

const isLocked = computed(() => timerStore.status === TIMER_STATUS.RUNNING)

const selectedId = computed({
  get: () => timerStore.boundTaskId,
  set: (v) => timerStore.bindTask(v),
})
</script>

<template>
  <div class="task-selector">
    <label class="selector-label" for="current-task-select">当前任务</label>
    <select
      id="current-task-select"
      v-model="selectedId"
      class="selector-select"
      :disabled="isLocked"
    >
      <option :value="null">不绑定任务</option>
      <option v-for="t in selectableTasks" :key="t.id" :value="t.id">
        {{ t.title }}（{{ t.completedPomodoros }}/{{ t.plannedPomodoros }} 🍅）
      </option>
    </select>
    <span v-if="isLocked" class="lock-hint text-tertiary">计时中不可切换</span>
  </div>
</template>

<style scoped>
.task-selector {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.selector-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.selector-select {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  color: var(--color-text);
  cursor: pointer;
  min-width: 240px;
}
.selector-select:disabled {
  background-color: var(--color-bg-secondary);
  cursor: not-allowed;
  opacity: 0.7;
}
.selector-select:focus-visible {
  border-color: var(--color-primary);
}
.lock-hint {
  font-size: var(--font-size-xs);
}
</style>
