/**
 * 数据导出/导入面板（P1-8）
 * @module components/settings/DataExportPanel
 * @description 导出 JSON / CSV，范围选择（全部/本月）；导入 JSON 恢复数据（校验版本 + 二次确认）
 */
<script setup>
import { ref } from 'vue'
import { exportJSON, exportCSV } from '@/utils/export'
import { EXPORT_VERSION } from '@/utils/exportCore'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { showToast } from '@/composables/useToast'
import { idbSet } from '@/utils/indexedDB'
import { useTaskStore } from '@/stores/task'
import { useCheckinStore } from '@/stores/checkin'
import { useSettingsStore } from '@/stores/settings'
import { LS_KEY, DEFAULT_TIMER_CONFIG, DEFAULT_SETTINGS } from '@/utils/constants'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const range = ref('all')
const fileInput = ref(null)
const pendingImport = ref(null)
const showConfirm = ref(false)

const storage = useLocalStorage()
const taskStore = useTaskStore()
const checkinStore = useCheckinStore()
const settingsStore = useSettingsStore()

function doJSON() {
  exportJSON(range.value)
}
function doCSV() {
  exportCSV(range.value)
}

/**
 * 触发文件选择
 */
function triggerImport() {
  fileInput.value && fileInput.value.click()
}

/**
 * 校验导入数据格式
 * @param {object} data
 * @returns {string|null} 错误信息，null 表示通过
 */
function validateImport(data) {
  if (!data || typeof data !== 'object') return '文件格式错误'
  if (data.version !== EXPORT_VERSION) return '不兼容的数据版本，请使用同版本导出的文件'
  if (data.tasks !== undefined && !Array.isArray(data.tasks)) return '任务数据格式错误'
  if (data.checkins !== undefined && !Array.isArray(data.checkins)) return '打卡数据格式错误'
  return null
}

/**
 * 处理文件选择
 * @param {Event} e
 */
function handleFileImport(e) {
  const file = e.target.files && e.target.files[0]
  e.target.value = '' // 允许重复选择同一文件
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result)
      const err = validateImport(data)
      if (err) {
        showToast(err, 'error')
        return
      }
      // 二次确认后写入
      pendingImport.value = data
      showConfirm.value = true
    } catch (_) {
      showToast('文件解析失败，请确认是合法的 JSON', 'error')
    }
  }
  reader.onerror = () => showToast('文件读取失败', 'error')
  reader.readAsText(file)
}

/**
 * 确认导入：写入存储 + 刷新 stores
 */
async function doImport() {
  const data = pendingImport.value
  pendingImport.value = null
  if (!data) return

  const timerConfig = { ...DEFAULT_TIMER_CONFIG, ...(data.timerConfig || {}) }
  const settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) }

  storage.setItem(LS_KEY.TIMER_CONFIG, timerConfig)
  storage.setItem(LS_KEY.SETTINGS, settings)
  storage.setItem(LS_KEY.TASKS, data.tasks || [])
  if (data.garden !== undefined) storage.setItem(LS_KEY.GARDEN, data.garden)
  // 打卡/会话历史迁入 IndexedDB
  await idbSet(LS_KEY.CHECKINS, data.checkins || [])
  if (data.sessions !== undefined) await idbSet(LS_KEY.SESSIONS, data.sessions)

  // 刷新内存状态
  settingsStore.config = timerConfig
  settingsStore.settings = settings
  settingsStore.applyTheme()
  taskStore.tasks = data.tasks || []
  checkinStore.checkins = data.checkins || []
  checkinStore.refreshToday()

  showToast('数据导入成功', 'success')
}

function cancelImport() {
  pendingImport.value = null
}
</script>

<template>
  <div class="export-panel">
    <div class="range-select">
      <label class="range-label" for="export-range">导出范围</label>
      <select id="export-range" v-model="range" class="range-input">
        <option value="all">全部数据</option>
        <option value="month">本月数据</option>
      </select>
    </div>
    <div class="export-buttons">
      <BaseButton type="secondary" @click="doJSON">导出 JSON</BaseButton>
      <BaseButton type="secondary" @click="doCSV">导出 CSV</BaseButton>
      <BaseButton type="secondary" @click="triggerImport">导入数据</BaseButton>
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        style="display: none"
        @change="handleFileImport"
      />
    </div>
    <p class="export-tip text-tertiary">
      数据将从本地存储导出，含任务、打卡、专注会话与设置；导入会覆盖现有本地数据。
    </p>

    <ConfirmDialog
      :visible="showConfirm"
      title="确认导入"
      message="导入将覆盖当前本地数据（任务、打卡、设置等），此操作不可撤销。确定继续吗？"
      confirm-text="确认导入"
      cancel-text="取消"
      confirm-type="danger"
      @confirm="doImport"
      @cancel="cancelImport"
    />
  </div>
</template>

<style scoped>
.export-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.range-select {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.range-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.range-input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-md);
}
.export-buttons {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.export-tip {
  font-size: var(--font-size-xs);
}
</style>
