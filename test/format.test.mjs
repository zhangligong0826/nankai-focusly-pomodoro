import test from 'node:test'
import assert from 'node:assert/strict'
import {
  minutesToHHMM,
  minutesToChinese,
  secondsToMMSS,
  formatNumber,
  secondsToHuman,
} from '../src/utils/format.ts'

test('secondsToMMSS 格式化秒数', () => {
  assert.equal(secondsToMMSS(65), '01:05')
  assert.equal(secondsToMMSS(0), '00:00')
  assert.equal(secondsToMMSS(3661), '61:01')
  assert.equal(secondsToMMSS(-5), '00:00')
  assert.equal(secondsToMMSS(1500), '25:00')
})

test('minutesToHHMM 格式化分钟', () => {
  assert.equal(minutesToHHMM(125), '2h 5min')
  assert.equal(minutesToHHMM(60), '1h')
  assert.equal(minutesToHHMM(25), '25min')
  assert.equal(minutesToHHMM(0), '0min')
  assert.equal(minutesToHHMM(-1), '0min')
})

test('minutesToChinese 中文时长', () => {
  assert.equal(minutesToChinese(125), '2 小时 5 分钟')
  assert.equal(minutesToChinese(60), '1 小时')
  assert.equal(minutesToChinese(25), '25 分钟')
  assert.equal(minutesToChinese(0), '0 分钟')
})

test('formatNumber 千分位格式化', () => {
  assert.equal(formatNumber(1234), '1,234')
  assert.equal(formatNumber(1234567), '1,234,567')
  assert.equal(formatNumber(0), '0')
  assert.equal(formatNumber(null), '0')
  assert.equal(formatNumber(undefined), '0')
  assert.equal(formatNumber(NaN), '0')
})

test('secondsToHuman 秒数转中文时长', () => {
  assert.equal(secondsToHuman(3600), '1 小时')
  assert.equal(secondsToHuman(1500), '25 分钟')
  assert.equal(secondsToHuman(0), '0 分钟')
})
