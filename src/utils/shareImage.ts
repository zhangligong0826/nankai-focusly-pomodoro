/**
 * 分享图片导出（P3-3）
 * @module utils/shareImage
 * @description 用 html2canvas 截图分享卡模板 DOM → 下载 PNG。
 *   依赖动态 import（点击生成时才加载）。
 */

/**
 * 生成并下载分享图片
 */
export async function exportShareImage(el: HTMLElement, filename = ''): Promise<boolean> {
  if (!el) {
    console.error('[shareImage] 缺少模板元素')
    return false
  }
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename || 'focusly_share.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    return true
  } catch (e) {
    console.error('[shareImage] 分享图生成失败:', e)
    return false
  }
}

export default { exportShareImage }
