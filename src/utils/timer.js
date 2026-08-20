/**
 * 计时器纯状态转换。
 * 在归零的 tick 内标记完成，避免 UI 在 00:00 额外停留一个 interval。
 */
export function advanceCountdown(remainingSeconds) {
  const current = Math.max(0, Number(remainingSeconds) || 0)
  const next = Math.max(0, current - 1)
  return { remainingSeconds: next, completed: next === 0 }
}

export default { advanceCountdown }
