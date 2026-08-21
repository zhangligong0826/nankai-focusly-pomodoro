import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeHeatmap,
  computePeakHours,
  computeDaily,
  computeYearly,
  buildPeakAdvice,
  formatDateLocal,
} from '../src/utils/statsAggregate.ts'

test('formatDateLocal 格式化为 YYYY-MM-DD', () => {
  assert.equal(formatDateLocal(new Date(2026, 7, 21)), '2026-08-21')
  assert.equal(formatDateLocal(new Date(2026, 0, 1)), '2026-01-01')
})

test('computeHeatmap 覆盖近 12 月逐日，空日填 0', () => {
  const now = new Date(2026, 7, 21) // 2026-08-21
  const checkins = [
    { date: '2026-08-21', totalMinutes: 50 },
    { date: '2026-08-20', totalMinutes: 25 },
  ]
  const data = computeHeatmap(checkins, 12, now)
  // 起始日期应为 2025-09-01
  assert.equal(data[0][0], '2025-09-01')
  // 末位应为今天 2026-08-21
  assert.equal(data[data.length - 1][0], '2026-08-21')
  // 有数据的日期值正确
  const map = new Map(data)
  assert.equal(map.get('2026-08-21'), 50)
  assert.equal(map.get('2026-08-20'), 25)
  // 空日填 0
  assert.equal(map.get('2026-08-19'), 0)
})

test('computePeakHours 聚合小时分布并排除 skip/abort', () => {
  const sessions = [
    { startedAt: new Date(2026, 7, 21, 9, 0).getTime(), durationMinutes: 25, completed: true },
    { startedAt: new Date(2026, 7, 21, 9, 30).getTime(), durationMinutes: 25, completed: true },
    { startedAt: new Date(2026, 7, 21, 20, 0).getTime(), durationMinutes: 50, completed: true },
    // skip/abort 应被排除
    { startedAt: new Date(2026, 7, 21, 20, 30).getTime(), durationMinutes: 40, completed: false },
  ]
  const { buckets, peak } = computePeakHours(sessions)
  assert.equal(buckets.length, 24)
  assert.equal(buckets[9].minutes, 50)
  assert.equal(buckets[9].count, 2)
  assert.equal(buckets[20].minutes, 50)
  assert.equal(buckets[20].count, 1)
  // 峰值：9 点和 20 点都是 50 分钟，peak 应取先出现的 9 点
  assert.equal(peak, 9)
})

test('computePeakHours 无有效会话时 peak 为 null', () => {
  const { peak, buckets } = computePeakHours([])
  assert.equal(peak, null)
  assert.equal(buckets.length, 24)
  assert.ok(buckets.every((b) => b.minutes === 0 && b.count === 0))
})

test('computeDaily 聚合当日指标与任务分布', () => {
  const date = '2026-08-21'
  const checkins = [{ date, pomodoroCount: 3, totalMinutes: 75 }]
  const sessions = [
    { taskId: 't1', taskTitle: '任务A', startedAt: new Date(2026, 7, 21, 9, 0).getTime(), durationMinutes: 25, type: 'focus', completed: true },
    { taskId: 't1', taskTitle: '任务A', startedAt: new Date(2026, 7, 21, 10, 0).getTime(), durationMinutes: 25, type: 'focus', completed: true },
    { taskId: 't2', taskTitle: '任务B', startedAt: new Date(2026, 7, 21, 11, 0).getTime(), durationMinutes: 25, type: 'focus', completed: true },
    // 非 focus 或非当日应排除
    { taskId: 't3', taskTitle: '任务C', startedAt: new Date(2026, 7, 20, 9, 0).getTime(), durationMinutes: 25, type: 'focus', completed: true },
    { taskId: null, startedAt: new Date(2026, 7, 21, 14, 0).getTime(), durationMinutes: 30, type: 'focus', completed: false },
  ]
  const d = computeDaily(date, checkins, sessions)
  assert.equal(d.pomodoroCount, 3)
  assert.equal(d.totalMinutes, 75)
  assert.equal(d.completedTasks, 2) // t1 + t2
  assert.equal(d.taskDistribution.length, 2)
  // 任务A 累计 50 分钟排第一
  assert.equal(d.taskDistribution[0].taskId, 't1')
  assert.equal(d.taskDistribution[0].minutes, 50)
  assert.equal(d.taskDistribution[0].count, 2)
})

test('computeYearly 生成 12 个月数据', () => {
  const checkins = [
    { date: '2026-01-05', totalMinutes: 50, pomodoroCount: 2 },
    { date: '2026-01-06', totalMinutes: 25, pomodoroCount: 1 },
    { date: '2026-03-10', totalMinutes: 40, pomodoroCount: 1 },
  ]
  const yearly = computeYearly(2026, checkins)
  assert.equal(yearly.length, 12)
  assert.equal(yearly[0].month, '2026-01')
  assert.equal(yearly[0].focusMinutes, 75)
  assert.equal(yearly[0].pomodoroCount, 3)
  assert.equal(yearly[2].focusMinutes, 40)
  assert.equal(yearly[11].month, '2026-12')
  assert.equal(yearly[11].focusMinutes, 0)
})

test('buildPeakAdvice 生成建议文案', () => {
  const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, minutes: 0, count: 0 }))
  assert.equal(buildPeakAdvice(buckets, null), '')
  const advice = buildPeakAdvice(buckets, 20)
  assert.ok(advice.includes('20:00 - 21:00'))
  assert.ok(advice.includes('高效时段'))
})
