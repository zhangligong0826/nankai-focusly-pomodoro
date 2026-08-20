/** 任务分组纯函数，供 Store 与单元测试共用。 */
import { getTodayStr, getTomorrowStr, diffDays } from './date.js'
import { TASK_STATUS, PRIORITY, PRIORITY_META } from './constants.js'

function sortByPriorityThenCreatedAt(a, b) {
  const aw = (PRIORITY_META[a.priority] || PRIORITY_META[PRIORITY.MEDIUM]).weight
  const bw = (PRIORITY_META[b.priority] || PRIORITY_META[PRIORITY.MEDIUM]).weight
  if (aw !== bw) return aw - bw
  return b.createdAt - a.createdAt
}

/**
 * 按当前筛选条件将任务归入日期分组。
 * @param {object[]} tasks
 * @param {string} filter
 * @param {{today?: string, tomorrow?: string}} [dates]
 */
export function groupTasks(
  tasks,
  filter = 'all',
  { today = getTodayStr(), tomorrow = getTomorrowStr() } = {}
) {
  const groups = {
    today: { key: 'today', label: '今日', tasks: [] },
    tomorrow: { key: 'tomorrow', label: '明日', tasks: [] },
    future: { key: 'future', label: '未来', tasks: [] },
    done: { key: 'done', label: '已完成', tasks: [] },
  }
  const visibleTasks =
    filter === 'all' ? tasks : tasks.filter((task) => task.status === filter)

  for (const task of visibleTasks) {
    if (task.status === TASK_STATUS.DONE) {
      groups.done.tasks.push(task)
      continue
    }
    if (!task.dueDate) {
      groups.today.tasks.push(task)
      continue
    }
    const daysFromToday = diffDays(task.dueDate, today)
    if (daysFromToday <= 0) groups.today.tasks.push(task)
    else if (daysFromToday === 1) groups.tomorrow.tasks.push(task)
    else groups.future.tasks.push(task)
  }

  return Object.values(groups)
    .map((group) => ({ ...group, tasks: group.tasks.sort(sortByPriorityThenCreatedAt) }))
    .filter((group) => group.tasks.length > 0)
}

export default { groupTasks }
