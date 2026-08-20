/**
 * 打卡 Mock
 * @module mock/checkin
 * @description POST/GET /api/checkin，GET /api/checkin/today，按 date 去重累加
 */

import { getTodayStr, formatDate } from '../src/utils/date'

/** 内存打卡表：date -> Checkin */
const checkinMap = new Map()

/** 今日字符串 */
function today() {
  return getTodayStr()
}

export default [
  {
    url: '/api/checkin',
    method: 'post',
    timeout: 300,
    response: ({ body }) => {
      const durationMinutes = (body && body.durationMinutes) || 25
      const date = today()
      const existing = checkinMap.get(date)
      if (existing) {
        // 当日重复打卡：累加
        existing.pomodoroCount += 1
        existing.totalMinutes += durationMinutes
        return {
          code: 0,
          data: { ...existing },
          message: '今日已打卡，专注时长已更新',
        }
      }
      // 首次打卡
      const checkin = {
        date,
        firstCheckinAt: Date.now(),
        pomodoroCount: 1,
        totalMinutes: durationMinutes,
      }
      checkinMap.set(date, checkin)
      return { code: 0, data: { ...checkin }, message: '打卡成功！' }
    },
  },
  {
    url: '/api/checkin',
    method: 'get',
    timeout: 200,
    response: ({ query }) => {
      const { startDate, endDate } = query || {}
      let list = Array.from(checkinMap.values())
      if (startDate) list = list.filter((c) => c.date >= startDate)
      if (endDate) list = list.filter((c) => c.date <= endDate)
      list.sort((a, b) => (a.date < b.date ? 1 : -1))
      return { code: 0, data: list, message: 'success' }
    },
  },
  {
    url: '/api/checkin/today',
    method: 'get',
    timeout: 200,
    response: () => {
      const todayStr = today()
      const checkin = checkinMap.get(todayStr)
      if (!checkin) {
        return {
          code: 0,
          data: { checked: false, pomodoroCount: 0, totalMinutes: 0 },
          message: 'success',
        }
      }
      return {
        code: 0,
        data: {
          checked: true,
          pomodoroCount: checkin.pomodoroCount,
          totalMinutes: checkin.totalMinutes,
        },
        message: 'success',
      }
    },
  },
]
