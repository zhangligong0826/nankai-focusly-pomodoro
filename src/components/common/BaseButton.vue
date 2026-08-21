/**
 * 按钮组件
 * @module components/common/BaseButton
 * @description props(type/size/disabled/loading)，hover 缩放反馈
 */
<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'danger', 'ghost', 'success'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  nativeType: { type: String, default: 'button' },
})

const emit = defineEmits(['click'])

function onClick(e) {
  if (props.disabled || props.loading) return
  emit('click', e)
}
</script>

<template>
  <button
    :type="nativeType"
    class="base-btn"
    :class="[`base-btn--${type}`, `base-btn--${size}`, { 'is-block': block, 'is-disabled': disabled || loading }]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span v-if="loading" class="base-btn-loading" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: transform var(--transition-fast), background-color var(--transition-fast), opacity var(--transition-fast);
  white-space: nowrap;
}
.base-btn:hover:not(.is-disabled) {
  transform: scale(1.03);
}
.base-btn:active:not(.is-disabled) {
  transform: scale(0.97);
}
.base-btn--sm {
  padding: 4px 12px;
  font-size: var(--font-size-sm);
}
.base-btn--md {
  padding: 8px 18px;
  font-size: var(--font-size-md);
}
.base-btn--lg {
  padding: 12px 28px;
  font-size: var(--font-size-lg);
}
.is-block {
  width: 100%;
}
.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.base-btn--primary {
  background-color: var(--color-action);
  color: var(--color-text-inverse);
}
.base-btn--primary:hover:not(.is-disabled) {
  background-color: var(--color-action-hover);
}
.base-btn--secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
.base-btn--secondary:hover:not(.is-disabled) {
  background-color: var(--color-border);
}
/* 危险操作：描边样式，与实心主 CTA 形成形状差异（颜色不是唯一区分手段） */
.base-btn--danger {
  background-color: transparent;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}
.base-btn--danger:hover:not(.is-disabled) {
  background-color: var(--color-error-light);
}
.base-btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}
.base-btn--ghost:hover:not(.is-disabled) {
  background-color: var(--color-bg-secondary);
}
.base-btn--success {
  background-color: var(--color-success-text);
  color: var(--color-text-inverse);
}
.base-btn--success:hover:not(.is-disabled) {
  background-color: var(--color-success-hover);
}
.base-btn-loading {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: btn-spin 0.6s linear infinite;
}
@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
