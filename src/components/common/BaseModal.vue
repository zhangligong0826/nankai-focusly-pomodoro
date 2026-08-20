/**
 * 模态弹窗
 * @module components/common/BaseModal
 * @description props(visible/title/maskClosable/escClosable)，Esc 关闭、遮罩点击关闭、Transition 动画
 */
<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maskClosable: { type: Boolean, default: true },
  escClosable: { type: Boolean, default: true },
  width: { type: String, default: '480px' },
})

const emit = defineEmits(['close', 'update:visible'])

/** 弹窗内容容器（用于焦点管理） */
const contentRef = ref(null)
/** 打开弹窗前获得焦点的元素（关闭时恢复） */
let previouslyFocused = null

/** 可聚焦元素选择器 */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * 获取弹窗内当前可聚焦元素
 * @returns {HTMLElement[]}
 */
function getFocusable() {
  const el = contentRef.value
  if (!el) return []
  return Array.from(el.querySelectorAll(FOCUSABLE_SELECTOR))
}

function close() {
  emit('update:visible', false)
  emit('close')
}

function onMaskClick() {
  if (props.maskClosable) close()
}

function onEsc() {
  if (props.escClosable && props.visible) close()
}

/**
 * 键盘处理：Esc 关闭 + Tab 焦点循环（Focus Trap）
 */
function onKeydown(e) {
  if (e.key === 'Escape') {
    onEsc()
    return
  }
  if (e.key !== 'Tab') return
  const focusable = getFocusable()
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  // 焦点在最后一个元素（或已移出弹窗）时，Tab 回到第一个
  if (e.shiftKey && (active === first || !contentRef.value.contains(active))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (active === last || !contentRef.value.contains(active))) {
    e.preventDefault()
    first.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// 锁定背景滚动 + 焦点移入/恢复
watch(
  () => props.visible,
  (v) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = v ? 'hidden' : ''
    if (v) {
      previouslyFocused = document.activeElement
      nextTick(() => {
        const el = contentRef.value
        if (!el) return
        // 优先聚焦第一个可交互元素，否则聚焦容器本身
        const target = getFocusable()[0] || el
        target.focus()
      })
    } else if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      // 关闭时恢复焦点到触发按钮
      previouslyFocused.focus()
      previouslyFocused = null
    }
  }
)
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-mask" aria-modal="true" @click.self="onMaskClick">
      <div ref="contentRef" class="modal-content" :style="{ maxWidth: width }" role="dialog" tabindex="-1">
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
