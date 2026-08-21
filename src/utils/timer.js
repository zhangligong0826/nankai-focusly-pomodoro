/**
 * 计时器纯状态转换与剩余时间计算。
 *
 * deadline 模式核心：
 * - 计时不再依赖 setInterval 每秒减一（后台标签页会被浏览器节流导致漂移），
 *   而是记录「绝对截止时间戳」deadlineAt，任意时刻用 Date.now() 反推剩余秒数。
 * - 纯函数便于 node --test 直接验证，不依赖 DOM / Pinia。
 */

/**
 * 兼容旧接口：递减倒计时。
 * 在归零的 tick 内标记完成，避免 UI 在 00:00 额外停留一个 interval。
 * @deprecated 计时主路径已改用 deadline 模式，此函数保留以兼容旧测试/调用。
 * @param {number} remainingSeconds
 * @returns {{ remainingSeconds: number, completed: boolean }}
 */
export function advanceCountdown(remainingSeconds) {
  const current = Math.max(0, Number(remainingSeconds) || 0)
  const next = Math.max(0, current - 1)
  return { remainingSeconds: next, completed: next === 0 }
}

/**
 * 根据截止时间戳计算剩余秒数（向上取整，保证显示 1 秒内不提前归零）。
 * @param {number} deadlineAt - 绝对截止时间戳（毫秒）
 * @param {number} [now=Date.now()] - 当前时间戳，测试时可注入
 * @returns {number} 剩余秒数，最小为 0
 */
export function computeRemaining(deadlineAt, now = Date.now()) {
  if (!Number.isFinite(deadlineAt)) return 0
  return Math.max(0, Math.ceil((deadlineAt - now) / 1000))
}

/**
 * 计算「从某截止时间戳开始，剩余 N 秒」对应的新截止时间戳。
 * @param {number} remainingSeconds - 剩余秒数
 * @param {number} [now=Date.now()] - 当前时间戳
 * @returns {number} 新的截止时间戳
 */
export function computeDeadline(remainingSeconds, now = Date.now()) {
  const seconds = Math.max(0, Number(remainingSeconds) || 0)
  return now + seconds * 1000
}

export default { advanceCountdown, computeRemaining, computeDeadline }
