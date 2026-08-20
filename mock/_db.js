/**
 * Mock 共享内存数据
 * @module mock/_db
 * @description 持有 checkins / sessions / settings 内存状态，供各 Mock 模块共享；
 *              default 导出空数组（vite-plugin-mock 会将其视为零路由的合法 Mock 文件）
 */

/** 工具：获取今日日期字符串 YYYY-MM-DD */
function todayStr() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 工具：日期字符串偏移 N 天 */
function addDays(dateStr, n) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + n)
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const today = todayStr()

/**
 * 打卡记录种子（最近 14 天，制造连续打卡与合理分布）
 * pomodoroCount 表示当日完成的番茄数，totalMinutes = pomodoroCount * 25
 */
const checkins = [
  // 最近 7 天连续打卡
  { date: addDays(today, -6), firstCheckinAt: Date.now() - 6 * 86400000 + 9 * 3600000, pomodoroCount: 5, totalMinutes: 125 },
  { date: addDays(today, -5), firstCheckinAt: Date.now() - 5 * 86400000 + 8 * 3600000, pomodoroCount: 3, totalMinutes: 75 },
  { date: addDays(today, -4), firstCheckinAt: Date.now() - 4 * 86400000 + 10 * 3600000, pomodoroCount: 4, totalMinutes: 100 },
  { date: addDays(today, -3), firstCheckinAt: Date.now() - 3 * 86400000 + 9 * 3600000, pomodoroCount: 6, totalMinutes: 150 },
  { date: addDays(today, -2), firstCheckinAt: Date.now() - 2 * 86400000 + 8 * 3600000, pomodoroCount: 2, totalMinutes: 50 },
  { date: addDays(today, -1), firstCheckinAt: Date.now() - 86400000 + 9 * 3600000, pomodoroCount: 4, totalMinutes: 100 },
  // 今日（初始 0 个番茄，尚未完成）
  { date: today, firstCheckinAt: Date.now(), pomodoroCount: 0, totalMinutes: 0 },
  // 更早的历史记录（非连续）
  { date: addDays(today, -10), firstCheckinAt: Date.now() - 10 * 86400000, pomodoroCount: 4, totalMinutes: 100 },
  { date: addDays(today, -11), firstCheckinAt: Date.now() - 11 * 86400000, pomodoroCount: 3, totalMinutes: 75 },
  { date: addDays(today, -15), firstCheckinAt: Date.now() - 15 * 86400000, pomodoroCount: 5, totalMinutes: 125 },
  { date: addDays(today, -18), firstCheckinAt: Date.now() - 18 * 86400000, pomodoroCount: 2, totalMinutes: 50 },
]

/** 专注会话记录（用于扩展统计，本期由 checkins 派生） */
const sessions = []

export { checkins, sessions, todayStr, addDays, today }

// 空数组默认导出：vite-plugin-mock 视为零路由的合法 Mock 文件
export default []
