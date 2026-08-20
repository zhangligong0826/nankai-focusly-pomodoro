import test from 'node:test'
import assert from 'node:assert/strict'
import {
  mergeTodayCheckin,
  computeStreak,
  computeLongestStreak,
} from '../src/utils/checkin.js'

test('a smaller server aggregate cannot overwrite offline progress', () => {
  const merged = mergeTodayCheckin(
    { date: '2026-08-20', firstCheckinAt: 1, pomodoroCount: 5, totalMinutes: 125 },
    { pomodoroCount: 1, totalMinutes: 25 }
  )
  assert.equal(merged.pomodoroCount, 5)
  assert.equal(merged.totalMinutes, 125)
})

test('a newer server aggregate can fill a larger value', () => {
  const merged = mergeTodayCheckin(
    { date: '2026-08-20', firstCheckinAt: 1, pomodoroCount: 2, totalMinutes: 50 },
    { pomodoroCount: 3, totalMinutes: 75 }
  )
  assert.equal(merged.pomodoroCount, 3)
  assert.equal(merged.totalMinutes, 75)
})

test('mergeTodayCheckin 保留本地日期与首次打卡时间', () => {
  const merged = mergeTodayCheckin(
    { date: '2026-08-20', firstCheckinAt: 100, pomodoroCount: 1, totalMinutes: 25 },
    { pomodoroCount: 2, totalMinutes: 50 }
  )
  assert.equal(merged.date, '2026-08-20')
  assert.equal(merged.firstCheckinAt, 100)
})

test('computeStreak 今日已打卡连续天数', () => {
  const dates = ['2026-08-20', '2026-08-19', '2026-08-18']
  assert.equal(computeStreak(dates, '2026-08-20'), 3)
})

test('computeStreak 今日未打卡从昨日起算（宽限）', () => {
  assert.equal(computeStreak(['2026-08-19', '2026-08-18'], '2026-08-20'), 2)
})

test('computeStreak 昨日也未打卡则断签', () => {
  assert.equal(computeStreak(['2026-08-18'], '2026-08-20'), 0)
})

test('computeStreak 空列表返回 0', () => {
  assert.equal(computeStreak([], '2026-08-20'), 0)
  assert.equal(computeStreak(null, '2026-08-20'), 0)
})

test('computeLongestStreak 最长连续天数', () => {
  assert.equal(
    computeLongestStreak(['2026-08-18', '2026-08-19', '2026-08-20']),
    3
  )
})

test('computeLongestStreak 中间断档取较长段', () => {
  assert.equal(
    computeLongestStreak(['2026-08-18', '2026-08-19', '2026-08-21', '2026-08-22']),
    2
  )
})

test('computeLongestStreak 重复日期只计一次', () => {
  assert.equal(computeLongestStreak(['2026-08-20', '2026-08-20']), 1)
})

test('computeLongestStreak 空列表返回 0', () => {
  assert.equal(computeLongestStreak([]), 0)
  assert.equal(computeLongestStreak(null), 0)
})
