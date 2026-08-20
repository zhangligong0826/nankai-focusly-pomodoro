/**
 * 数据导出面板（P1-8）
 * @module components/settings/DataExportPanel
 * @description 导出 JSON / CSV，范围选择（全部/本月）
 */
<script setup>
import { ref } from 'vue'
import { exportJSON, exportCSV } from '@/utils/export'
import BaseButton from '@/components/common/BaseButton.vue'

const range = ref('all')

function doJSON() {
  exportJSON(range.value)
}
function doCSV() {
  exportCSV(range.value)
}
</script>

<template>
  <div class="export-panel">
    <div class="range-select">
      <label class="range-label">导出范围</label>
      <select v-model="range" class="range-input">
        <option value="all">全部数据</option>
        <option value="month">本月数据</option>
      </select>
    </div>
    <div class="export-buttons">
      <BaseButton type="secondary" @click="doJSON">导出 JSON</BaseButton>
      <BaseButton type="secondary" @click="doCSV">导出 CSV</BaseButton>
    </div>
    <p class="export-tip text-tertiary">
      数据将从本地存储导出，含任务、打卡、专注会话与设置。
    </p>
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
