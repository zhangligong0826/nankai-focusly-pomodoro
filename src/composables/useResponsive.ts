/**
 * 响应式断点检测
 * @module composables/useResponsive
 * @description 基于 matchMedia + resize 监听，返回当前断点（pc/tablet/mobile）
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

/** 断点定义 */
const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  pc: '(min-width: 1024px)',
}

/** 响应式组合式函数 */
export function useResponsive() {
  const breakpoint = ref<'mobile' | 'tablet' | 'pc'>('pc')

  function update() {
    if (typeof window === 'undefined' || !window.matchMedia) return
    if (window.matchMedia(BREAKPOINTS.mobile).matches) breakpoint.value = 'mobile'
    else if (window.matchMedia(BREAKPOINTS.tablet).matches) breakpoint.value = 'tablet'
    else breakpoint.value = 'pc'
  }

  let mqlListener: (() => void) | null = null

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
    // 监听断点变化（更精准）
    const mql = window.matchMedia(BREAKPOINTS.tablet)
    if (mql.addEventListener) {
      mql.addEventListener('change', update)
      mqlListener = () => mql.removeEventListener('change', update)
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', update)
    if (mqlListener) mqlListener()
  })

  const isMobile = computed(() => breakpoint.value === 'mobile')
  const isTablet = computed(() => breakpoint.value === 'tablet')
  const isPC = computed(() => breakpoint.value === 'pc')

  return { breakpoint, isMobile, isTablet, isPC }
}

export default useResponsive
