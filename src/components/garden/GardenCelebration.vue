/**
 * 养成物品种解锁庆祝弹窗（P1-1）
 * @module components/garden/GardenCelebration
 * @description 连续打卡达标解锁新品种时触发，展示新品种 + 彩带
 */
<script setup>
import { ref, computed, watch } from 'vue'
import { useGardenStore } from '@/stores/garden'
import { GARDEN_SPECIES } from '@/utils/constants'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import GardenPlant from './GardenPlant.vue'

const garden = useGardenStore()

const visible = ref(false)

watch(
  () => garden.unlockTrigger,
  (n, old) => {
    if (n > (old || 0)) {
      visible.value = true
    }
  }
)

/** 最新解锁的品种（unlocked 列表最后一个） */
const newSpecies = computed(() => {
  const id = garden.unlocked[garden.unlocked.length - 1]
  return GARDEN_SPECIES.find((s) => s.id === id) || GARDEN_SPECIES[0]
})
</script>

<template>
  <BaseModal :visible="visible" :mask-closable="false" width="420px" @close="visible = false">
    <div class="celebration">
      <div class="confetti-layer" aria-hidden="true">
        <span v-for="n in 24" :key="n" class="confetti" :style="{ '--i': n }"></span>
      </div>
      <div class="celebration-plant">
        <GardenPlant stage="bloom" :species-id="newSpecies.id" />
      </div>
      <h2 class="celebration-title">解锁新品种！</h2>
      <p class="celebration-desc">
        {{ newSpecies.name }} · 连续打卡 {{ newSpecies.minStreak }} 天即可拥有
      </p>
    </div>
    <template #footer>
      <BaseButton type="primary" block @click="visible = false">太棒了</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.celebration {
  text-align: center;
  position: relative;
  padding: var(--spacing-md) 0;
}
.celebration-plant {
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-md);
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
  animation: confetti-fall 2.5s ease-in forwards;
  animation-delay: calc(var(--i) * 0.05s);
}
@keyframes confetti-fall {
  to {
    transform: translateY(140px) rotate(360deg);
    opacity: 0;
  }
}
</style>
