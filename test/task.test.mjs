import test from 'node:test'
import assert from 'node:assert/strict'
import { groupTasks } from '../src/utils/task.js'

const tasks = [
  { id: 'todo', status: 'todo', priority: 'medium', dueDate: '2026-08-20', createdAt: 1 },
  { id: 'doing', status: 'doing', priority: 'high', dueDate: '2026-08-21', createdAt: 2 },
  { id: 'done', status: 'done', priority: 'low', dueDate: null, createdAt: 3 },
]

test('grouped tasks honor the active status filter', () => {
  const groups = groupTasks(tasks, 'done', { today: '2026-08-20', tomorrow: '2026-08-21' })
  assert.deepEqual(groups.map((group) => group.key), ['done'])
  assert.deepEqual(groups[0].tasks.map((task) => task.id), ['done'])
})
