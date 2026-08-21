import test from 'node:test'
import assert from 'node:assert/strict'
import { generatePeers, generateFriends, getOrCreateSeed } from '../src/utils/socialMock.ts'

test('generatePeers 生成指定数量的确定性 peers', () => {
  const peers = generatePeers(42, 8)
  assert.equal(peers.length, 8)
  peers.forEach((p) => {
    assert.ok(p.id)
    assert.ok(p.name)
    assert.ok(p.avatar)
    assert.ok(p.goal)
    assert.ok(typeof p.focusMinutes === 'number' && p.focusMinutes >= 0)
    assert.ok(typeof p.studying === 'boolean')
  })
})

test('generatePeers 同 seed 结果确定（刷新稳定）', () => {
  const a = generatePeers(7, 5)
  const b = generatePeers(7, 5)
  assert.deepEqual(a, b)
})

test('generateFriends 生成好友榜单', () => {
  const friends = generateFriends(100, 7)
  assert.equal(friends.length, 7)
  friends.forEach((f) => {
    assert.ok(f.id)
    assert.ok(f.name)
    assert.ok(f.avatar)
    assert.ok(typeof f.weeklyMinutes === 'number' && f.weeklyMinutes > 0)
  })
})

test('getOrCreateSeed 首次生成并持久化，后续复用', () => {
  const store = {}
  const getItem = (k, d) => (k in store ? store[k] : d)
  const setItem = (k, v) => { store[k] = v }

  const first = getOrCreateSeed(getItem, setItem, 'seed')
  assert.ok(first > 0)
  const second = getOrCreateSeed(getItem, setItem, 'seed')
  assert.equal(first, second)
})
