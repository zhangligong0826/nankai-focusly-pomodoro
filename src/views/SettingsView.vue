/**
 * 设置页
 * @module views/SettingsView
 * @description 整合 SettingsPanel（含计时配置/主题/白噪音/目标/数据导出）
 */
<script setup>
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
</script>

<template>
  <div class="settings-view">
    <h2 class="page-title">设置</h2>
    <SettingsPanel />
  </div>
</template>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.page-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}
</style>
