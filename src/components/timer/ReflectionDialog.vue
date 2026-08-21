/**
 * 专注反思弹窗（P1-3）
 * @module components/timer/ReflectionDialog
 * @description 专注正常完成后弹反思：目标达成度打分（1-5）+ 反思文字，写回 session
 */
<script setup>
import { ref, computed } from 'vue'
import { useTimerStore } from '@/stores/timer'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const store = useTimerStore()

const rating = ref(0)
const text = ref('')

const visible = computed({
  get: () => !!store.pendingReflectionId,
  set: (v) => {
    if (!v) store.dismissReflection()
  },
})

const starLabels = ['', '很差', '欠佳', '一般', '不错', '很专注']

function submit() {
  store.saveReflection(rating.value || null, text.value)
  rating.value = 0
  text.value = ''
}
function skip() {
  store.dismissReflection()
  rating.value = 0
  text.value = ''
}
</script>

<template>
  <BaseModal
    :visible="visible"
    title="本次专注感觉如何？"
    :mask-closable="false"
    width="420px"
    @close="skip"
  >
    <p class="reflect-hint text-tertiary">给刚才的专注打个分，帮助自己回顾</p>

    <div class="star-row" role="radiogroup" aria-label="专注达成度评分">
      <button
        v-for="n in 5"
        :key="n"
        class="star"
        :class="{ 'star--active': n <= rating }"
        role="radio"
        :aria-checked="rating === n"
        :aria-label="starLabels[n]"
        @click="rating = n"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" :fill="n <= rating ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    </div>

    <textarea
      v-model="text"
      class="reflect-input"
      rows="3"
      maxlength="200"
      placeholder="简单记两句：专注中有什么干扰？下次怎么改进？（可选）"
    ></textarea>

    <template #footer>
      <BaseButton type="ghost" @click="skip">跳过</BaseButton>
      <BaseButton type="primary" @click="submit">保存反思</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.reflect-hint {
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-md);
}
.star-row {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: center;
  margin-bottom: var(--spacing-md);
}
.star {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-target-min);
  height: var(--touch-target-min);
  color: var(--color-border);
  transition: color var(--transition-fast), transform var(--transition-fast);
}
.star:hover {
  transform: scale(1.1);
}
.star--active {
  color: var(--color-warning);
}
.reflect-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-md);
  resize: vertical;
  min-height: 72px;
}
.reflect-input:focus {
  border-color: var(--color-primary);
}
</style>
