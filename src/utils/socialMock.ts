/**
 * 社交 mock 数据生成（P3 纯前端模拟）
 * @module utils/socialMock
 * @description 基于 seed 确定性生成匿名陪学 peers 与好友榜单，
 *   无真实后端；seed 持久化保证刷新稳定。
 */

/** 头像 emoji 池 */
const AVATARS = ['🍅', '🌱', '🌻', '📚', '✏️', '☕', '🌙', '🐱', '🐼', '🦊', '🎧', '🏃']

/** 目标文字池 */
const GOALS = [
  '复习高数第三章',
  '背 50 个英语单词',
  '写论文文献综述',
  '刷 LeetCode 两题',
  '整理专业课笔记',
  '读深度学习第二章',
  '准备英语六级',
  '复习数据结构',
  '写实验报告',
  '背政治大题',
]

/** 昵称池 */
const NAMES = [
  '番茄侠', '卷王同学', '早起鸟', '夜猫子', '图书馆常客',
  '论文攻坚者', '考研人', '自习小分队', '代码诗人', '书虫',
]

/** 陪学 peer */
export interface Peer {
  id: string
  name: string
  avatar: string
  goal: string
  focusMinutes: number
  studying: boolean
}

/** 好友 */
export interface Friend {
  id: string
  name: string
  avatar: string
  weeklyMinutes: number
}

/** 简单确定性伪随机（mulberry32），返回 [0,1) 随机数 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 生成匿名陪学 peers */
export function generatePeers(seed: number, count = 8): Peer[] {
  const rand = mulberry32(seed)
  const peers: Peer[] = []
  for (let i = 0; i < count; i++) {
    peers.push({
      id: `peer_${seed}_${i}`,
      name: NAMES[Math.floor(rand() * NAMES.length)],
      avatar: AVATARS[Math.floor(rand() * AVATARS.length)],
      goal: GOALS[Math.floor(rand() * GOALS.length)],
      focusMinutes: Math.floor(rand() * 120) + 10,
      studying: rand() > 0.4,
    })
  }
  return peers
}

/** 生成好友榜单（含本周专注分钟） */
export function generateFriends(seed: number, count = 7): Friend[] {
  const rand = mulberry32(seed)
  const friends: Friend[] = []
  for (let i = 0; i < count; i++) {
    friends.push({
      id: `friend_${seed}_${i}`,
      name: NAMES[Math.floor(rand() * NAMES.length)],
      avatar: AVATARS[Math.floor(rand() * AVATARS.length)],
      weeklyMinutes: Math.floor(rand() * 600) + 60,
    })
  }
  return friends
}

/** 从 localStorage 读取或生成并持久化 seed */
export function getOrCreateSeed(
  getItem: (key: string, defaultValue: unknown) => unknown,
  setItem: (key: string, value: unknown) => void,
  key: string
): number {
  const saved = getItem(key, null)
  if (saved !== null && saved !== undefined) return Number(saved)
  const seed = Math.floor(Math.random() * 100000) + 1
  setItem(key, seed)
  return seed
}

export default { generatePeers, generateFriends, getOrCreateSeed }
