/**
 * 打卡 API
 * @module api/checkin
 * @description POST/GET /api/checkin，GET /api/checkin/today
 */

import { request } from './index'

/**
 * 触发打卡（按 date 去重，已存在则累加）
 * @param {object} data - { durationMinutes: number }
 * @returns {Promise<object>} Checkin
 */
export function createCheckin(data) {
  return request.post('/checkin', data)
}

/**
 * 获取打卡记录范围
 * @param {object} [params] - { startDate, endDate }
 * @returns {Promise<Array>} Checkin[]
 */
export function getCheckins(params = {}) {
  return request.get('/checkin', { params })
}

/**
 * 获取今日打卡状态
 * @returns {Promise<{ checked: boolean, pomodoroCount: number, totalMinutes: number }>}
 */
export function getTodayCheckin() {
  return request.get('/checkin/today')
}

export default { createCheckin, getCheckins, getTodayCheckin }
