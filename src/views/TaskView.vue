/**
 * 任务页
 * @module views/TaskView
 * @description TaskFilter + 视图切换 + 新建按钮 + TaskList/TaskGroup + TaskForm + 删除确认
 */
<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import TaskFilter from '@/components/task/TaskFilter.vue'
import TaskList from '@/components/task/TaskList.vue'
import TaskGroup from '@/components/task/TaskGroup.vue'
import TaskForm from '@/components/task/TaskForm.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import emptyTaskSvg from '@/assets/images/empty-task.svg'

const taskStore = useTaskStore()

const formVisible = ref(false)
const editingTask = ref(null)
const deleteTarget = ref(null)

const isGroupView = computed(() => taskStore.viewMode === 'group')
const groups = computed(() => taskStore.groupedTasks)

function openCreate() {
  editingTask.value = null
  formVisible.value = true
}
function openEdit(task) {
  editingTask.value = task
  formVisible.value = true
}
function onFormClose() {
  formVisible.value = false
  editingTask.value = null
}
function confirmDelete(task) {
  deleteTarget.value = task
}
function doDelete() {
  if (deleteTarget.value) {
    taskStore.deleteTask(deleteTarget.value.id)
  }
  deleteTarget.value = null
}
function toggleView() {
  taskStore.setViewMode(isGroupView.value ? 'list' : 'group')
}
</script>

<template>
  <div class="task-view">
    <div class="task-toolbar">
      <h2 class="page-title">学习任务</h2>
      <div class="toolbar-actions">
        <button class="view-toggle" @click="toggleView">
          {{ isGroupView ? '列表视图' : '分组视图' }}
        </button>
        <BaseButton type="primary" @click="openCreate">+ 新建任务</BaseButton>
      </div>
    </div>

    <TaskFilter />

    <div class="task-content">
      <template v-if="isGroupView">
        <TaskGroup
          v-for="g in groups"
          :key="g.key"
          :group="g"
          @edit="openEdit"
          @delete="confirmDelete"
        />
        <EmptyState
          v-if="groups.length === 0"
          :image="emptyTaskSvg"
          text="还没有任务，点击 + 新建第一个吧"
          action-text="+ 新建任务"
          @action="openCreate"
        />
      </template>
      <template v-else>
        <TaskList
          @edit="openEdit"
          @delete="confirmDelete"
          @create="openCreate"
        />
      </template>
    </div>

    <TaskForm
      :visible="formVisible"
      :task="editingTask"
      @close="onFormClose"
    />

    <ConfirmDialog
      :visible="!!deleteTarget"
      title="删除任务"
      :message="`确定删除「${deleteTarget?.title || ''}」吗？此操作不可恢复。`"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="doDelete"
    />
  </div>
</template>

<style scoped>
.task-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 760px;
  margin: 0 auto;
}
.task-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.view-toggle {
  padding: var(--spacing-xs) var(--spacing-md);
  min-height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background-color: var(--color-bg);
  transition: all var(--transition-fast);
}
.view-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-text);
}
/* 触屏设备放大命中区 */
@media (pointer: coarse) {
  .view-toggle {
    min-height: var(--touch-target-min);
  }
}
.task-content {
  min-height: 200px;
}
</style>
