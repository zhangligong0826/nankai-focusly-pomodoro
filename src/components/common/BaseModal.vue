/**
 * 模态弹窗
 * @module components/common/BaseModal
 * @description props(visible/title/maskClosable/escClosable)，Esc 关闭、遮罩点击关闭、Transition 动画
 */
<script setup>
import { watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maskClosable: { type: Boolean, default: true },
  escClosable: { type: Boolean, default: true },
  width: { type: String, default: '480px' },
})

const emit = defineEmits(['close', 'update:visible'])

function close() {
  emit('update:visible', false)
  emit('close')
}

function onMaskClick() {
  if (props.maskClosable) close()
}

function onEsc(e) {
  if (props.escClosable && props.visible && e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onEsc))
onUnmounted(() => window.removeEventListener('keydown', onEsc))

// 锁定背景滚动
watch(
  () => props.visible,
  (v) => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = v ? 'hidden' : ''
    }
  }
)
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-mask" @click.self="onMaskClick">
      <div class="modal-content" :style="{ maxWidth: width }" role="dialog" aria-modal="true">
        <div class="modal-header" v-if="title || $slots.header">
          <slot name="header">
            <h3 class="modal-title">{{ title }}</h3>
          </slot>
          <button class="modal-close" aria-label="关闭" @click="close">×</button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer" v-if="$slots.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  inset: 0;
  background-color: var(--color-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
}
.modal-content {
  width: 100%;
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}
.modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}
.modal-close {
  width: 32px;
  height: 32px;
  font-size: 22px;
  line-height: 1;
  color: var(--color-text-tertiary);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}
.modal-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
}
.modal-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
