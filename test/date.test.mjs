import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatDate,
  getTodayStr,
  getTomorrowStr,
  getWeekStart,
  getMonthStr,
  isSameDay,
  diffDays,
  addDays,
  getDateRange,
  relativeDayLabel,
} from '../src/utils/date.ts'

test('formatDate 按模式格式化时间戳', () => {
  const ts = new Date(2024, 0, 15, 10, 5, 30).getTime()
  assert.equal(formatDate(ts, 'YYYY-MM-DD'), '2024-01-15')
  assert.equal(formatDate(ts, 'YYYY-MM-DD HH:mm:ss'), '2024-01-15 10:05:30')
  assert.equal(formatDate(ts, 'MM-DD'), '01-15')
  assert.equal(formatDate(ts), '2024-01-15')
})

test('formatDate 非法输入返回空串', () => {
  assert.equal(formatDate(''), '')
  assert.equal(formatDate(null), '')
  assert.equal(formatDate('not-a-date'), '')
})

test('getTodayStr 返回 YYYY-MM-DD 格式', () => {
  assert.match(getTodayStr(), /^\d{4}-\d{2}-\d{2}$/)
})

test('getTomorrowStr 比今天大一天', () => {
  assert.equal(diffDays(getTomorrowStr(), getTodayStr()), 1)
})

test('getWeekStart 返回周一', () => {
  // 2024-01-15 是周一
  assert.equal(getWeekStart('2024-01-15'), '2024-01-15')
  // 2024-01-18 是周四，本周周一应为 01-15
  assert.equal(getWeekStart('2024-01-18'), '2024-01-15')
})

test('getMonthStr 返回 YYYY-MM', () => {
  assert.equal(getMonthStr('2024-01-15'), '2024-01')
})

test('isSameDay 判断同一天', () => {
  const t1 = new Date(2024, 0, 15, 9, 0).getTime()
  const t2 = new Date(2024, 0, 15, 23, 0).getTime()
  const t3 = new Date(2024, 0, 16, 0, 0).getTime()
  assert.equal(isSameDay(t1, t2), true)
  assert.equal(isSameDay(t1, t3), false)
  assert.equal(isSameDay(null, t2), false)
})

test('diffDays 计算日期差（date1 - date2）', () => {
  assert.equal(diffDays('2024-01-18', '2024-01-15'), 3)
  assert.equal(diffDays('2024-01-15', '2024-01-18'), -3)
  assert.equal(diffDays('2024-01-15', '2024-01-15'), 0)
  assert.equal(diffDays('bad', '2024-01-15'), 0)
})

test('addDays 日期加减', () => {
  assert.equal(addDays('2024-01-15', 3), '2024-01-18')
  assert.equal(addDays('2024-01-15', -1), '2024-01-14')
  assert.equal(addDays('2024-01-30', 2), '2024-02-01') // 跨月
  assert.equal(addDays('bad', 2), 'bad') // 非法输入原样返回
})

test('getDateRange 生成区间日期数组（含端点）', () => {
  assert.deepEqual(getDateRange('2024-01-15', '2024-01-17'), [
    '2024-01-15',
    '2024-01-16',
    '2024-01-17',
  ])
  assert.deepEqual(getDateRange('bad', '2024-01-17'), [])
})

test('relativeDayLabel 相对日期描述', () => {
  const today = getTodayStr()
  assert.equal(relativeDayLabel(today), '今天')
  assert.equal(relativeDayLabel(addDays(today, 1)), '明天')
  assert.equal(relativeDayLabel(addDays(today, 2)), '后天')
  assert.equal(relativeDayLabel(addDays(today, -1)), '昨天')
  assert.equal(relativeDayLabel(addDays(today, 5)), '5 天后')
  assert.equal(relativeDayLabel(''), '')
})
