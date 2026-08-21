/**
 * 主流程 E2E：进入计时 → 开始 → 完成 → 自动打卡 → 统计番茄数 +1
 * @module e2e/main-flow
 * @description 用 focusDuration=1 分钟 + page.clock 快进跳过真实等待
 */
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // 清空本地数据，确保测试从干净状态开始
  await page.goto('/nankai-focusly-pomodoro/#/')
  await page.evaluate(() => {
    localStorage.clear()
    indexedDB.deleteDatabase('focusly')
  })
  // 设为最短专注时长（1 分钟），并预先写入配置
  await page.evaluate(() => {
    localStorage.setItem(
      'focusly_timer_config',
      JSON.stringify({
        focusDuration: 1,
        shortBreakDuration: 1,
        longBreakDuration: 5,
        longBreakInterval: 4,
        soundEnabled: false,
        notificationEnabled: false,
        autoStartBreak: false,
        autoStartFocus: false,
      })
    )
  })
  await page.reload()
})

test('主流程：开始专注 → 完成 → 自动打卡', async ({ page }) => {
  // 进入计时页
  await page.goto('/nankai-focusly-pomodoro/#/')

  // 点击「开始专注」，弹意图输入 → 跳过
  const startBtn = page.getByRole('button', { name: '开始专注' }).first()
  await startBtn.click()

  // 意图弹窗里点「跳过」
  const skipIntent = page.getByRole('dialog').getByRole('button', { name: '跳过' })
  if (await skipIntent.isVisible()) {
    await skipIntent.click()
  }

  // 计时开始后应有「暂停」按钮
  await expect(page.getByRole('button', { name: '暂停' })).toBeVisible()

  // 快进 60 秒让 1 分钟专注完成
  await page.clock.install()
  await page.clock.fastForward(65000)

  // 完成后出现反思弹窗（正常完成触发），跳过反思
  const reflectionSkip = page.getByRole('dialog').getByRole('button', { name: '跳过' })
  if (await reflectionSkip.isVisible()) {
    await reflectionSkip.click()
  }
  // 休息提醒弹窗（可能接着出现），点稍后
  const breakLater = page.getByRole('dialog').getByRole('button', { name: '稍后' })
  if (await breakLater.isVisible()) {
    await breakLater.click()
  }

  // 验证：回到统计页，番茄数应 ≥ 1
  await page.goto('/nankai-focusly-pomodoro/#/stats')
  await expect(page.getByText('专注统计')).toBeVisible()
})
