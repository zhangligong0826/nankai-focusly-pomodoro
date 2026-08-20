/**
 * SVG 环形进度条
 * @module components/timer/CircularProgress
 * @description 双 circle（底环 + 进度环），stroke-dasharray/dashoffset 动画
 */
<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: { type: Number, default: 0 }, // 0-1
  size: { type: Number, default: 260 },
  strokeWidth: { type: Number, default: 12 },
  color: { type: String, default: 'var(--color-primary)' },
  trackColor: { type: String, default: 'var(--color-bg-secondary)' },
})

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const p = Math.min(1, Math.max(0, props.progress))
  return circumference.value * (1 - p)
})
const center = computed(() => props.size / 2)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="circular-progress"
  >
    <!-- 底环 -->
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      :stroke="trackColor"
      :stroke-width="strokeWidth"
      fill="none"
    />
    <!-- 进度环 -->
    <circle
      :cx="center"
      :cy="center"
      :r="radius"
      :stroke="color"
      :stroke-width="strokeWidth"
      fill="none"
      stroke-linecap="round"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="dashOffset"
      :transform="`rotate(-90 ${center} ${center})`"
      class="progress-ring"
    />
  </svg>
</template>

<style scoped>
.circular-progress {
  display: block;
}
.progress-ring {
  transition: stroke-dashoffset var(--transition-base), stroke var(--transition-base);
}
</style>
