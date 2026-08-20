/**
 * 移动端底部 Tab
 * @module components/common/AppTabBar
 * @description ≤1023px 底部固定 Tab，可点区域 ≥44px
 */
<script setup>
import { NAV_ITEMS } from '@/utils/constants'
</script>

<template>
  <nav class="app-tabbar" aria-label="底部导航">
    <router-link
      v-for="item in NAV_ITEMS"
      :key="item.name"
      :to="item.path"
      class="tab-item"
      active-class="tab-item--active"
    >
      <span class="tab-icon" aria-hidden="true">
        <svg v-if="item.icon === 'timer'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M5 3 2 6M19 3l3 3" />
        </svg>
        <svg v-else-if="item.icon === 'task'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
        <svg v-else-if="item.icon === 'stats'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 3v18h18" /><rect x="7" y="11" width="3" height="6" /><rect x="13" y="7" width="3" height="10" />
        </svg>
      </span>
      <span class="tab-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style scoped>
.app-tabbar {
  display: flex;
  height: var(--tabbar-height);
  background-color: var(--color-bg);
  border-top: 1px solid var(--color-border-light);
}
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-tertiary);
  min-height: 44px;
  transition: color var(--transition-fast);
}
.tab-item--active {
  color: var(--color-primary);
}
.tab-label {
  font-size: var(--font-size-xs);
}
</style>
