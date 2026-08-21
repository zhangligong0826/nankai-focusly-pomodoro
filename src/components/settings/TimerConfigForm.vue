/**
 * 计时器配置表单
 * @module components/settings/TimerConfigForm
 * @description 专注/短休/长休时长 + 轮数 + 声音/通知/自动开始开关
 */
<script setup>
import { reactive, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import BaseButton from '@/components/common/BaseButton.vue'
import { LIMITS } from '@/utils/constants'

const props = defineProps({
  config: { type: Object, required: true },
})

const emit = defineEmits(['save'])

const settingsStore = useSettingsStore()

const form = reactive({
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  notificationEnabled: true,
  autoStartBreak: false,
  autoStartFocus: false,
})

// 同步外部 config → form
watch(
  () => props.config,
  (c) => {
    if (c) Object.assign(form, c)
  },
  { immediate: true, deep: true }
)

function clamp(v, min, max) {
  const n = Number(v)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}

const errors = reactive({})

function validate() {
  errors.focusDuration = form.focusDuration < 1 ? '至少 1 分钟' : ''
  return true
}

function save() {
  const payload = {
    focusDuration: clamp(form.focusDuration, LIMITS.FOCUS_MIN, LIMITS.FOCUS_MAX),
    shortBreakDuration: clamp(form.shortBreakDuration, LIMITS.SHORT_BREAK_MIN, LIMITS.SHORT_BREAK_MAX),
    longBreakDuration: clamp(form.longBreakDuration, LIMITS.LONG_BREAK_MIN, LIMITS.LONG_BREAK_MAX),
    longBreakInterval: clamp(form.longBreakInterval, LIMITS.INTERVAL_MIN, LIMITS.INTERVAL_MAX),
    soundEnabled: form.soundEnabled,
    notificationEnabled: form.notificationEnabled,
    autoStartBreak: form.autoStartBreak,
    autoStartFocus: form.autoStartFocus,
  }
  settingsStore.updateConfig(payload)
  emit('save')
}

function toggle(field) {
  form[field] = !form[field]
}
</script>

<template>
  <div class="config-form">
    <div class="form-grid">
      <div class="field">
        <label class="field-label" for="cfg-focus">专注时长（分钟）</label>
        <input
          id="cfg-focus"
          v-model.number="form.focusDuration"
          type="number"
          class="field-input"
          :min="LIMITS.FOCUS_MIN"
          :max="LIMITS.FOCUS_MAX"
        />
      </div>
      <div class="field">
        <label class="field-label" for="cfg-short">短休时长（分钟）</label>
        <input
          id="cfg-short"
          v-model.number="form.shortBreakDuration"
          type="number"
          class="field-input"
          :min="LIMITS.SHORT_BREAK_MIN"
          :max="LIMITS.SHORT_BREAK_MAX"
        />
      </div>
      <div class="field">
        <label class="field-label" for="cfg-long">长休时长（分钟）</label>
        <input
          id="cfg-long"
          v-model.number="form.longBreakDuration"
          type="number"
          class="field-input"
          :min="LIMITS.LONG_BREAK_MIN"
          :max="LIMITS.LONG_BREAK_MAX"
        />
      </div>
      <div class="field">
        <label class="field-label" for="cfg-interval">长休间隔（轮）</label>
        <input
          id="cfg-interval"
          v-model.number="form.longBreakInterval"
          type="number"
          class="field-input"
          :min="LIMITS.INTERVAL_MIN"
          :max="LIMITS.INTERVAL_MAX"
        />
      </div>
    </div>

    <div class="switch-row">
      <label class="switch-label">声音提醒</label>
      <button
        class="switch"
        :class="{ 'switch--on': form.soundEnabled }"
        role="switch"
        :aria-checked="form.soundEnabled"
        aria-label="声音提醒"
        @click="toggle('soundEnabled')"
      ></button>
    </div>
    <div class="switch-row">
      <label class="switch-label">桌面通知</label>
      <button
        class="switch"
        :class="{ 'switch--on': form.notificationEnabled }"
        role="switch"
        :aria-checked="form.notificationEnabled"
        aria-label="桌面通知"
        @click="toggle('notificationEnabled')"
      ></button>
    </div>
    <div class="switch-row">
      <label class="switch-label">专注结束自动开始休息</label>
      <button
        class="switch"
        :class="{ 'switch--on': form.autoStartBreak }"
        role="switch"
        :aria-checked="form.autoStartBreak"
        aria-label="专注结束自动开始休息"
        @click="toggle('autoStartBreak')"
      ></button>
    </div>
    <div class="switch-row">
      <label class="switch-label">休息结束自动开始专注</label>
      <button
        class="switch"
        :class="{ 'switch--on': form.autoStartFocus }"
        role="switch"
        :aria-checked="form.autoStartFocus"
        aria-label="休息结束自动开始专注"
        @click="toggle('autoStartFocus')"
      ></button>
    </div>

    <div class="form-actions">
      <BaseButton type="primary" @click="save">保存配置</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.config-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}
.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.field-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.field-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-md);
}
.field-input:focus {
  border-color: var(--color-primary);
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.switch-label {
  font-size: var(--font-size-md);
  color: var(--color-text);
}
.switch {
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  background-color: var(--color-border);
  position: relative;
  transition: background-color var(--transition-base);
  flex-shrink: 0;
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--color-bg);
  transition: transform var(--transition-base);
}
.switch--on {
  background-color: var(--color-primary);
}
.switch--on::after {
  transform: translateX(20px);
}
/* 触屏设备放大开关命中区 */
@media (pointer: coarse) {
  .switch {
    width: 52px;
    height: 30px;
  }
  .switch::after {
    width: 26px;
    height: 26px;
  }
  .switch--on::after {
    transform: translateX(22px);
  }
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
@media (max-width: 480px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
