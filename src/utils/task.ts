/** 任务分组纯函数，供 Store 与单元测试共用。 */
import { getTodayStr, getTomorrowStr, diffDays } from './date.ts'
import { TASK_STATUS, PRIORITY, PRIORITY_META } from './constants.ts'

/** 任务对象（用于分组/筛选的最小字段集） */
export interface TaskLike {
  status?: string
  priority?: string
  dueDate?: string
  createdAt?: number
  [key: string]: unknown
}

function sortByPriorityThenCreatedAt(a: TaskLike, b: TaskLike): number {
  const aw = (PRIORITY_META[a.priority as keyof typeof PRIORITY_META] || PRIORITY_META[PRIORITY.MEDIUM as keyof typeof PRIORITY_META]).weight
  const bw = (PRIORITY_META[b.priority as keyof typeof PRIORITY_META] || PRIORITY_META[PRIORITY.MEDIUM as keyof typeof PRIORITY_META]).weight
  if (aw !== bw) return aw - bw
  return (b.createdAt || 0) - (a.createdAt || 0)
}

/** 按状态筛选任务（filter=all 时原样返回） */
export function filterTasks(tasks: TaskLike[], filter = 'all'): TaskLike[] {
  if (!Array.isArray(tasks)) return []
  if (filter === 'all') return tasks
  return tasks.filter((task) => task.status === filter)
}

/** 任务分组结构 */
export interface TaskGroup {
  key: string
  label: string
  tasks: TaskLike[]
}

/** 按当前筛选条件将任务归入日期分组 */
export function groupTasks(
  tasks: TaskLike[],
  filter = 'all',
  { today = getTodayStr(), tomorrow = getTomorrowStr() }: { today?: string; tomorrow?: string } = {}
): TaskGroup[] {
  const groups: Record<string, TaskGroup> = {
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

export default { groupTasks, filterTasks }
