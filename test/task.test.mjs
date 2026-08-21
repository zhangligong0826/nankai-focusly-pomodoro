import test from 'node:test'
import assert from 'node:assert/strict'
import { groupTasks, filterTasks } from '../src/utils/task.ts'

const today = '2026-08-20'
const tomorrow = '2026-08-21'

function mk(id, { status = 'todo', priority = 'medium', dueDate = null, createdAt = 1 } = {}) {
  return { id, status, priority, dueDate, createdAt }
}

test('grouped tasks honor the active status filter', () => {
  const tasks = [
    mk('todo', { dueDate: today }),
    mk('doing', { priority: 'high', dueDate: tomorrow, createdAt: 2 }),
    mk('done', { status: 'done', priority: 'low', createdAt: 3 }),
  ]
  const groups = groupTasks(tasks, 'done', { today, tomorrow })
  assert.deepEqual(groups.map((group) => group.key), ['done'])
  assert.deepEqual(groups[0].tasks.map((task) => task.id), ['done'])
})

test('groupTasks 按日期分入 今日/明日/未来/已完成', () => {
  const tasks = [
    mk('overdue', { dueDate: '2026-08-19' }),
    mk('today', { dueDate: today }),
    mk('tomorrow', { dueDate: tomorrow }),
    mk('future', { dueDate: '2026-08-30' }),
    mk('done', { status: 'done', dueDate: today }),
  ]
  const groups = groupTasks(tasks, 'all', { today, tomorrow })
  const byKey = Object.fromEntries(groups.map((g) => [g.key, g.tasks.map((t) => t.id)]))
  assert.deepEqual(byKey.today, ['overdue', 'today'])
  assert.deepEqual(byKey.tomorrow, ['tomorrow'])
  assert.deepEqual(byKey.future, ['future'])
  assert.deepEqual(byKey.done, ['done'])
})

test('groupTasks 无截止日期归入今日', () => {
  const tasks = [mk('nofate', { dueDate: null })]
  const groups = groupTasks(tasks, 'all', { today, tomorrow })
  assert.equal(groups[0].key, 'today')
  assert.deepEqual(groups[0].tasks.map((t) => t.id), ['nofate'])
})

test('groupTasks 分组内按优先级权重排序（高→中→低）', () => {
  const tasks = [
    mk('low', { priority: 'low', dueDate: today, createdAt: 3 }),
    mk('high', { priority: 'high', dueDate: today, createdAt: 1 }),
    mk('medium', { priority: 'medium', dueDate: today, createdAt: 2 }),
  ]
  const groups = groupTasks(tasks, 'all', { today, tomorrow })
  const todayGroup = groups.find((g) => g.key === 'today')
  assert.deepEqual(todayGroup.tasks.map((t) => t.id), ['high', 'medium', 'low'])
})

test('groupTasks 空列表返回空数组', () => {
  assert.deepEqual(groupTasks([], 'all', { today, tomorrow }), [])
})

test('filterTasks all 原样返回', () => {
  const tasks = [mk('a'), mk('b', { status: 'done' })]
  assert.equal(filterTasks(tasks, 'all').length, 2)
})

test('filterTasks 按状态筛选', () => {
  const tasks = [mk('a'), mk('b', { status: 'done' }), mk('c', { status: 'done' })]
  const done = filterTasks(tasks, 'done')
  assert.deepEqual(done.map((t) => t.id), ['b', 'c'])
})

test('filterTasks 非数组输入返回空数组', () => {
  assert.deepEqual(filterTasks(null, 'all'), [])
  assert.deepEqual(filterTasks(undefined, 'done'), [])
})
