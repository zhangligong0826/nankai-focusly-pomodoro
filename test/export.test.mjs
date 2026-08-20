import test from 'node:test'
import assert from 'node:assert/strict'
import {
  EXPORT_VERSION,
  buildExportPayload,
  buildCheckinCSV,
  buildExportJSON,
} from '../src/utils/exportCore.js'

function makeStore(overrides = {}) {
  const store = {
    focusly_tasks: [{ id: 't1', title: '任务A' }],
    focusly_checkins: [
      { date: '2026-08-20', pomodoroCount: 3, totalMinutes: 75 },
      { date: '2026-08-19', pomodoroCount: 1, totalMinutes: 25 },
    ],
    focusly_sessions: [{ id: 's1', durationMinutes: 25 }],
    focusly_settings: { theme: 'dark' },
    focusly_timer_config: { focusDuration: 25 },
    ...overrides,
  }
  return (key, def) => (key in store ? store[key] : def)
}

test('buildExportPayload 结构完整且带版本号', () => {
  const payload = buildExportPayload(makeStore(), 'all', new Date('2026-08-20T10:00:00Z'))
  assert.equal(payload.version, EXPORT_VERSION)
  assert.equal(payload.version, 'focusly-1.0')
  assert.equal(payload.range, 'all')
  assert.equal(payload.exportedAt, '2026-08-20T10:00:00.000Z')
  assert.equal(payload.tasks.length, 1)
  assert.equal(payload.checkins.length, 2)
  assert.equal(payload.sessions.length, 1)
  assert.equal(payload.settings.theme, 'dark')
  assert.equal(payload.timerConfig.focusDuration, 25)
})

test('buildExportPayload month 范围只保留本月打卡', () => {
  const getItem = makeStore({
    focusly_checkins: [
      { date: '2026-08-20', pomodoroCount: 3, totalMinutes: 75 },
      { date: '2026-07-31', pomodoroCount: 2, totalMinutes: 50 },
    ],
  })
  const payload = buildExportPayload(getItem, 'month', new Date('2026-08-15T10:00:00Z'))
  assert.equal(payload.range, 'month')
  assert.equal(payload.checkins.length, 1)
  assert.equal(payload.checkins[0].date, '2026-08-20')
})

test('buildCheckinCSV 生成表头并按日期升序', () => {
  const csv = buildCheckinCSV([
    { date: '2026-08-20', pomodoroCount: 3, totalMinutes: 75 },
    { date: '2026-08-19', pomodoroCount: 1, totalMinutes: 25 },
  ])
  const lines = csv.split('\n')
  assert.equal(lines[0], '"date","pomodoroCount","totalMinutes"')
  // 按日期升序：08-19 在 08-20 之前
  assert.ok(lines[1].startsWith('"2026-08-19"'))
  assert.ok(lines[2].startsWith('"2026-08-20"'))
  assert.equal(lines[1], '"2026-08-19","1","25"')
  assert.equal(lines[2], '"2026-08-20","3","75"')
})

test('buildCheckinCSV 空值转为空串', () => {
  const csv = buildCheckinCSV([{ date: '2026-08-20', pomodoroCount: null, totalMinutes: undefined }])
  assert.ok(csv.includes('"2026-08-20","",""'))
})

test('buildExportJSON 2 空格缩进序列化', () => {
  assert.equal(buildExportJSON({ a: 1 }), '{\n  "a": 1\n}')
})
