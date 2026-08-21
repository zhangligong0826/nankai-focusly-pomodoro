/**
 * 养成物迷你预览卡（P1-1）
 * @module components/garden/GardenMiniCard
 * @description 计时页展示：小植株 + 阶段标签 + 一句状态，点击跳转统计页查看花园
 */
<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGardenStore } from '@/stores/garden'
import GardenPlant from './GardenPlant.vue'

const garden = useGardenStore()
const router = useRouter()

onMounted(() => {
  garden.init()
  garden.reconcile()
})

function goGarden() {
  router.push('/stats')
}
</script>

<template>
  <button class="garden-mini card" @click="goGarden" aria-label="查看我的花园">
    <div class="garden-mini-plant">
      <GardenPlant
        :stage="garden.stage.stage"
        :species-id="garden.currentSpecies.id"
        :wilted="garden.isWilted"
      />
    </div>
    <div class="garden-mini-text">
      <span class="garden-mini-species">
        {{ garden.isWilted ? '植株已枯萎' : `${garden.currentSpecies.name} · ${garden.stage.label}` }}
      </span>
      <span class="garden-mini-hint text-tertiary">
        {{ garden.isWilted ? '点击去花园重新种植' : '点击查看我的花园' }}
      </span>
    </div>
  </button>
</template>

<style scoped>
.garden-mini {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
  padding: var(--spacing-md);
  text-align: left;
  cursor: pointer;
  transition: box-shadow var(--transition-base);
}
.garden-mini:hover {
  box-shadow: var(--shadow-md);
}
.garden-mini-plant {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
}
.garden-mini-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.garden-mini-species {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}
.garden-mini-hint {
  font-size: var(--font-size-xs);
}
</style>
