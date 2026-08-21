/**
 * 数据导出纯函数（无浏览器 / 框架依赖，供导出流程与单元测试共用）
 * @module utils/exportCore
 * @description 收集导出载荷 / 生成 CSV 内容 / JSON 序列化
 */
import { LS_KEY } from './constants.ts'
import { getMonthStr } from './date.ts'
import type { CheckinLike } from './statsAggregate.ts'

/** 导出数据格式版本号（导入时校验） */
export const EXPORT_VERSION = 'focusly-1.0'

/** 存储读取函数（key, defaultValue） */
export type GetItemFn = (key: string, defaultValue: unknown) => unknown

/** 收集导出载荷 */
export function buildExportPayload(
  getItem: GetItemFn,
  range: 'all' | 'month' = 'all',
  now = new Date()
): Record<string, unknown> {
  const tasks = getItem(LS_KEY.TASKS, [])
  let checkins = getItem(LS_KEY.CHECKINS, [])
  const sessions = getItem(LS_KEY.SESSIONS, [])
  const settings = getItem(LS_KEY.SETTINGS, {})
  const timerConfig = getItem(LS_KEY.TIMER_CONFIG, {})
  const garden = getItem(LS_KEY.GARDEN, null)

  if (range === 'month') {
    const month = getMonthStr(now)
    checkins = ((checkins as CheckinLike[]) || []).filter(
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
    garden,
  }
}

/** 将打卡记录生成为 CSV 文本（不含 BOM） */
export function buildCheckinCSV(checkins: CheckinLike[]): string {
  const header = ['date', 'pomodoroCount', 'totalMinutes']
  const rows = (checkins || [])
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((c) => [c.date, c.pomodoroCount, c.totalMinutes])
  return [header, ...rows]
    .map((row) =>
      row.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')
}

/** JSON 序列化（2 空格缩进） */
export function buildExportJSON(data: unknown): string {
  return JSON.stringify(data, null, 2)
}

export default { buildExportPayload, buildCheckinCSV, buildExportJSON, EXPORT_VERSION }
