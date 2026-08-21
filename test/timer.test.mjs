import test from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceCountdown,
  computeRemaining,
  computeDeadline,
} from '../src/utils/timer.js'

test('countdown completes in the tick that reaches zero', () => {
  assert.deepEqual(advanceCountdown(1), { remainingSeconds: 0, completed: true })
  assert.deepEqual(advanceCountdown(2), { remainingSeconds: 1, completed: false })
})

test('computeRemaining: 基于截止时间戳反推剩余秒数（向上取整）', () => {
  const now = 1_000_000_000_000
  // 恰好 60 秒
  assert.equal(computeRemaining(now + 60_000, now), 60)
  // 59.5 秒 → 向上取整为 60（避免提前归零）
  assert.equal(computeRemaining(now + 59_500, now), 60)
  // 0.2 秒 → 1 秒
  assert.equal(computeRemaining(now + 200, now), 1)
})

test('computeRemaining: 过期与边界', () => {
  const now = 1_000_000_000_000
  // 恰好到点 → 0
  assert.equal(computeRemaining(now, now), 0)
  // 已过期 → 0（不会为负）
  assert.equal(computeRemaining(now - 5_000, now), 0)
  // 非法值 → 0
  assert.equal(computeRemaining(NaN, now), 0)
  assert.equal(computeRemaining(null, now), 0)
})

test('computeDeadline: 由剩余秒数生成截止时间戳', () => {
  const now = 1_000_000_000_000
  assert.equal(computeDeadline(60, now), now + 60_000)
  assert.equal(computeDeadline(0, now), now)
  assert.equal(computeDeadline(-5, now), now) // 负值钳为 0
  assert.equal(computeDeadline(NaN, now), now)
})

test('computeRemaining 与 computeDeadline 互逆', () => {
  const now = 1_700_000_000_000
  const seconds = 25 * 60 // 25 分钟
  const deadline = computeDeadline(seconds, now)
  assert.equal(computeRemaining(deadline, now), seconds)
  // 经过 10 秒后
  assert.equal(computeRemaining(deadline, now + 10_000), seconds - 10)
})
