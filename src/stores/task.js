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
import { groupTasks } from '@/utils/task'
import {
  LS_KEY,
  TASK_STATUS,
  PRIORITY,
  PRIORITY_META,
} from '@/utils/constants'

export const useTaskStore = defineStore('task', () => {
  const storage = useLocalStorage()

  /** 全部任务 */
  const tasks = ref([])
  /** 筛选条件 */
  const filter = ref('all')
  /** 排序方式 */
  const sortBy = ref('priority')
  /** 视图模式：list / group */
  const viewMode = ref('list')
  /** 是否已初始化 */
  const inited = ref(false)

  /**
   * 按 id 获取任务
   * @param {string} id
   * @returns {object|undefined}
   */
  function getTaskById(id) {
    return tasks.value.find((t) => t.id === id)
  }

  /**
   * 筛选后的任务列表（按筛选条件 + 排序）
   */
  const filteredTasks = computed(() => {
    let list = tasks.value
    if (filter.value !== 'all') {
      list = list.filter((t) => t.status === filter.value)
    }
    // 排序：未完成优先 → 优先级权重 → 创建时间倒序
    return [...list].sort((a, b) => {
      // 已完成排后
      const aDone = a.status === TASK_STATUS.DONE ? 1 : 0
      const bDone = b.status === TASK_STATUS.DONE ? 1 : 0
      if (aDone !== bDone) return aDone - bDone
      // 优先级权重
      const aw = (PRIORITY_META[a.priority] || PRIORITY_META[PRIORITY.MEDIUM]).weight
      const bw = (PRIORITY_META[b.priority] || PRIORITY_META[PRIORITY.MEDIUM]).weight
      if (aw !== bw) return aw - bw
      // 创建时间倒序
      return b.createdAt - a.createdAt
    })
  })

  /**
   * 按日期分组（P1-3）
   * @returns {Array<{key:string,label:string,tasks:object[]}>}
   */
  const groupedTasks = computed(() => {
    return groupTasks(tasks.value, filter.value)
  })

  /**
   * 今日截止且未完成的任务
   */
  const todayTasks = computed(() => {
    const today = getTodayStr()
    return tasks.value.filter(
      (t) => t.status !== TASK_STATUS.DONE && t.dueDate === today
    )
  })

  /**
   * 初始化：LS 优先 → API 刷新
   */
  async function init() {
    const cached = storage.getItem(LS_KEY.TASKS, [])
    if (Array.isArray(cached) && cached.length) {
      tasks.value = cached
    }
    try {
      const res = await taskApi.getTasks({ pageSize: 200 })
      const list = (res && res.list) || []
      if ((!cached || cached.length === 0) && list.length) {
        tasks.value = list
        storage.setItem(LS_KEY.TASKS, tasks.value)
      }
    } catch (_) {
      /* LS 已加载 */
    }
    inited.value = true
  }

  /**
   * 持久化任务到 LS
   */
  function persist() {
    storage.setItem(LS_KEY.TASKS, tasks.value)
  }

  /**
   * 新增任务
   * @param {object} payload - { title, note, plannedPomodoros, category, priority, dueDate }
   * @returns {object} 新建的任务
   */
  async function addTask(payload) {
    const now = Date.now()
    const base = {
      id: generateUUID(),
      title: (payload.title || '').trim(),
      note: (payload.note || '').trim(),
      status: TASK_STATUS.TODO,
      plannedPomodoros: Math.max(1, Number(payload.plannedPomodoros) || 1),
      completedPomodoros: 0,
      category: payload.category || 'other',
      priority: payload.priority || PRIORITY.MEDIUM,
      dueDate: payload.dueDate || null,
      createdAt: now,
      updatedAt: now,
      finishedAt: null,
    }
    try {
      const created = await taskApi.createTask(base)
      tasks.value.unshift(created)
      persist()
      showToast('任务创建成功', 'success')
      return created
    } catch (_) {
      // API 失败 → 离线兜底
      tasks.value.unshift(base)
      persist()
      showToast('网络异常，已离线保存', 'warning')
      return base
    }
  }

  /**
   * 更新任务（部分字段）
   * @param {string} id
   * @param {object} payload
   */
  async function updateTask(id, payload) {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    const updated = {
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
    // 乐观更新
    tasks.value[idx] = updated
    persist()
    try {
      await taskApi.updateTask(id, payload)
    } catch (_) {
      showToast('网络异常，已离线保存', 'warning')
    }
  }

  /**
   * 删除任务
   * @param {string} id
   */
  async function deleteTask(id) {
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx === -1) return
    const removed = tasks.value[idx]
    tasks.value.splice(idx, 1)
    persist()
    try {
      await taskApi.deleteTask(id)
      showToast('任务已删除', 'success')
    } catch (_) {
      // 离线已删除，不回滚
      showToast('网络异常，已离线删除', 'warning')
    }
  }

  /**
   * 切换任务状态 todo <-> done（doing → done）
   * @param {string} id
   */
  function toggleStatus(id) {
    const t = getTaskById(id)
    if (!t) return
    const next =
      t.status === TASK_STATUS.DONE ? TASK_STATUS.TODO : TASK_STATUS.DONE
    updateTask(id, {
      status: next,
      finishedAt: next === TASK_STATUS.DONE ? Date.now() : null,
    })
  }

  /**
   * 已消耗番茄数 +1
   * @param {string} id
   */
  async function incrementPomodoro(id) {
    const t = getTaskById(id)
    if (!t) return
    const next = (t.completedPomodoros || 0) + 1
    // doing 状态推进
    const patch = { completedPomodoros: next }
    if (t.status === TASK_STATUS.TODO) patch.status = TASK_STATUS.DOING
    if (next >= t.plannedPomodoros) patch.status = TASK_STATUS.DONE
    if (patch.status === TASK_STATUS.DONE) patch.finishedAt = Date.now()
    await updateTask(id, patch)
  }

  function setFilter(f) {
    filter.value = f
  }
  function setSortBy(s) {
    sortBy.value = s
  }
  function setViewMode(m) {
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
