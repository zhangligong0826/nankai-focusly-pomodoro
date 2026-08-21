import test from 'node:test'
import assert from 'node:assert/strict'
import { generateUUID } from '../src/utils/uuid.ts'

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

test('generateUUID 返回 36 位 v4 格式', () => {
  const id = generateUUID()
  assert.equal(id.length, 36)
  assert.match(id, UUID_V4_RE)
})

test('generateUUID 批量生成无重复', () => {
  const seen = new Set()
  for (let i = 0; i < 1000; i++) {
    seen.add(generateUUID())
  }
  assert.equal(seen.size, 1000)
})
