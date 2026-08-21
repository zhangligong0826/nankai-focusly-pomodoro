/**
 * 养成物主卡片（P1-1）
 * @module components/garden/GardenCard
 * @description 统计页展示：植株插画 + 品种 + 成长阶段进度 + 累计专注时长 + 枯萎提示
 */
<script setup>
import { onMounted } from 'vue'
import { useGardenStore } from '@/stores/garden'
import GardenPlant from './GardenPlant.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { minutesToChinese } from '@/utils/format'

const garden = useGardenStore()

onMounted(() => {
  garden.init()
  garden.reconcile()
})
</script>

<template>
  <div class="garden-card card">
    <h3 class="garden-title">🌱 我的花园</h3>

    <div class="garden-body">
      <div class="garden-plant-wrap">
        <GardenPlant
          :stage="garden.stage.stage"
          :species-id="garden.currentSpecies.id"
          :wilted="garden.isWilted"
        />
      </div>

      <div class="garden-info">
        <template v-if="garden.isWilted">
          <p class="garden-species">{{ garden.currentSpecies.name }}已枯萎</p>
          <p class="garden-desc text-tertiary">离开专注或断签让植株枯萎了，重新开始吧</p>
          <BaseButton type="primary" size="sm" @click="garden.revive()">重新种植</BaseButton>
        </template>
        <template v-else>
          <p class="garden-species">{{ garden.currentSpecies.name }} · {{ garden.stage.label }}</p>
          <div class="garden-progress" role="progressbar" :aria-valuenow="Math.round(garden.progress * 100)" aria-valuemin="0" aria-valuemax="100">
            <div class="garden-progress-bar" :style="{ width: (garden.progress * 100) + '%' }"></div>
          </div>
          <p class="garden-desc text-tertiary">
            累计专注 {{ minutesToChinese(garden.totalMinutes) }}
            <template v-if="garden.nextStage">
              · 距「{{ garden.nextStage.label }}」还需
              {{ minutesToChinese(garden.nextStage.minMinutes - garden.totalMinutes) }}
            </template>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.garden-card {
  padding: var(--spacing-lg);
}
.garden-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}
.garden-body {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}
.garden-plant-wrap {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
}
.garden-info {
  flex: 1;
  min-width: 0;
}
.garden-species {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}
.garden-progress {
  height: 8px;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}
.garden-progress-bar {
  height: 100%;
  background-color: var(--color-success);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}
.garden-desc {
  font-size: var(--font-size-sm);
}
@media (max-width: 480px) {
  .garden-body {
    flex-direction: column;
    text-align: center;
  }
}
</style>
