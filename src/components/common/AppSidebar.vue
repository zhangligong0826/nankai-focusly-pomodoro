/**
 * PC 端左侧导航
 * @module components/common/AppSidebar
 * @description ≥1024px 左侧固定导航，router-link 高亮当前路由
 */
<script setup>
import { NAV_ITEMS } from '@/utils/constants'
</script>

<template>
  <nav class="app-sidebar" aria-label="主导航">
    <ul class="nav-list">
      <li v-for="item in NAV_ITEMS" :key="item.name">
        <router-link :to="item.path" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon" aria-hidden="true">
            <svg v-if="item.icon === 'timer'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M5 3 2 6M19 3l3 3" />
            </svg>
            <svg v-else-if="item.icon === 'task'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <svg v-else-if="item.icon === 'stats'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="13" y="7" width="3" height="10" />
            </svg>
            <svg v-else-if="item.icon === 'social'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.app-sidebar {
  background-color: var(--color-bg);
  border-right: 1px solid var(--color-border-light);
  padding: var(--spacing-lg) var(--spacing-md);
}
.nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  transition: all var(--transition-fast);
}
.nav-item:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
}
.nav-item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary-text);
  font-weight: 600;
}
</style>
