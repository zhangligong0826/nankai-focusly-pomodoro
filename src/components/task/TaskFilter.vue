/**
 * 任务筛选器
 * @module components/task/TaskFilter
 * @description Tab 切换（全部/待办/进行中/已完成），更新 store.filter
 */
<script setup>
import { useTaskStore } from '@/stores/task'
import { TASK_STATUS } from '@/utils/constants'

const taskStore = useTaskStore()

const tabs = [
  { key: 'all', label: '全部' },
  { key: TASK_STATUS.TODO, label: '待办' },
  { key: TASK_STATUS.DOING, label: '进行中' },
  { key: TASK_STATUS.DONE, label: '已完成' },
]
</script>

<template>
  <div class="task-filter">
    <button
      v-for="t in tabs"
      :key="t.key"
      class="filter-tab"
      :class="{ 'filter-tab--active': taskStore.filter === t.key }"
      @click="taskStore.setFilter(t.key)"
    >
      {{ t.label }}
    </button>
  </div>
</template>

<style scoped>
.task-filter {
  display: flex;
  gap: var(--spacing-xs);
  background-color: var(--color-bg-secondary);
  padding: 4px;
  border-radius: var(--radius-md);
  width: fit-content;
}
.filter-tab {
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.filter-tab:hover {
  color: var(--color-text);
}
.filter-tab--active {
  background-color: var(--color-bg);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}
</style>
