/**
 * 路由配置
 * @module router
 * @description 4 个路由懒加载，hash 模式适配 GitHub Pages 部署
 */
import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 路由元信息标题映射
 * @type {Record<string, string>}
 */
const ROUTE_TITLES = {
  timer: '计时',
  tasks: '任务',
  stats: '统计',
  settings: '设置',
}

const routes = [
  {
    path: '/',
    name: 'timer',
    component: () => import('@/views/TimerView.vue'),
    meta: { title: ROUTE_TITLES.timer, icon: 'timer' },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/TaskView.vue'),
    meta: { title: ROUTE_TITLES.tasks, icon: 'task' },
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsView.vue'),
    meta: { title: ROUTE_TITLES.stats, icon: 'stats' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: ROUTE_TITLES.settings, icon: 'settings' },
  },
  // 兜底重定向到首页
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  // hash 模式：无需服务端配置即可部署到 GitHub Pages
  history: createWebHashHistory(),
  routes,
  // 路由切换时滚动到顶部
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
export { ROUTE_TITLES }
