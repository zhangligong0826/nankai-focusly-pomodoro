/**
 * 数据导出纯函数（无浏览器 / 框架依赖，供导出流程与单元测试共用）
 * @module utils/exportCore
 * @description 收集导出载荷 / 生成 CSV 内容 / JSON 序列化
 */
import { LS_KEY } from './constants.js'
import { getMonthStr } from './date.js'

/** 导出数据格式版本号（导入时校验） */
export const EXPORT_VERSION = 'focusly-1.0'

/**
 * 收集导出载荷。
 * @param {function(string, *):*} getItem - 读取本地存储（key, defaultValue）
 * @param {'all'|'month'} [range='all'] - 范围（全部/本月）
 * @param {Date} [now=new Date()] - 导出时刻
 * @returns {object} 导出数据对象
 */
export function buildExportPayload(getItem, range = 'all', now = new Date()) {
  const tasks = getItem(LS_KEY.TASKS, [])
  let checkins = getItem(LS_KEY.CHECKINS, [])
  const sessions = getItem(LS_KEY.SESSIONS, [])
  const settings = getItem(LS_KEY.SETTINGS, {})
  const timerConfig = getItem(LS_KEY.TIMER_CONFIG, {})

  if (range === 'month') {
    const month = getMonthStr(now)
    checkins = (checkins || []).filter(
      (c) => c && c.date && c.date.startsWith(month)
    )
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    range,
    timerConfig,
    settings,
    tasks,
    checkins,
    sessions,
  }
}

/**
 * 将打卡记录生成为 CSV 文本（不含 BOM）。
 * @param {object[]} checkins - 打卡记录（date/pomodoroCount/totalMinutes）
 * @returns {string} CSV 文本
 */
export function buildCheckinCSV(checkins) {
  const header = ['date', 'pomodoroCount', 'totalMinutes']
  const rows = (checkins || [])
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((c) => [c.date, c.pomodoroCount, c.totalMinutes])
  // CSV 转义（简单处理：含引号/逗号时加引号包裹）
  return [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
}

/**
 * JSON 序列化（2 空格缩进）。
 * @param {object} data
 * @returns {string}
 */
export function buildExportJSON(data) {
  return JSON.stringify(data, null, 2)
}

export default { buildExportPayload, buildCheckinCSV, buildExportJSON, EXPORT_VERSION }
