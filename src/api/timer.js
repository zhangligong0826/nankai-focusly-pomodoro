/**
 * 计时器配置 API
 * @module api/timer
 * @description GET/PUT /api/timer/config
 */

import { request } from './index'

/**
 * 获取计时器配置
 * @returns {Promise<object>} TimerConfig
 */
export function getTimerConfig() {
  return request.get('/timer/config')
}

/**
 * 更新计时器配置
 * @param {object} data - 部分字段
 * @returns {Promise<object>} 完整 TimerConfig
 */
export function updateTimerConfig(data) {
  return request.put('/timer/config', data)
}

export default { getTimerConfig, updateTimerConfig }
