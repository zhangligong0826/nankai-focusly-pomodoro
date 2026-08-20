/**
 * 空状态占位
 * @module components/common/EmptyState
 * @description props(image/text/actionText)，slot action
 */
<script setup>
defineProps({
  image: { type: String, default: '' },
  text: { type: String, default: '暂无数据' },
  actionText: { type: String, default: '' },
})
const emit = defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-image">
      <img v-if="image" :src="image" alt="" loading="lazy" width="120" height="120" />
      <svg v-else width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 13h6M9 17h3" />
      </svg>
    </div>
    <p class="empty-text">{{ text }}</p>
    <div class="empty-action" v-if="actionText || $slots.action">
      <slot name="action">
        <button v-if="actionText" class="empty-btn" @click="emit('action')">{{ actionText }}</button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  color: var(--color-text-tertiary);
}
.empty-image {
  color: var(--color-border);
  margin-bottom: var(--spacing-md);
}
.empty-text {
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
}
.empty-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.empty-btn:hover {
  background-color: var(--color-primary-hover);
}
</style>
