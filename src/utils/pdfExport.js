/**
 * PDF 周报导出（P2-3）
 * @module utils/pdfExport
 * @description 用 html2canvas 截图周报模板 DOM → jspdf 生成多页 A4 PDF。
 *   依赖动态 import（点击导出时才加载），避免进首屏。
 */

/**
 * 导出周报为 PDF。
 * @param {HTMLElement} el - 已渲染的周报模板根元素
 * @param {string} [filename] - 文件名
 * @returns {Promise<boolean>} 是否成功
 */
export async function exportWeeklyReportPDF(el, filename = '') {
  if (!el) {
    console.error('[pdfExport] 缺少模板元素')
    return false
  }
  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    // 截图（scale=2 提升清晰度；白底）
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)

    // A4 尺寸（mm）：210 x 297
    const pageW = 210
    const pageH = 297
    // 每页可容纳的像素高度（按宽高比例换算）
    const pageHpx = (canvas.width * pageH) / pageW

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    let rendered = 0
    let firstPage = true
    while (rendered < canvas.height) {
      const sliceH = Math.min(pageHpx, canvas.height - rendered)
      // 离屏切片
      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = sliceH
      const ctx = sliceCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, rendered, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
      const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.92)

      if (!firstPage) {
        pdf.addPage()
      }
      firstPage = false

      // 切片像素高 → PDF 高度（mm）
      const fillH = (sliceH / pageHpx) * pageH
      pdf.addImage(sliceData, 'JPEG', 0, 0, pageW, fillH)

      rendered += sliceH
    }

    const name = filename || `focusly_weekly_report.pdf`
    pdf.save(name)
    return true
  } catch (e) {
    console.error('[pdfExport] PDF 导出失败:', e)
    return false
  }
}

export default { exportWeeklyReportPDF }
