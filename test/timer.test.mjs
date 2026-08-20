import test from 'node:test'
import assert from 'node:assert/strict'
import { advanceCountdown } from '../src/utils/timer.js'

test('countdown completes in the tick that reaches zero', () => {
  assert.deepEqual(advanceCountdown(1), { remainingSeconds: 0, completed: true })
  assert.deepEqual(advanceCountdown(2), { remainingSeconds: 1, completed: false })
})
