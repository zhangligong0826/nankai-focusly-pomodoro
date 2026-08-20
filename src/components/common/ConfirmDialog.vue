/**
 * 二次确认对话框
 * @module components/common/ConfirmDialog
 * @description props(visible/title/message/confirmText/cancelText)，emit confirm/cancel
 */
<script setup>
import BaseButton from './BaseButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '' },
  confirmText: { type: String, default: '确认' },
  cancelText: { type: String, default: '取消' },
  confirmType: { type: String, default: 'danger' },
})

const emit = defineEmits(['confirm', 'cancel', 'update:visible'])

function onConfirm() {
  emit('confirm')
  emit('update:visible', false)
}
function onCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<template>
  <BaseModal
    :visible="visible"
    :title="title"
    width="400px"
    @close="onCancel"
  >
    <p class="confirm-message">{{ message }}</p>
    <template #footer>
      <BaseButton type="ghost" @click="onCancel">{{ cancelText }}</BaseButton>
      <BaseButton :type="confirmType" @click="onConfirm">{{ confirmText }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.confirm-message {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: 1.6;
}
</style>
