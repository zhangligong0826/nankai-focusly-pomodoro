/**
 * 任务表单弹窗
 * @module components/task/TaskForm
 * @description BaseModal 内嵌表单，支持 create/edit；标题必填/番茄数正整数校验
 */
<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useTaskStore } from '@/stores/task'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { TASK_CATEGORY, PRIORITY, LIMITS } from '@/utils/constants'
import { getTodayStr, getTomorrowStr } from '@/utils/date'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null }, // 编辑时传入
})

const emit = defineEmits(['close', 'saved'])

const taskStore = useTaskStore()

const isEdit = computed(() => !!props.task)

const form = reactive({
  title: '',
  note: '',
  plannedPomodoros: 1,
  category: TASK_CATEGORY.OTHER,
  priority: PRIORITY.MEDIUM,
  dueDate: '',
})

const errors = reactive({
  title: '',
  plannedPomodoros: '',
  note: '',
})

const categories = [
  { value: TASK_CATEGORY.PROFESSIONAL, label: '专业课' },
  { value: TASK_CATEGORY.ENGLISH, label: '英语' },
  { value: TASK_CATEGORY.RESEARCH, label: '科研' },
  { value: TASK_CATEGORY.OTHER, label: '其他' },
]
const priorities = [
  { value: PRIORITY.HIGH, label: '高' },
  { value: PRIORITY.MEDIUM, label: '中' },
  { value: PRIORITY.LOW, label: '低' },
]

// 重置/填充表单
watch(
  () => props.visible,
  (v) => {
    if (!v) return
    if (props.task) {
      Object.assign(form, {
        title: props.task.title || '',
        note: props.task.note || '',
        plannedPomodoros: props.task.plannedPomodoros || 1,
        category: props.task.category || TASK_CATEGORY.OTHER,
        priority: props.task.priority || PRIORITY.MEDIUM,
        dueDate: props.task.dueDate || '',
      })
    } else {
      Object.assign(form, {
        title: '',
        note: '',
        plannedPomodoros: 1,
        category: TASK_CATEGORY.OTHER,
        priority: PRIORITY.MEDIUM,
        dueDate: getTomorrowStr(),
      })
    }
    errors.title = ''
    errors.plannedPomodoros = ''
    errors.note = ''
  }
)

function validate() {
  let ok = true
  errors.title = ''
  errors.plannedPomodoros = ''
  errors.note = ''
  if (!form.title.trim()) {
    errors.title = '请输入任务标题'
    ok = false
  } else if (form.title.length > LIMITS.TITLE_MAX) {
    errors.title = `标题不能超过 ${LIMITS.TITLE_MAX} 字`
    ok = false
  }
  // 备注超长校验（maxlength 已限制输入，但校验逻辑保持完整）
  if ((form.note || '').length > LIMITS.NOTE_MAX) {
    errors.note = `备注不能超过 ${LIMITS.NOTE_MAX} 字`
    ok = false
  }
  const n = Number(form.plannedPomodoros)
  if (!Number.isInteger(n) || n < LIMITS.POMODORO_MIN || n > LIMITS.POMODORO_MAX) {
    errors.plannedPomodoros = `番茄数需为 ${LIMITS.POMODORO_MIN}-${LIMITS.POMODORO_MAX} 的整数`
    ok = false
  }
  return ok
}

const submitting = ref(false)

async function onSubmit() {
  if (!validate()) return
  submitting.value = true
  const payload = {
    title: form.title.trim(),
    note: form.note.trim(),
    plannedPomodoros: Number(form.plannedPomodoros),
    category: form.category,
    priority: form.priority,
    dueDate: form.dueDate || null,
  }
  try {
    if (isEdit.value) {
      await taskStore.updateTask(props.task.id, payload)
    } else {
      await taskStore.addTask(payload)
    }
    emit('saved')
    emit('close')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal
    :visible="visible"
    :title="isEdit ? '编辑任务' : '新建任务'"
    width="500px"
    @close="emit('close')"
  >
    <form class="task-form" @submit.prevent="onSubmit">
      <div class="form-row">
        <label class="form-label" for="task-title">任务标题 <span class="required">*</span></label>
        <input
          id="task-title"
          v-model="form.title"
          class="form-input"
          :class="{ 'is-error': errors.title }"
          placeholder="如：复习高等数学第三章"
          maxlength="50"
        />
        <span class="form-error" v-if="errors.title" role="alert">{{ errors.title }}</span>
      </div>

      <div class="form-row">
        <label class="form-label" for="task-note">备注</label>
        <textarea
          id="task-note"
          v-model="form.note"
          class="form-input form-textarea"
          :class="{ 'is-error': errors.note }"
          placeholder="可选，重点或注意事项"
          maxlength="200"
        ></textarea>
        <span class="form-error" v-if="errors.note" role="alert">{{ errors.note }}</span>
      </div>

      <div class="form-row form-row--2col">
        <div class="form-col">
          <label class="form-label" for="task-pomodoros">计划番茄数</label>
          <input
            id="task-pomodoros"
            v-model.number="form.plannedPomodoros"
            type="number"
            class="form-input"
            :class="{ 'is-error': errors.plannedPomodoros }"
            min="1"
            max="20"
          />
          <span class="form-error" v-if="errors.plannedPomodoros" role="alert">{{ errors.plannedPomodoros }}</span>
        </div>
        <div class="form-col">
          <label class="form-label" for="task-duedate">截止日期</label>
          <input id="task-duedate" v-model="form.dueDate" type="date" class="form-input" />
        </div>
      </div>

      <div class="form-row form-row--2col">
        <div class="form-col">
          <label class="form-label" for="task-category">分类</label>
          <select id="task-category" v-model="form.category" class="form-input">
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
        </div>
        <div class="form-col">
          <label class="form-label" for="task-priority">优先级</label>
          <select id="task-priority" v-model="form.priority" class="form-input">
            <option v-for="p in priorities" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </div>
      </div>
    </form>

    <template #footer>
      <BaseButton type="ghost" @click="emit('close')">取消</BaseButton>
      <BaseButton type="primary" :loading="submitting" @click="onSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.form-row--2col {
  flex-direction: row;
  gap: var(--spacing-md);
}
.form-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.form-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.required {
  color: var(--color-primary);
}
.form-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  font-size: var(--font-size-md);
  transition: border-color var(--transition-fast);
}
.form-input:focus {
  border-color: var(--color-primary);
}
.form-input.is-error {
  border-color: var(--color-primary);
}
.form-textarea {
  resize: vertical;
  min-height: 72px;
}
.form-error {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}
@media (max-width: 480px) {
  .form-row--2col {
    flex-direction: column;
  }
}
</style>
