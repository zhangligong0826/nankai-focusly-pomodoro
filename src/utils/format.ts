/**
 * 格式化工具 - 时长 / 数字 / 时间
 * @module utils/format
 */

/** 分钟数 → "Xh Ymin" 可读时长（如 85 → "1h 25min"，25 → "25min"） */
export function minutesToHHMM(minutes: number): string {
  if (!minutes || minutes < 0) return '0min'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m}min`
}

/** 分钟数 → "X小时Y分钟" 中文时长 */
export function minutesToChinese(minutes: number): string {
  if (!minutes || minutes < 0) return '0 分钟'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h} 小时 ${m} 分钟`
  if (h > 0) return `${h} 小时`
  return `${m} 分钟`
}

/** 秒数 → "MM:SS" 倒计时显示（如 1500 → "25:00"） */
export function secondsToMMSS(seconds: number): string {
  if (!seconds || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 数字千分位格式化（如 1234567 → "1,234,567"） */
export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return '0'
  return Number(n).toLocaleString('en-US')
}

/** 秒数 → 时长中文描述（用于统计 hover） */
export function secondsToHuman(seconds: number): string {
  return minutesToChinese(Math.round((seconds || 0) / 60))
}

export default {
  minutesToHHMM,
  minutesToChinese,
  secondsToMMSS,
  formatNumber,
  secondsToHuman,
}
