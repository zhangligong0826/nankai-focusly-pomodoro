/**
 * 数据导出工具（P1-8）
 * @module utils/export
 * @description JSON / CSV 导出，使用 Blob + URL.createObjectURL 下载；
 *   纯数据逻辑（载荷收集 / CSV 生成）抽离至 exportCore.ts 便于测试
 */
import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import { getTodayStr } from '@/utils/date'
import { idbGet } from '@/utils/indexedDB'
import { LS_KEY } from '@/utils/constants'
import { buildExportPayload, buildCheckinCSV, type GetItemFn } from './exportCore.ts'
import type { CheckinLike } from './statsAggregate.ts'

/** 触发浏览器下载 */
function download(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** 导出为 JSON 文件 */
export async function exportJSON(range: 'all' | 'month' = 'all'): Promise<boolean> {
  try {
    showToast('正在生成 JSON...', 'info', 1200)
    const storage = useLocalStorage()
    const checkins = await idbGet(LS_KEY.CHECKINS, [])
    const sessions = await idbGet(LS_KEY.SESSIONS, [])
    const getItem: GetItemFn = (key, def) => {
      if (key === LS_KEY.CHECKINS) return checkins
      if (key === LS_KEY.SESSIONS) return sessions
      return storage.getItem(key, def)
    }
    const data = buildExportPayload(getItem, range)
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

/** 导出打卡记录为 CSV */
export async function exportCSV(range: 'all' | 'month' = 'all'): Promise<boolean> {
  try {
    showToast('正在生成 CSV...', 'info', 1200)
    const checkins = (await idbGet(LS_KEY.CHECKINS, [])) as CheckinLike[]
    const list = Array.isArray(checkins) ? checkins : []
    const filtered =
      range === 'month'
        ? list.filter((c) => c && c.date && c.date.startsWith(getTodayStr().slice(0, 7)))
        : list
    const csv = buildCheckinCSV(filtered)
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
