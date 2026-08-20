/**
 * 数据导出工具（P1-8）
 * @module utils/export
 * @description JSON / CSV 导出，使用 Blob + URL.createObjectURL 下载；
 *   纯数据逻辑（载荷收集 / CSV 生成）抽离至 exportCore.js 便于测试
 */

import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import { getTodayStr } from '@/utils/date'
import { buildExportPayload, buildCheckinCSV } from './exportCore'

/**
 * 触发浏览器下载
 * @param {string} filename - 文件名
 * @param {string} content - 文件内容
 * @param {string} [mime='text/plain'] - MIME 类型
 */
function download(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // 释放 URL
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * 导出为 JSON 文件
 * @param {'all'|'month'} [range='all']
 * @returns {boolean} 是否成功
 */
export function exportJSON(range = 'all') {
  try {
    showToast('正在生成 JSON...', 'info', 1200)
    const storage = useLocalStorage()
    const data = buildExportPayload((key, def) => storage.getItem(key, def), range)
    const json = JSON.stringify(data, null, 2)
    const date = getTodayStr()
    download(`focusly_export_${date}.json`, json, 'application/json')
    showToast('导出成功', 'success')
    return true
  } catch (e) {
    console.error('[export] JSON 导出失败:', e)
    showToast('导出失败，请重试', 'error')
    return false
  }
}

/**
 * 导出打卡记录为 CSV
 * @param {'all'|'month'} [range='all']
 * @returns {boolean} 是否成功
 */
export function exportCSV(range = 'all') {
  try {
    showToast('正在生成 CSV...', 'info', 1200)
    const storage = useLocalStorage()
    const { checkins } = buildExportPayload((key, def) => storage.getItem(key, def), range)
    const csv = buildCheckinCSV(checkins)
    // 加 BOM 以便 Excel 正确识别 UTF-8
    const bom = '\uFEFF'
    const date = getTodayStr()
    download(`focusly_checkin_${date}.csv`, bom + csv, 'text/csv')
    showToast('导出成功', 'success')
    return true
  } catch (e) {
    console.error('[export] CSV 导出失败:', e)
    showToast('导出失败，请重试', 'error')
    return false
  }
}

export default { exportJSON, exportCSV, download }
