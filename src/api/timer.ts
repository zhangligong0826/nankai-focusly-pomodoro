/**
 * 计时器配置 API
 * @module api/timer
 * @description GET/PUT /api/timer/config
 */

import { request } from './index'

/** 获取计时器配置 */
export function getTimerConfig(): Promise<any> {
  return request.get('/timer/config')
}

/** 更新计时器配置 */
export function updateTimerConfig(data: Record<string, unknown>): Promise<any> {
  return request.put('/timer/config', data)
}

export default { getTimerConfig, updateTimerConfig }
