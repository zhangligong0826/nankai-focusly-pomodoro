/**
 * 任务 CRUD API
 * @module api/task
 * @description GET/POST/PATCH/DELETE /api/tasks
 */

import { request } from './index'

/** 获取任务列表 */
export function getTasks(params: Record<string, unknown> = {}): Promise<any> {
  return request.get('/tasks', { params })
}

/** 获取单个任务 */
export function getTaskById(id: string): Promise<any> {
  return request.get(`/tasks/${id}`)
}

/** 新建任务 */
export function createTask(data: Record<string, unknown>): Promise<any> {
  return request.post('/tasks', data)
}

/** 更新任务（部分字段） */
export function updateTask(id: string, data: Record<string, unknown>): Promise<any> {
  return request.patch(`/tasks/${id}`, data)
}

/** 删除任务 */
export function deleteTask(id: string): Promise<any> {
  return request.delete(`/tasks/${id}`)
}

export default { getTasks, getTaskById, createTask, updateTask, deleteTask }
