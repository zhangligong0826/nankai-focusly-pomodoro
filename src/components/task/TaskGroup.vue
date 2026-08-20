/**
 * 按日期分组容器（P1-3）
 * @module components/task/TaskGroup
 * @description 标题（今日/明日/未来/已完成）+ 内嵌 TaskItem 列表
 */
<script setup>
import TaskItem from './TaskItem.vue'

defineProps({
  group: { type: Object, required: true }, // { key, label, tasks }
})
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="task-group">
    <div class="group-header">
      <span class="group-label">{{ group.label }}</span>
      <span class="group-count">{{ group.tasks.length }}</span>
    </div>
    <ul class="group-list">
      <TaskItem
        v-for="t in group.tasks"
        :key="t.id"
        :task="t"
        @edit="(task) => emit('edit', task)"
        @delete="(task) => emit('delete', task)"
      />
    </ul>
  </div>
</template>

<style scoped>
.task-group {
  margin-bottom: var(--spacing-lg);
}
.group-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  padding: 0 var(--spacing-xs);
}
.group-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}
.group-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background-color: var(--color-bg-secondary);
  padding: 0 6px;
  border-radius: var(--radius-full);
}
.group-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
