/**
 * 白噪音播放器（P1-4）
 * @module components/settings/WhiteNoisePlayer
 * @description 4 选项按钮 + 音量滑块；切换立即生效；卸载停止
 */
<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useSound } from '@/composables/useSound'
import { NOISE_TYPE } from '@/utils/constants'

const settingsStore = useSettingsStore()
const sound = useSound()

const options = [
  { type: NOISE_TYPE.NONE, label: '关闭', icon: '🔇' },
  { type: NOISE_TYPE.RAIN, label: '雨声', icon: '🌧' },
  { type: NOISE_TYPE.CAFE, label: '咖啡馆', icon: '☕' },
  { type: NOISE_TYPE.SILENCE, label: '静音', icon: '🤫' },
]

/** 当前白噪音（响应式） */
const current = computed(() => settingsStore.settings.whiteNoise)

function select(type) {
  settingsStore.setWhiteNoise(type)
  if (type === NOISE_TYPE.NONE || type === NOISE_TYPE.SILENCE) {
    sound.stopWhiteNoise()
  } else {
    sound.playWhiteNoise(type, settingsStore.settings.whiteNoiseVolume)
  }
}

function onVolume(e) {
  const v = Number(e.target.value)
  settingsStore.updateSettings({ whiteNoiseVolume: v })
  sound.setVolume(v)
}

// 初始化：若已有白噪音设置则播放
onMounted(() => {
  const t = settingsStore.settings.whiteNoise
  if (t && t !== NOISE_TYPE.NONE && t !== NOISE_TYPE.SILENCE) {
    sound.playWhiteNoise(t, settingsStore.settings.whiteNoiseVolume)
  }
})

// 监听设置变化（其他页面修改时同步）
watch(
  () => settingsStore.settings.whiteNoise,
  (t) => {
    if (t === NOISE_TYPE.NONE || t === NOISE_TYPE.SILENCE) {
      sound.stopWhiteNoise()
    } else {
      sound.playWhiteNoise(t, settingsStore.settings.whiteNoiseVolume)
    }
  }
)

onUnmounted(() => {
  sound.stopWhiteNoise()
})
</script>

<template>
  <div class="noise-player">
    <div class="noise-options">
      <button
        v-for="opt in options"
        :key="opt.type"
        class="noise-option"
        :class="{ 'noise-option--active': current.value === opt.type }"
        @click="select(opt.type)"
      >
        <span class="noise-icon">{{ opt.icon }}</span>
        <span class="noise-label">{{ opt.label }}</span>
      </button>
    </div>
    <div class="noise-volume" v-if="current.value !== NOISE_TYPE.NONE && current.value !== NOISE_TYPE.SILENCE">
      <label class="volume-label">音量</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="settingsStore.settings.whiteNoiseVolume"
        class="volume-slider"
        @input="onVolume"
      />
    </div>
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
  color: var(--color-primary);
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
@media (max-width: 480px) {
  .noise-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
