import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeTodayCheckin } from '../src/utils/checkin.js'

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
