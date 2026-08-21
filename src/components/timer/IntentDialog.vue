/**
 * 专注意图输入弹窗（P1-3）
 * @module components/timer/IntentDialog
 * @description 开始专注前可选填写本次目标，确认后开始计时；可跳过
 */
<script setup>
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'confirm'])

const text = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) text.value = ''
  }
)

function onConfirm() {
  emit('confirm', text.value.trim())
}
function onSkip() {
  emit('confirm', '')
}
</script>

<template>
  <BaseModal
    :visible="visible"
    title="这次专注想达成什么？"
    :mask-closable="false"
    width="420px"
    @close="emit('close')"
  >
    <p class="intent-hint text-tertiary">
      写下一个小目标，专注更有方向（可选）
    </p>
    <input
      v-model="text"
      class="intent-input"
      type="text"
      maxlength="100"
      placeholder="如：读完第三章 / 写完文献综述引言"
      @keydown.enter.prevent="onConfirm"
    />
    <template #footer>
      <BaseButton type="ghost" @click="onSkip">跳过</BaseButton>
      <BaseButton type="primary" @click="onConfirm">开始专注</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.intent-hint {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}
.intent-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-md);
  transition: border-color var(--transition-fast);
}
.intent-input:focus {
  border-color: var(--color-primary);
}
</style>
