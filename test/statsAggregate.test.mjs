import test from 'node:test'
import assert from 'node:assert/strict'
import { computeHeatmap, computePeakHours, formatDateLocal } from '../src/utils/statsAggregate.js'

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
