/**
 * 每日专注金句卡片（P1-5）
 * @module components/timer/DailyQuote
 * @description 按日期取模轮换金句，展示在计时页，营造氛围
 */
<script setup>
import { computed } from 'vue'
import { DAILY_QUOTES } from '@/utils/constants'
import { getTodayStr } from '@/utils/date'

const quote = computed(() => {
  const today = getTodayStr()
  // 用日期字符串转成稳定哈希，按天数取模轮换
  const hash = [...today].reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return DAILY_QUOTES[hash % DAILY_QUOTES.length]
})
</script>

<template>
  <div class="daily-quote">
    <span class="quote-mark" aria-hidden="true">「</span>
    <p class="quote-text">{{ quote }}</p>
  </div>
</template>

<style scoped>
.daily-quote {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
}
.quote-mark {
  color: var(--color-primary-text);
  font-size: var(--font-size-lg);
  font-weight: 700;
}
.quote-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
}
</style>
