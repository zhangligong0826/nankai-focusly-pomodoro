/**
 * IndexedDB 极简键值封装（Promise 化）。
 * @module utils/indexedDB
 * @description 用于存放「大块历史数据」（打卡记录、专注会话），
 *   突破 localStorage 5MB 上限。设置/任务等小数据仍走 localStorage。
 *   单库单 store，key 与 localStorage 的 LS_KEY 复用，读写接口对齐 useLocalStorage。
 *
 * 特性：
 * - 原生 IndexedDB API，零依赖
 * - 全程 Promise 化，失败返回默认值 / false，不抛异常
 * - SSR / 测试环境（无 window/indexedDB）安全降级为 no-op
 */

const DB_NAME = 'focusly'
const STORE_NAME = 'kv'
const DB_VERSION = 1

/** 是否具备 IndexedDB 环境 */
function isAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

/** 打开（或创建）数据库，单例缓存连接 */
let dbPromise: Promise<IDBDatabase | null> | null = null
function openDB(): Promise<IDBDatabase | null> {
  if (!isAvailable()) return Promise.resolve(null)
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve) => {
    let request: IDBOpenDBRequest
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION)
    } catch (_) {
      resolve(null)
      return
    }

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    request.onerror = () => {
      console.error('[IndexedDB] 打开数据库失败:', request.error)
      resolve(null)
    }
    request.onblocked = () => resolve(null)
  })

  return dbPromise
}

/** 读取并反序列化 */
export async function idbGet<T = unknown>(key: string, defaultValue: T = null as T): Promise<T> {
  const db = await openDB()
  if (!db) return defaultValue

  return new Promise((resolve) => {
    let tx: IDBTransaction
    try {
      tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () =>
        resolve(req.result === undefined ? defaultValue : (req.result as T))
      req.onerror = () => {
        console.error(`[IndexedDB] 读取 ${key} 失败:`, req.error)
        resolve(defaultValue)
      }
    } catch (_) {
      resolve(defaultValue)
    }
  })
}

/** 序列化并写入（值直接存，IndexedDB 支持结构化克隆） */
export async function idbSet(key: string, value: unknown): Promise<boolean> {
  const db = await openDB()
  if (!db) return false

  return new Promise((resolve) => {
    let tx: IDBTransaction
    try {
      tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(value, key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => {
        console.error(`[IndexedDB] 写入 ${key} 失败:`, tx.error)
        resolve(false)
      }
      tx.onabort = () => resolve(false)
    } catch (_) {
      resolve(false)
    }
  })
}

/** 删除指定 key */
export async function idbRemove(key: string): Promise<boolean> {
  const db = await openDB()
  if (!db) return false

  return new Promise((resolve) => {
    let tx: IDBTransaction
    try {
      tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(key)
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => resolve(false)
    } catch (_) {
      resolve(false)
    }
  })
}

export default { idbGet, idbSet, idbRemove, openDB }
