/**
 * 根组件（布局容器）
 * @module App
 * @description CSS Grid 布局：PC 端 [sidebar][main]，移动端单列 + 底部 Tab；
 *   全局专注锁定监听 + 阶段提醒 + 庆祝弹窗
 */
<script setup>
import { computed } from 'vue'
import { useResponsive } from '@/composables/useResponsive'
import { useFocusLock, warningVisible } from '@/composables/useFocusLock'
import { useTimerStore } from '@/stores/timer'
import AppHeader from '@/components/common/AppHeader.vue'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppTabBar from '@/components/common/AppTabBar.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseToast from '@/components/common/BaseToast.vue'
import BreakReminder from '@/components/timer/BreakReminder.vue'
import DailyGoalCelebration from '@/components/timer/DailyGoalCelebration.vue'

const { isMobile, isTablet, isPC } = useResponsive()
const timerStore = useTimerStore()
const { emergencyPause, dismissWarning } = useFocusLock()

const layoutClass = computed(() => ({
  'app-layout': true,
  'app-layout--mobile': isMobile.value,
  'app-layout--tablet': isTablet.value,
  'app-layout--pc': isPC.value,
}))
</script>

<template>
  <div :class="layoutClass">
    <a href="#main-content" class="skip-link">跳到主内容</a>

    <AppHeader class="app-header" />

    <template v-if="isPC">
      <AppSidebar class="app-sidebar" />
    </template>

    <main id="main-content" class="app-main" tabindex="-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppTabBar v-if="!isPC" class="app-tabbar" />

    <!-- 全局 Toast（挂载一次，所有页面生效） -->
    <BaseToast />

    <!-- 全局：阶段切换提醒 -->
    <BreakReminder />

    <!-- 全局：每日目标庆祝 -->
    <DailyGoalCelebration />

    <!-- 全局：专注锁定警告 -->
    <BaseModal
      :visible="warningVisible"
      title="专注中请勿离开！"
      :mask-closable="false"
      :esc-closable="false"
      @close="dismissWarning"
    >
      <div class="lock-warning">
        <p>检测到你离开了专注页面，快回来继续学习吧 💪</p>
        <p class="text-tertiary text-sm">
          如需中断，可点击下方「紧急暂停」或使用快捷键
          <kbd>Ctrl</kbd> + <kbd>P</kbd>（Mac 为 <kbd>Cmd</kbd> + <kbd>P</kbd>）
        </p>
      </div>
      <template #footer>
        <button class="btn btn-primary" @click="dismissWarning">继续专注</button>
        <button class="btn btn-ghost" @click="emergencyPause">紧急暂停</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: var(--color-bg);
  display: grid;
  grid-template-areas:
    'header'
    'main';
  grid-template-rows: var(--header-height) 1fr;
}

.app-layout--pc {
  grid-template-columns: var(--sidebar-width) 1fr;
  grid-template-areas:
    'header header'
    'sidebar main';
}

.app-layout--tablet {
  grid-template-areas:
    'header'
    'main';
}

.app-header {
  grid-area: header;
}

.app-sidebar {
  grid-area: sidebar;
}

.app-main {
  grid-area: main;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.app-layout--mobile .app-main {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--tabbar-height) + var(--spacing-md));
}

.app-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-tabbar);
}

.lock-warning p {
  margin: var(--spacing-sm) 0;
}
.lock-warning .text-sm {
  font-size: var(--font-size-sm);
}
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}
.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
.btn-ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}
</style>
