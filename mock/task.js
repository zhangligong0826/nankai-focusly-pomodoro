/**
 * 任务 Mock
 * @module mock/task
 * @description GET/POST/PATCH/DELETE /api/tasks，内存 Map 模拟 CRUD
 */

import Mock from 'mockjs'

/** 内存任务表：id -> Task */
const taskMap = new Map()

/** 生成随机任务 */
function genTask(over = {}) {
  return {
    id: Mock.Random.guid(),
    title: Mock.Random.pick([
      '复习高等数学第三章',
      '背诵英语单词 Unit 5',
      '完成毕业论文文献综述',
      '刷数据结构算法题',
      '阅读《深度学习》第二章',
      '整理专业课笔记',
      '英语听力训练',
      '政治背诵马原',
    ]),
    note: Mock.Random.csentence(5, 20),
    status: Mock.Random.pick(['todo', 'doing', 'done']),
    plannedPomodoros: Mock.Random.integer(1, 8),
    completedPomodoros: Mock.Random.integer(0, 4),
    category: Mock.Random.pick(['professional', 'english', 'research', 'other']),
    priority: Mock.Random.pick(['high', 'medium', 'low']),
    dueDate: Mock.Random.date('yyyy-MM-dd'),
    createdAt: Date.now() - Mock.Random.integer(0, 7) * 86400000,
    updatedAt: Date.now(),
    finishedAt: null,
    ...over,
  }
}

// 初始化 6 条种子数据
for (let i = 0; i < 6; i++) {
  const t = genTask()
  taskMap.set(t.id, t)
}

/** 从 url 解析 :id */
function parseId(url = '') {
  const m = url.match(/\/api\/tasks\/([^/?]+)/)
  return m ? decodeURIComponent(m[1]) : ''
}

export default [
  {
    url: '/api/tasks',
    method: 'get',
    timeout: 300,
    response: ({ query }) => {
      let list = Array.from(taskMap.values())
      const { status, category } = query || {}
      if (status) list = list.filter((t) => t.status === status)
      if (category) list = list.filter((t) => t.category === category)
      list.sort((a, b) => b.createdAt - a.createdAt)
      return {
        code: 0,
        data: { total: list.length, list },
        message: 'success',
      }
    },
  },
  {
    url: '/api/tasks',
    method: 'post',
    timeout: 300,
    response: ({ body }) => {
      const now = Date.now()
      const task = {
        id: Mock.Random.guid(),
        title: (body && body.title) || '未命名任务',
        note: (body && body.note) || '',
        status: 'todo',
        plannedPomodoros: (body && body.plannedPomodoros) || 1,
        completedPomodoros: 0,
        category: (body && body.category) || 'other',
        priority: (body && body.priority) || 'medium',
        dueDate: (body && body.dueDate) || null,
        createdAt: now,
        updatedAt: now,
        finishedAt: null,
      }
      taskMap.set(task.id, task)
      return { code: 0, data: task, message: '任务创建成功' }
    },
  },
  {
    url: '/api/tasks/:id',
    method: 'get',
    timeout: 200,
    response: ({ url }) => {
      const id = parseId(url)
      const task = taskMap.get(id)
      if (!task) return { code: 2, data: null, message: '任务不存在' }
      return { code: 0, data: task, message: 'success' }
    },
  },
  {
    url: '/api/tasks/:id',
    method: 'patch',
    timeout: 300,
    response: ({ url, body }) => {
      const id = parseId(url)
      const task = taskMap.get(id)
      if (!task) return { code: 2, data: null, message: '任务不存在' }
      const patch = body || {}
      const updated = { ...task, ...patch, updatedAt: Date.now() }
      if (patch.status === 'done' && !task.finishedAt) {
        updated.finishedAt = Date.now()
      }
      taskMap.set(id, updated)
      return { code: 0, data: updated, message: '任务已更新' }
    },
  },
  {
    url: '/api/tasks/:id',
    method: 'delete',
    timeout: 200,
    response: ({ url }) => {
      const id = parseId(url)
      if (!taskMap.has(id)) return { code: 2, data: null, message: '任务不存在' }
      taskMap.delete(id)
      return { code: 0, data: { id }, message: '任务已删除' }
    },
  },
]
