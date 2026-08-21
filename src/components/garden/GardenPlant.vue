/**
 * 养成物植株（P1-1）手绘 SVG 插画
 * @module components/garden/GardenPlant
 * @description 按 stage（seed/sprout/seedling/plant/bloom）+ speciesId + wilted 渲染手绘植株
 */
<script setup>
import { computed } from 'vue'

const props = defineProps({
  stage: { type: String, default: 'seed' },
  speciesId: { type: String, default: 'sprout' },
  wilted: { type: Boolean, default: false },
})

/** 品种主色调（用于花朵/果实） */
const bloomColor = computed(() => {
  if (props.speciesId === 'sunflower') return '#e6a23c'
  if (props.speciesId === 'tomato') return '#e74c3c'
  return '#f39c9c'
})
</script>

<template>
  <svg
    class="garden-plant"
    viewBox="0 0 120 120"
    fill="none"
    role="img"
    :aria-label="`养成物：${stage}`"
  >
    <!-- 土壤 -->
    <path
      d="M18 96 Q 60 88 102 96"
      stroke="var(--color-text-tertiary)"
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <path
      d="M30 102 Q 45 98 60 102 T 90 102"
      stroke="var(--color-text-tertiary)"
      stroke-width="2"
      stroke-linecap="round"
      opacity="0.5"
    />

    <!-- 枯萎态 -->
    <template v-if="wilted">
      <path
        d="M60 96 Q 58 70 48 52 Q 62 60 64 48 Q 60 40 54 34"
        stroke="var(--color-text-tertiary)"
        stroke-width="2.5"
        stroke-linecap="round"
      />
      <path
        d="M52 50 Q 40 48 36 54 M64 46 Q 72 42 76 48 M58 66 Q 46 64 42 68"
        stroke="var(--color-text-tertiary)"
        stroke-width="2"
        stroke-linecap="round"
      />
      <ellipse cx="70" cy="98" rx="4" ry="2" fill="var(--color-text-tertiary)" opacity="0.6" />
      <ellipse cx="48" cy="100" rx="3" ry="1.5" fill="var(--color-text-tertiary)" opacity="0.5" />
    </template>

    <!-- 正常态 -->
    <template v-else>
      <!-- 种子 -->
      <template v-if="stage === 'seed'">
        <ellipse cx="60" cy="88" rx="10" ry="7" fill="#8d6e63" />
        <path d="M60 82 Q 64 88 60 94" stroke="#5d4037" stroke-width="1.5" stroke-linecap="round" />
      </template>

      <!-- 发芽及以上 -->
      <template v-else>
        <path
          d="M60 96 Q 58 70 60 46"
          stroke="var(--color-primary-text)"
          stroke-width="2.5"
          stroke-linecap="round"
        />

        <!-- 发芽：子叶 -->
        <template v-if="stage === 'sprout'">
          <path d="M60 50 Q 48 44 44 36" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 50 Q 72 44 76 36" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
        </template>

        <!-- 幼苗：真叶 -->
        <template v-else-if="stage === 'seedling'">
          <path d="M60 64 Q 48 58 42 50" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 64 Q 72 58 78 50" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 52 Q 50 46 48 38" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 52 Q 70 46 72 38" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
        </template>

        <!-- 成株：分枝 + 密叶 -->
        <template v-else-if="stage === 'plant' || stage === 'bloom'">
          <path d="M60 58 Q 48 50 44 40" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 58 Q 72 50 76 40" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 44 Q 52 38 50 28" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <path d="M60 44 Q 68 38 70 28" stroke="var(--color-success-text)" stroke-width="2.5" stroke-linecap="round" />
          <!-- 顶部花苞（成株） -->
          <circle v-if="stage === 'plant'" cx="60" cy="26" r="4" :fill="bloomColor" />

          <!-- 开花：花朵 -->
          <template v-if="stage === 'bloom'">
            <template v-if="speciesId === 'sunflower'">
              <circle cx="60" cy="24" r="9" fill="#e6a23c" />
              <circle cx="60" cy="24" r="4" fill="#5d4037" />
            </template>
            <template v-else-if="speciesId === 'tomato'">
              <circle cx="54" cy="30" r="3.5" fill="#e74c3c" />
              <circle cx="66" cy="28" r="3.5" fill="#e74c3c" />
            </template>
            <template v-else>
              <g :fill="bloomColor">
                <ellipse cx="60" cy="20" rx="4" ry="7" transform="rotate(0 60 26)" />
                <ellipse cx="60" cy="20" rx="4" ry="7" transform="rotate(72 60 26)" />
                <ellipse cx="60" cy="20" rx="4" ry="7" transform="rotate(144 60 26)" />
                <ellipse cx="60" cy="20" rx="4" ry="7" transform="rotate(216 60 26)" />
                <ellipse cx="60" cy="20" rx="4" ry="7" transform="rotate(288 60 26)" />
              </g>
              <circle cx="60" cy="26" r="3" fill="#fff3e0" />
            </template>
          </template>
        </template>
      </template>
    </template>
  </svg>
</template>

<style scoped>
.garden-plant {
  width: 100%;
  height: auto;
  display: block;
}
</style>
