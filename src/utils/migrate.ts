/**
 * 旧数据迁移：将 localStorage 中的大块历史数据（打卡、会话）迁入 IndexedDB。
 * @module utils/migrate
 * @description 一次性迁移：读取 localStorage 旧数据 → 写入 IndexedDB → 删除旧 key。
 *   幂等（迁移后 localStorage 已无旧 key，不会重复迁移）。
 */

import { LS_KEY } from './constants.ts'
import { idbGet, idbSet } from './indexedDB.ts'

/**
 * 迁移目标：大块历史数据（体积随时间线性增长）
 */
const MIGRATE_KEYS = [LS_KEY.CHECKINS, LS_KEY.SESSIONS]

/** 执行迁移。幂等、失败静默（下次启动重试） */
export async function migrateLegacyData(): Promise<void> {
  for (const key of MIGRATE_KEYS) {
    try {
      // localStorage 已无旧数据 → 跳过
      const raw = localStorage.getItem(key)
      if (raw === null) continue

      const parsed = JSON.parse(raw)
      // IndexedDB 已有数据 → 以 IndexedDB 为准，仅删除旧 key
      const existing = await idbGet(key, null)
      if (existing === null) {
        await idbSet(key, parsed)
      }
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`[migrate] 迁移 ${key} 失败:`, e)
    }
  }
}

export default { migrateLegacyData, MIGRATE_KEYS }
