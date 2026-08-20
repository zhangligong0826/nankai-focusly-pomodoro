/**
 * 阶段切换提醒弹窗
 * @module components/timer/BreakReminder
 * @description 专注完成→休息提醒 / 休息完成→专注提醒，含开始/稍后按钮
 */
<script setup>
import { computed, watch } from 'vue'
import { useTimerStore } from '@/stores/timer'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { TIMER_MODE } from '@/utils/constants'

const store = useTimerStore()

const visible = computed({
  get: () => !!store.phaseReminder,
  set: (v) => { if (!v) store.clearPhaseReminder() },
})

const reminder = computed(() => store.phaseReminder || null)

const isFocusToBreak = computed(
  () => reminder.value && reminder.value.from === TIMER_MODE.FOCUS
)

const title = computed(() => {
  if (!reminder.value) return ''
  return isFocusToBreak.value ? '专注完成！休息一下' : '休息结束，继续专注'
})

const message = computed(() => {
  if (!reminder.value) return ''
  if (reminder.value.skipped) {
    return isFocusToBreak.value ? '已跳过专注阶段，进入休息' : '已跳过休息，开始下一轮专注'
  }
  return isFocusToBreak.value
    ? '一个番茄完成啦，起来活动活动～'
    : '休息够了，继续加油专注！'
})

const actionText = computed(() =>
  isFocusToBreak.value ? '开始休息' : '开始专注'
)

function startNext() {
  store.clearPhaseReminder()
  store.start()
}
function later() {
  store.clearPhaseReminder()
}
</script>

<template>
  <BaseModal
    :visible="visible"
    :title="title"
    :mask-closable="false"
    width="400px"
  >
    <p class="reminder-message">{{ message }}</p>
    <template #footer>
      <BaseButton type="ghost" @click="later">稍后</BaseButton>
      <BaseButton type="primary" @click="startNext">{{ actionText }}</BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.reminder-message {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: 1.6;
}
</style>
