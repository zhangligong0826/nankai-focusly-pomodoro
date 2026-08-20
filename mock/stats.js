/**
 * 统计 Mock
 * @module mock/stats
 * @description GET /api/stats/{weekly,monthly,summary,streak}，mockjs 生成随机数据
 */

import Mock from 'mockjs'
import { getWeekStart, getTodayStr, getMonthStr, getDaysInMonth, addDays } from '../src/utils/date'

/** 从 url 解析 query */
function getParam(url, key) {
  const m = url.match(new RegExp(`[?&]${key}=([^&]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

/** 生成某日数据 */
function genDay(dateStr) {
  const focusMinutes = Mock.Random.integer(0, 1) ? Mock.Random.integer(25, 200) : 0
  return {
    date: dateStr,
    focusMinutes,
    pomodoroCount: Math.round(focusMinutes / 25),
  }
}

export default [
  {
    url: '/api/stats/weekly',
    method: 'get',
    timeout: 300,
    response: ({ url }) => {
      const weekStart = getParam(url, 'weekStart') || getWeekStart()
      const data = []
      for (let i = 0; i < 7; i++) {
        data.push(genDay(addDays(weekStart, i)))
      }
      return { code: 0, data, message: 'success' }
    },
  },
  {
    url: '/api/stats/monthly',
    method: 'get',
    timeout: 300,
    response: ({ url }) => {
      const month = getParam(url, 'month') || getMonthStr()
      const [y, m] = month.split('-').map(Number)
      const days = getDaysInMonth(y, m)
      const data = []
      for (let i = 1; i <= days; i++) {
        const dateStr = `${month}-${String(i).padStart(2, '0')}`
        data.push(genDay(dateStr))
      }
      return { code: 0, data, message: 'success' }
    },
  },
  {
    url: '/api/stats/summary',
    method: 'get',
    timeout: 300,
    response: () => {
      return {
        code: 0,
        data: {
          totalFocusMinutes: Mock.Random.integer(1200, 9000),
          totalPomodoros: Mock.Random.integer(50, 360),
          totalCheckinDays: Mock.Random.integer(10, 60),
          currentStreak: Mock.Random.integer(1, 21),
          longestStreak: Mock.Random.integer(7, 35),
        },
        message: 'success',
      }
    },
  },
  {
    url: '/api/stats/streak',
    method: 'get',
    timeout: 200,
    response: () => {
      return {
        code: 0,
        data: {
          currentStreak: Mock.Random.integer(1, 21),
          longestStreak: Mock.Random.integer(7, 35),
        },
        message: 'success',
      }
    },
  },
]
