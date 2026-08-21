/**
 * 任务 Store
 * @module stores/task
 * @description 任务 CRUD + 状态切换 + 番茄累加 + 筛选/分组 getter
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import taskApi from '@/api/task'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import { generateUUID } from '@/utils/uuid'
import { getTodayStr } from '@/utils/date'
import { groupTasks, filterTasks } from '@/utils/task'
import {
  LS_KEY,
  TASK_STATUS,
  PRIORITY,
  PRIORITY_META,
} from '@/utils/constants'
import type { Task, TaskStatus, Priority, TaskCategory } from '@/types'

/** 新增任务 payload */
export interface AddTaskPayload {
  title: string
  note?: string
  plannedPomodoros?: number
  category?: TaskCategory
  priority?: Priority
  dueDate?: string | null
}

export const useTaskStore = defineStore('task', () => {
  const storage = useLocalStorage()

  /** 全部任务 */
  const tasks = ref<Task[]>([])
  /** 筛选条件 */
  const filter = ref('all')
  /** 排序方式 */
  const sortBy = ref('priority')
  /** 视图模式：list / group */
  const viewMode = ref('list')
  /** 是否已初始化 */
  const inited = ref(false)

  /** 按 id 获取任务 */
  function getTaskById(id: string): Task | undefined {
    return tasks.value.find((t) => t.id === id)
  }

  /** 筛选后的任务列表（按筛选条件 + 排序） */
  const filteredTasks = computed(() => {
    const list = filterTasks(tasks.value as unknown as import('@/utils/task').TaskLike[], filter.value)
    return [...list].sort((a, b) => {
      const aDone = a.status === TASK_STATUS.DONE ? 1 : 0
      const bDone = b.status === TASK_STATUS.DONE ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      const aw = (PRIORITY_META[a.priority as keyof typeof PRIORITY_META] || PRIORITY_META[PRIORITY.MEDIUM as keyof typeof PRIORITY_META]).weight
      const bw = (PRIORITY_META[b.priority as keyof typeof PRIORITY_META] || PRIORITY_META[PRIORITY.MEDIUM as keyof typeof PRIORITY_META]).weight
      if (aw !== bw) return aw - bw
      return (b.createdAt || 0) - (a.createdAt || 0)
    })
  })

  /** 按日期分组（P1-3） */
  const groupedTasks = computed(() => {
    return groupTasks(tasks.value as unknown as import('@/utils/task').TaskLike[], filter.value)
  })

  /** 今日截止且未完成的任务 */
  const todayTasks = computed(() => {
    const today = getTodayStr()
    return tasks.value.filter(
      (t) => t.status !== TASK_STATUS.DONE && t.dueDate === today
    )
  })

  /** 初始化：LS 优先 → API 刷新 */
  async function init() {
    const cached = storage.getItem(LS_KEY.TASKS, []) as Task[]
    if (Array.isArray(cached) && cached.length) {
      tasks.value = cached
    }
    try {
      const res = await taskApi.getTasks({ pageSize: 200 })
      const list = ((res && res.list) || []) as Task[]
      if ((!cached || cached.length === 0) && list.length) {
        tasks.value = list
        storage.setItem(LS_KEY.TASKS, tasks.value)
      }
    } catch (_) {
      /* LS 已加载 */
    }
    inited.value = true
  }

  /** 持久化任务到 LS */
  function persist() {
    storage.setItem(LS_KEY.TASKS, tasks.value)
  }

  /** 新增任务 */
  async function addTask(payload: AddTaskPayload): Promise<Task> {
    const now = Date.now()
    const base: Task = {
      id: generateUUID(),
      title: (payload.title || '').trim(),
      note: (payload.note || '').trim(),
      status: TASK_STATUS.TODO as TaskStatus,
      plannedPomodoros: Math.max(1, Number(payload.plannedPomodoros) || 1),
      completedPomodoros: 0,
      category: (payload.category || 'other') as TaskCategory,
      priority: (payload.priority || PRIORITY.MEDIUM) as Priority,
      dueDate: payload.dueDate || null,
      createdAt: now,
      updatedAt: now,
      finishedAt: null,
    }
    try {
      const created = (await taskApi.createTask(base as unknown as Record<string, unknown>)) as Task
      tasks.value.unshift(created)
      persist()
      showToast('任务创建成功', 'success')
      return created
    } catch (_) {
      tasks.value.unshift(base)
      persist()
      showToast('网络异常，已离线保存', 'warning')
      return base
    }
  }

  /** 更新任务（部分字段） */
  async function updateTask(id: string, payload: Partial<Task>): Promise<void> {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    const updated: Task = {
      ...tasks.value[idx],
      ...payload,
      updatedAt: Date.now(),
    }
    if (payload.status === TASK_STATUS.DONE && !tasks.value[idx].finishedAt) {
      updated.finishedAt = Date.now()
    }
    if (payload.status && payload.status !== TASK_STATUS.DONE) {
      updated.finishedAt = null
    }
    tasks.value[idx] = updated
    persist()
    try {
      await taskApi.updateTask(id, payload)
    } catch (_) {
      showToast('网络异常，已离线保存', 'warning')
    }
  }

  /** 删除任务 */
  async function deleteTask(id: string): Promise<void> {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    tasks.value.splice(idx, 1)
    persist()
    try {
      await taskApi.deleteTask(id)
      showToast('任务已删除', 'success')
    } catch (_) {
      showToast('网络异常，已离线删除', 'warning')
    }
  }

  /** 切换任务状态 todo <-> done（doing → done） */
  function toggleStatus(id: string) {
    const t = getTaskById(id)
    if (!t) return
    const next = t.status === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE
    updateTask(id, {
      status: next as TaskStatus,
      finishedAt: next === TASK_STATUS.DONE ? Date.now() : null,
    })
  }

  /** 已消耗番茄数 +1 */
  async function incrementPomodoro(id: string): Promise<void> {
    const t = getTaskById(id)
    if (!t) return
    const next = (t.completedPomodoros || 0) + 1
    const patch: Partial<Task> = { completedPomodoros: next }
    if (t.status === TASK_STATUS.TODO) patch.status = TASK_STATUS.DOING as TaskStatus
    if (next >= t.plannedPomodoros) patch.status = TASK_STATUS.DONE as TaskStatus
    if (patch.status === TASK_STATUS.DONE) patch.finishedAt = Date.now()
    await updateTask(id, patch)
  }

  function setFilter(f: string) {
    filter.value = f
  }
  function setSortBy(s: string) {
    sortBy.value = s
  }
  function setViewMode(m: string) {
    viewMode.value = m
  }

  return {
    tasks,
    filter,
    sortBy,
    viewMode,
    inited,
    filteredTasks,
    groupedTasks,
    todayTasks,
    getTaskById,
    init,
    addTask,
    updateTask,
    deleteTask,
    toggleStatus,
    incrementPomodoro,
    setFilter,
    setSortBy,
    setViewMode,
  }
})

export default useTaskStore
