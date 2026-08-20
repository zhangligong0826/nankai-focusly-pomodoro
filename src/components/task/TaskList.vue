/**
 * 任务列表容器
 * @module components/task/TaskList
 * @description 从 TaskStore 读取 filteredTasks，v-for TaskItem；空状态用 EmptyState + 插画
 */
<script setup>
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskItem from './TaskItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import emptyTaskSvg from '@/assets/images/empty-task.svg'

const props = defineProps({
  list: { type: Array, default: null },
  emptyText: { type: String, default: '还没有任务，点击 + 新建第一个吧' },
})

const emit = defineEmits(['edit', 'delete', 'create'])

const taskStore = useTaskStore()

const tasks = computed(() => (props.list !== null ? props.list : taskStore.filteredTasks))
const isEmpty = computed(() => tasks.value.length === 0)
</script>

<template>
  <div class="task-list">
    <EmptyState v-if="isEmpty" :image="emptyTaskSvg" :text="emptyText">
      <template #action>
        <button class="empty-create" @click="emit('create')">+ 新建任务</button>
      </template>
    </EmptyState>
    <TransitionGroup v-else name="task" tag="ul" class="task-ul">
      <TaskItem
        v-for="t in tasks"
        :key="t.id"
        v-memo="[t.status, t.completedPomodoros, t.priority, t.dueDate]"
        :task="t"
        @edit="(task) => emit('edit', task)"
        @delete="(task) => emit('delete', task)"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.task-ul {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.task-enter-active,
.task-leave-active {
  transition: all var(--transition-base);
}
.task-enter-from,
.task-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
.empty-create {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.empty-create:hover {
  background-color: var(--color-primary-hover);
}
</style>
