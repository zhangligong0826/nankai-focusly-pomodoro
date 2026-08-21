/**
 * Toast 全局提示
 * @module components/common/BaseToast
 * @description 订阅 useToast 单例 toasts 渲染，3s 自动消失，支持多个堆叠
 */
<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const typeClass = (type) => `toast--${type}`
const typeIcon = (type) => {
  const map = { success: '✓', error: '✕', warning: '!', info: 'i' }
  return map[type] || 'i'
}
</script>

<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="typeClass(t.type)"
      :role="t.type === 'error' ? 'alert' : 'status'"
      :aria-live="t.type === 'error' ? 'assertive' : 'polite'"
      @click="removeToast(t.id)"
    >
      <span class="toast-icon" aria-hidden="true">{{ typeIcon(t.type) }}</span>
      <span class="toast-msg">{{ t.message }}</span>
      <button class="toast-close" aria-label="关闭提示" @click.stop="removeToast(t.id)">×</button>
    </div>
  </TransitionGroup>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-md);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  pointer-events: auto;
  cursor: pointer;
  min-width: 200px;
  max-width: 90vw;
}
.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.toast--success .toast-icon {
  background-color: var(--color-success);
}
.toast--error .toast-icon {
  background-color: var(--color-error);
}
.toast--warning .toast-icon {
  background-color: var(--color-warning);
}
.toast--info .toast-icon {
  background-color: var(--color-info);
}
.toast--success {
  border-left: 3px solid var(--color-success);
}
.toast--error {
  border-left: 3px solid var(--color-error);
}
.toast--warning {
  border-left: 3px solid var(--color-warning);
}
.toast--info {
  border-left: 3px solid var(--color-info);
}
.toast-msg {
  flex: 1;
  min-width: 0;
}
.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  font-size: 16px;
  line-height: 1;
  color: var(--color-text-tertiary);
  transition: background-color var(--transition-fast), color var(--transition-fast);
}
.toast-close:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-base);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
