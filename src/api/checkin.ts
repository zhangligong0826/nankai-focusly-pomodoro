/**
 * 打卡 API
 * @module api/checkin
 * @description POST/GET /api/checkin，GET /api/checkin/today
 */

import { request } from './index'

/** 触发打卡（按 date 去重，已存在则累加） */
export function createCheckin(data: { durationMinutes: number }): Promise<any> {
  return request.post('/checkin', data)
}

/** 获取打卡记录范围 */
export function getCheckins(params: Record<string, unknown> = {}): Promise<any> {
  return request.get('/checkin', { params })
}

/** 获取今日打卡状态 */
export function getTodayCheckin(): Promise<any> {
  return request.get('/checkin/today')
}

export default { createCheckin, getCheckins, getTodayCheckin }
