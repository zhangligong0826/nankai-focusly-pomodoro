/**
 * 连续打卡徽章（P1-6）
 * @module components/stats/StreakBadge
 * @description 火焰图标 + "连续打卡 N 天"，7/14/30 天里程碑鼓励文案
 */
<script setup>
import { computed } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { STREAK_MILESTONES } from '@/utils/constants'

const statsStore = useStatsStore()

const streak = computed(() => statsStore.summary.currentStreak || 0)
const longest = computed(() => statsStore.summary.longestStreak || 0)

const encouragement = computed(() => {
  const s = streak.value
  if (s === 0) return '开始你的第一次专注吧！'
  if (s < 3) return '好的开始！继续保持～'
  if (s < 7) return '坚持 3 天啦，养成习惯中！'
  if (s < 14) return '一周打卡达成，真厉害！'
  if (s < 30) return '两周连续打卡，自律达人！'
  if (s < 60) return '满月打卡！你太棒了！'
  if (s < 100) return '两月连续打卡，毅力惊人！'
  return '百日打卡传奇！🎉'
})

const flameLevel = computed(() => {
  const s = streak.value
  if (s === 0) return 0
  if (s < 7) return 1
  if (s < 14) return 2
  if (s < 30) return 3
  return 4
})
</script>

<template>
  <div class="streak-badge card" :class="`flame-level-${flameLevel}`">
    <div class="flame" aria-hidden="true">
      <span class="flame-emoji">🔥</span>
    </div>
    <div class="streak-body">
      <div class="streak-count">
        连续打卡 <strong>{{ streak }}</strong> 天
      </div>
      <div class="streak-encouragement">{{ encouragement }}</div>
      <div class="streak-longest text-tertiary" v-if="longest > streak">
        最长记录 {{ longest }} 天
      </div>
    </div>
  </div>
</template>

<style scoped>
.streak-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}
.flame {
  font-size: 48px;
  animation: flame-flicker 1.6s ease-in-out infinite alternate;
}
.flame-level-0 .flame { filter: grayscale(1); opacity: 0.5; }
.flame-level-1 .flame { font-size: 40px; }
.flame-level-2 .flame { font-size: 48px; }
.flame-level-3 .flame { font-size: 56px; }
.flame-level-4 .flame { font-size: 64px; }
@keyframes flame-flicker {
  0% { transform: scale(1) rotate(-2deg); }
  100% { transform: scale(1.08) rotate(2deg); }
}
.streak-count {
  font-size: var(--font-size-xl);
  color: var(--color-text);
}
.streak-count strong {
  color: var(--color-warning);
  font-size: var(--font-size-2xl);
}
.streak-encouragement {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}
.streak-longest {
  font-size: var(--font-size-xs);
  margin-top: var(--spacing-xs);
}
</style>
