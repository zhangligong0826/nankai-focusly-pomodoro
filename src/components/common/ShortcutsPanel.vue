/**
 * 快捷键帮助面板（P2）
 * @module components/common/ShortcutsPanel
 * @description BaseModal 内嵌快捷键表格，按 ? 唤起
 */
<script setup>
import BaseModal from '@/components/common/BaseModal.vue'

defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const shortcuts = [
  { keys: 'Space', desc: '开始 / 暂停计时' },
  { keys: 'Ctrl + P', desc: '紧急暂停专注（Mac 为 Cmd + P）' },
  { keys: 'Ctrl + N', desc: '新建任务（Mac 为 Cmd + N）' },
  { keys: '1 / 2 / 3', desc: '切换 Tab（计时 / 任务 / 统计）' },
  { keys: '?', desc: '显示 / 隐藏本帮助面板' },
]
</script>

<template>
  <BaseModal
    :visible="visible"
    title="快捷键帮助"
    width="420px"
    @close="emit('close')"
  >
    <table class="shortcuts-table">
      <thead>
        <tr>
          <th>快捷键</th>
          <th>功能</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in shortcuts" :key="s.keys">
          <td><kbd class="kbd">{{ s.keys }}</kbd></td>
          <td>{{ s.desc }}</td>
        </tr>
      </tbody>
    </table>
  </BaseModal>
</template>

<style scoped>
.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.shortcuts-table th,
.shortcuts-table td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border-light);
  color: var(--color-text);
}
.shortcuts-table th {
  color: var(--color-text-secondary);
  font-weight: 600;
}
.kbd {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  font-family: inherit;
  font-size: var(--font-size-xs);
  color: var(--color-text);
}
</style>
