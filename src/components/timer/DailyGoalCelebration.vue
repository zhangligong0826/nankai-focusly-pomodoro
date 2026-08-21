/**
 * 每日目标达成庆祝弹窗（P1-7）
 * @module components/timer/DailyGoalCelebration
 * @description 今日番茄数 ≥ dailyGoal 时触发彩带庆祝，每日仅弹一次
 */
<script setup>
import { ref, computed, watch } from 'vue'
import { useTimerStore } from '@/stores/timer'
import { useCheckinStore } from '@/stores/checkin'
import { useSettingsStore } from '@/stores/settings'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const timerStore = useTimerStore()
const checkinStore = useCheckinStore()
const settingsStore = useSettingsStore()

const visible = ref(false)

watch(
  () => timerStore.celebrationTrigger,
  (n, old) => {
    if (n > (old || 0)) {
      visible.value = true
    }
  }
)

/** 每日目标（响应式） */
const goal = computed(() => settingsStore.settings.dailyGoal)
</script>

<template>
  <BaseModal :visible="visible" :mask-closable="false" width="420px" @close="visible = false">
    <div class="celebration">
      <div class="confetti-layer" aria-hidden="true">
        <span v-for="n in 24" :key="n" class="confetti" :style="{ '--i': n }"></span>
      </div>
      <div class="celebration-emoji" aria-hidden="true">🎉</div>
      <h2 class="celebration-title">太棒了！今日目标达成</h2>
      <p class="celebration-desc">
        今日已完成 {{ checkinStore.todayPomodoroCount }} 个番茄，达成目标 {{ goal.value }} 个
      </p>
      <p class="celebration-streak" v-if="checkinStore.streak > 1">
        已连续打卡 {{ checkinStore.streak }} 天，保持下去！
      </p>
    </div>
    <template #footer>
      <BaseButton type="primary" block @click="visible = false">继续加油</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.celebration {
  text-align: center;
  position: relative;
  padding: var(--spacing-md) 0;
}
.celebration-emoji {
  font-size: 56px;
  margin-bottom: var(--spacing-md);
}
.celebration-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-primary-text);
  margin-bottom: var(--spacing-sm);
}
.celebration-desc {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: 1.6;
}
.celebration-streak {
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-warning-text);
}
.confetti-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.confetti {
  position: absolute;
  top: -10px;
  left: calc(50% + (var(--i) - 12) * 12px);
  width: 8px;
  height: 14px;
  background-color: var(--color-primary);
  opacity: 0.8;
  animation: confetti-fall 2.2s ease-out forwards;
  animation-delay: calc(var(--i) * 0.04s);
}
.confetti:nth-child(3n) {
  background-color: var(--color-success);
}
.confetti:nth-child(3n + 1) {
  background-color: var(--color-info);
}
.confetti:nth-child(5n) {
  background-color: var(--color-warning);
}
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(320px) rotate(540deg);
    opacity: 0;
  }
}
</style>
