/**
 * 单个任务行
 * @module components/task/TaskItem
 * @description 复选框 + 标题 + 备注 + 番茄数 + 分类标签 + 优先级色条 + 编辑/删除；
 *   整行可点击编辑（行内按钮 stop 冒泡）；已完成划线淡出；emit edit/delete
 */
<script setup>
import { computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import { useSettingsStore } from '@/stores/settings'
import { CATEGORY_META, PRIORITY_META, TASK_STATUS } from '@/utils/constants'
import { relativeDayLabel } from '@/utils/date'
import { minutesToChinese } from '@/utils/format'

const props = defineProps({
  task: { type: Object, required: true },
})

const emit = defineEmits(['edit', 'delete'])

const taskStore = useTaskStore()
const settingsStore = useSettingsStore()

const isDone = computed(() => props.task.status === TASK_STATUS.DONE)
const isDoing = computed(() => props.task.status === TASK_STATUS.DOING)

const categoryMeta = computed(
  () => CATEGORY_META[props.task.category] || CATEGORY_META.other
)
const priorityMeta = computed(
  () => PRIORITY_META[props.task.priority] || PRIORITY_META.medium
)

/** 预估完成时间（P1-4）：剩余番茄数 × 单番茄时长 */
const estimateMinutes = computed(() => {
  const planned = props.task.plannedPomodoros || 1
  const done = props.task.completedPomodoros || 0
  const remaining = Math.max(0, planned - done)
  const focus = settingsStore.config.focusDuration || 25
  return remaining * focus
})


function toggle() {
  taskStore.toggleStatus(props.task.id)
}
function onEdit() {
  emit('edit', props.task)
}
function onDelete() {
  emit('delete', props.task)
}
</script>

<template>
  <li
    class="task-item"
    :class="{ 'is-done': isDone }"
    @click="onEdit"
  >
    <div class="priority-bar" :style="{ backgroundColor: priorityMeta.color }"></div>

    <button
      class="task-checkbox"
      :class="{ 'is-checked': isDone, 'is-doing': isDoing }"
      :aria-label="isDone ? `标记「${task.title}」为待办` : `标记「${task.title}」为完成`"
      :aria-pressed="isDone"
      @click.stop="toggle"
    >
      <svg v-if="isDone" class="check-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <div class="task-main">
      <div class="task-title-row">
        <span class="task-title">{{ task.title }}</span>
        <span class="task-due" v-if="task.dueDate"><span aria-hidden="true">📅</span> {{ relativeDayLabel(task.dueDate) }}</span>
      </div>
      <p class="task-note" v-if="task.note">{{ task.note }}</p>
      <div class="task-meta">
        <span class="tag tag-category" :style="{ color: categoryMeta.color, borderColor: categoryMeta.color }">
          {{ categoryMeta.label }}
        </span>
        <span class="tag tag-priority" :style="{ color: priorityMeta.color }">
          {{ priorityMeta.label }}优先级
        </span>
        <span class="pomodoro-count tnum">
          {{ task.completedPomodoros || 0 }}/{{ task.plannedPomodoros || 1 }} <span aria-hidden="true">🍅</span>
        </span>
        <span v-if="!isDone" class="estimate" title="预计还需专注时长">
          <span aria-hidden="true">⏱</span> 约 {{ minutesToChinese(estimateMinutes) }}
        </span>
      </div>
    </div>

    <div class="task-actions">
      <button class="icon-btn" aria-label="编辑" @click.stop="onEdit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <button class="icon-btn icon-btn--danger" aria-label="删除" @click.stop="onDelete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  </li>
</template>

<style scoped>
.task-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-12);
  padding: var(--spacing-12) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  cursor: pointer;
  transition: opacity var(--transition-base), background-color var(--transition-fast);
}
.task-item:hover {
  background-color: var(--color-bg-secondary);
}
.priority-bar {
  width: 3px;
  align-self: stretch;
  border-radius: var(--radius-full);
  min-height: 24px;
  margin-top: 2px;
}
.task-checkbox {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-fast);
}
.task-checkbox:hover {
  border-color: var(--color-primary);
}
.task-checkbox.is-checked {
  background-color: var(--color-success-text);
  border-color: var(--color-success-text);
  color: #fff;
}
.task-checkbox.is-doing {
  border-color: var(--color-warning);
}
/* 勾选入场动画：勾号缩放弹出 */
.check-icon {
  animation: check-pop 0.2s ease;
}
@keyframes check-pop {
  0% { transform: scale(0.4); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.task-main {
  flex: 1;
  min-width: 0;
}
.task-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.task-title {
  font-size: var(--font-size-md);
  color: var(--color-text);
  word-break: break-word;
}
.task-due {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
.task-note {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
  word-break: break-word;
}
.task-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
  flex-wrap: wrap;
}
.tag {
  font-size: var(--font-size-xs);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  border: 1px solid;
}
.tag-category {
  background-color: transparent;
}
.tag-priority {
  border: none;
}
.pomodoro-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
.estimate {
  font-size: var(--font-size-xs);
  color: var(--color-info-text);
}
.task-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 触控目标 ≥44px（图标本身 16px，padding 扩展命中区） */
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  margin: calc((var(--touch-target-min) - 28px) / -2); /* 视觉尺寸仍 28px，不占行高 */
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}
.icon-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text);
}
.icon-btn--danger:hover {
  color: var(--color-error);
  background-color: var(--color-error-light);
}
.is-done .task-title {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}
.is-done {
  opacity: 0.7;
}
/* PC 端精细指针下保持紧凑布局 */
@media (hover: hover) and (pointer: fine) {
  .icon-btn {
    width: 32px;
    height: 32px;
    margin: -2px;
  }
}
</style>
