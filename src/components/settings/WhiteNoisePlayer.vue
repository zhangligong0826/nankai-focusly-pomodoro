/**
 * 白噪音播放器（P1-4 增强）
 * @module components/settings/WhiteNoisePlayer
 * @description 多场景可叠加混音（雨声/海浪/森林/咖啡馆）+ 音量滑块；切换立即生效；卸载停止
 */
<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useSound } from '@/composables/useSound'
import { NOISE_TYPE } from '@/utils/constants'

const settingsStore = useSettingsStore()
const sound = useSound()

const options = [
  { type: NOISE_TYPE.RAIN, label: '雨声', icon: '🌧' },
  { type: NOISE_TYPE.WAVES, label: '海浪', icon: '🌊' },
  { type: NOISE_TYPE.FOREST, label: '森林', icon: '🌲' },
  { type: NOISE_TYPE.CAFE, label: '咖啡馆', icon: '☕' },
]

/** 当前激活的场景数组（响应式） */
const activeScenes = computed(() => {
  const v = settingsStore.settings.whiteNoise
  return Array.isArray(v) ? v : []
})

const hasActive = computed(() => activeScenes.value.length > 0)

function toggle(type) {
  const cur = [...activeScenes.value]
  const idx = cur.indexOf(type)
  if (idx === -1) {
    cur.push(type)
  } else {
    cur.splice(idx, 1)
  }
  settingsStore.setWhiteNoise(cur)
  applyScenes(cur)
}

function applyScenes(scenes) {
  if (scenes.length === 0) {
    sound.stopWhiteNoise()
  } else {
    sound.playWhiteNoise(scenes, settingsStore.settings.whiteNoiseVolume)
  }
}

function clearAll() {
  settingsStore.setWhiteNoise([])
  sound.stopWhiteNoise()
}

function onVolume(e) {
  const v = Number(e.target.value)
  settingsStore.updateSettings({ whiteNoiseVolume: v })
  sound.setVolume(v)
}

// 初始化：若已有白噪音设置则播放
onMounted(() => {
  const scenes = Array.isArray(settingsStore.settings.whiteNoise)
    ? settingsStore.settings.whiteNoise
    : []
  if (scenes.length > 0) {
    applyScenes(scenes)
  }
})

// 监听设置变化（其他页面修改时同步）
watch(
  () => settingsStore.settings.whiteNoise,
  (scenes) => {
    applyScenes(Array.isArray(scenes) ? scenes : [])
  }
)

onUnmounted(() => {
  sound.stopWhiteNoise()
})
</script>

<template>
  <div class="noise-player">
    <div class="noise-options" role="group" aria-label="白噪音场景（可多选叠加）">
      <button
        v-for="opt in options"
        :key="opt.type"
        class="noise-option"
        :class="{ 'noise-option--active': activeScenes.includes(opt.type) }"
        :aria-pressed="activeScenes.includes(opt.type)"
        @click="toggle(opt.type)"
      >
        <span class="noise-icon" aria-hidden="true">{{ opt.icon }}</span>
        <span class="noise-label">{{ opt.label }}</span>
      </button>
    </div>

    <div class="noise-volume" v-if="hasActive">
      <label class="volume-label" for="noise-volume">音量</label>
      <input
        id="noise-volume"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="settingsStore.settings.whiteNoiseVolume"
        class="volume-slider"
        @input="onVolume"
      />
      <button class="noise-clear" @click="clearAll">关闭</button>
    </div>
    <p v-else class="noise-tip text-tertiary">点选场景叠加混音，营造专注氛围</p>
  </div>
</template>

<style scoped>
.noise-player {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.noise-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}
.noise-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-md) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.noise-option:hover {
  border-color: var(--color-primary);
}
.noise-option--active {
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  color: var(--color-primary-text);
}
.noise-icon {
  font-size: 24px;
}
.noise-label {
  font-size: var(--font-size-sm);
}
.noise-volume {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.volume-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.volume-slider {
  flex: 1;
  accent-color: var(--color-primary);
}
.noise-clear {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}
.noise-clear:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
.noise-tip {
  font-size: var(--font-size-sm);
}
@media (max-width: 480px) {
  .noise-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
