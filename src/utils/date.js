/**
 * 日期工具 - 格式化 / 比较 / 范围计算
 * @module utils/date
 * @description 纯函数，无副作用，所有时间字段以毫秒时间戳或 YYYY-MM-DD 字符串处理
 */

/**
 * 左补零
 * @param {number} n
 * @returns {string}
 */
function pad2(n) {
  return String(n).padStart(2, '0')
}

/**
 * 格式化时间戳为指定模式字符串
 * @param {number|string|Date} ts - 毫秒时间戳 / 日期字符串 / Date 对象
 * @param {string} pattern - 模式，如 'YYYY-MM-DD' / 'YYYY-MM-DD HH:mm' / 'MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(ts, pattern = 'YYYY-MM-DD') {
  if (!ts) return ''
  const d = ts instanceof Date ? ts : new Date(typeof ts === 'number' ? ts : Date.parse(ts))
  if (Number.isNaN(d.getTime())) return ''
  const map = {
    YYYY: d.getFullYear(),
    MM: pad2(d.getMonth() + 1),
    DD: pad2(d.getDate()),
    HH: pad2(d.getHours()),
    mm: pad2(d.getMinutes()),
    ss: pad2(d.getSeconds()),
  }
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => map[m])
}

/**
 * 获取今日日期字符串 YYYY-MM-DD（本地时区）
 * @returns {string}
 */
export function getTodayStr() {
  return formatDate(Date.now(), 'YYYY-MM-DD')
}

/**
 * 获取明日日期字符串
 * @returns {string}
 */
export function getTomorrowStr() {
  return formatDate(Date.now() + 24 * 60 * 60 * 1000, 'YYYY-MM-DD')
}

/**
 * 获取本周周一日期字符串（以周一为一周起点）
 * @param {string} [dateStr] - 基准日期，默认今天
 * @returns {string} YYYY-MM-DD
 */
export function getWeekStart(dateStr) {
  const base = dateStr ? new Date(dateStr + 'T00:00:00') : new Date()
  const day = base.getDay() || 7 // 周日 getDay()=0 → 转为 7
  const monday = new Date(base)
  monday.setDate(base.getDate() - day + 1)
  return formatDate(monday, 'YYYY-MM-DD')
}

/**
 * 获取月份字符串 YYYY-MM
 * @param {string|Date|number} [ref] - 基准，默认当前
 * @returns {string} YYYY-MM
 */
export function getMonthStr(ref) {
  const d = ref ? new Date(typeof ref === 'string' && ref.length === 10 ? ref + 'T00:00:00' : ref) : new Date()
  return formatDate(d, 'YYYY-MM')
}

/**
 * 判断两个时间戳是否同一天
 * @param {number} ts1
 * @param {number} ts2
 * @returns {boolean}
 */
export function isSameDay(ts1, ts2) {
  if (!ts1 || !ts2) return false
  return formatDate(ts1, 'YYYY-MM-DD') === formatDate(ts2, 'YYYY-MM-DD')
}

/**
 * 计算两个日期字符串之间的天数差（date1 - date2，可正可负）
 * @param {string} date1 - YYYY-MM-DD
 * @param {string} date2 - YYYY-MM-DD
 * @returns {number} 相差天数
 */
export function diffDays(date1, date2) {
  const d1 = new Date(date1 + 'T00:00:00').getTime()
  const d2 = new Date(date2 + 'T00:00:00').getTime()
  if (Number.isNaN(d1) || Number.isNaN(d2)) return 0
  return Math.round((d1 - d2) / (24 * 60 * 60 * 1000))
}

/**
 * 获取某月天数
 * @param {number} year
 * @param {number} month - 1-12
 * @returns {number}
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/**
 * 生成从 startDate 到 endDate（含）的日期字符串数组
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {string[]}
 */
export function getDateRange(startDate, endDate) {
  const result = []
  const end = new Date(endDate + 'T00:00:00').getTime()
  let cur = new Date(startDate + 'T00:00:00').getTime()
  if (Number.isNaN(cur) || Number.isNaN(end)) return result
  while (cur <= end) {
    result.push(formatDate(cur, 'YYYY-MM-DD'))
    cur += 24 * 60 * 60 * 1000
  }
  return result
}

/**
 * 将日期字符串加 n 天，返回新日期字符串
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - 可正可负
 * @returns {string}
 */
export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return dateStr
  d.setDate(d.getDate() + days)
  return formatDate(d, 'YYYY-MM-DD')
}

/**
 * 相对日期描述（今天 / 明天 / 后天 / N天后 / 日期）
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
export function relativeDayLabel(dateStr) {
  if (!dateStr) return ''
  const diff = diffDays(dateStr, getTodayStr())
  if (diff === 0) return '今天'
  if (diff === 1) return '明天'
  if (diff === 2) return '后天'
  if (diff === -1) return '昨天'
  if (diff > 0) return `${diff} 天后`
  return dateStr
}
