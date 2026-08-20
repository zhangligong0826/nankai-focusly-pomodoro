/**
 * 任务 CRUD API
 * @module api/task
 * @description GET/POST/PATCH/DELETE /api/tasks
 */

import { request } from './index'

/**
 * 获取任务列表
 * @param {object} [params] - { status, category, page, pageSize }
 * @returns {Promise<{ total: number, list: Array }>}
 */
export function getTasks(params = {}) {
  return request.get('/tasks', { params })
}

/**
 * 获取单个任务
 * @param {string} id
 * @returns {Promise<object>} Task
 */
export function getTaskById(id) {
  return request.get(`/tasks/${id}`)
}

/**
 * 新建任务
 * @param {object} data - Task payload（不含 id/createdAt）
 * @returns {Promise<object>} 完整 Task
 */
export function createTask(data) {
  return request.post('/tasks', data)
}

/**
 * 更新任务（部分字段）
 * @param {string} id
 * @param {object} data
 * @returns {Promise<object>} 完整 Task
 */
export function updateTask(id, data) {
  return request.patch(`/tasks/${id}`, data)
}

/**
 * 删除任务
 * @param {string} id
 * @returns {Promise<object>} { id }
 */
export function deleteTask(id) {
  return request.delete(`/tasks/${id}`)
}

export default { getTasks, getTaskById, createTask, updateTask, deleteTask }
