/**
 * ECharts 通用 tooltip formatter 工具
 * 统一使用项目背景图和视觉风格
 */

/** Tooltip 参数项 */
interface TooltipParamItem {
  axisValue?: string
  seriesName?: string
  name?: string
  value?: number | string
  color?: string
  percent?: number
}

/**
 * 生成 axis trigger 类型 tooltip 的 HTML 内容
 * @param params ECharts tooltip params（数组）
 * @param title 标题，默认取第一个参数的 axisValue
 * @returns HTML 字符串
 */
export function axisTooltipHtml(params: TooltipParamItem[], title?: string): string {
  const t = title || params[0]?.axisValue || ''
  let html = `<div style="background: url(/images/echartsPop-up@2x.png) no-repeat center center / 100% 100%; padding: 14px 18px; min-width: 180px;">`
  html += `<div style="font-size: 16px; color: #fff; margin-bottom: 10px; font-weight: 500;">${t}</div>`
  params.forEach((p) => {
    const label = (p.seriesName || p.name || '').replace('(kWh)', '').replace('（kWh）', '')
    html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 6px;">`
    if (label) {
      html += `<span style="background: linear-gradient( 90deg, rgba(75,87,107,0.6) 0%, rgba(75,87,107,0) 100%);; padding: 3px 10px;width:100%; border-radius: 3px; color: rgba(255,255,255,0.6); font-size: 11px;">${label}</span>`
    }
    html += `<span style="color: ${p.color}; font-size: 16px; font-weight: 700;">${p.value}</span>`
    html += `</div>`
  })
  html += `</div>`
  return html
}

/**
 * 生成 item trigger 类型 tooltip 的 HTML 内容（用于饼图等）
 * @param param ECharts tooltip param（单个对象）
 * @returns HTML 字符串
 */
export function itemTooltipHtml(param: TooltipParamItem): string {
  const label = param.name || param.seriesName || ''
  const value = param.value !== undefined ? param.value : ''
  const percent = param.percent !== undefined ? ` (${param.percent}%)` : ''
  let html = `<div style="background: url(/images/echartsPop-up@2x.png) no-repeat center center / 100% 100%; padding: 14px 18px; min-width: 180px;">`
  html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 24px;">`
  html += `<span style="background: linear-gradient( 90deg, rgba(75,87,107,0.6) 0%, rgba(75,87,107,0) 100%);; padding: 3px 10px;width:100%; border-radius: 3px; color: rgba(255,255,255,0.6); font-size: 11px;">${label}</span>`
  html += `<span style="color: #fff; font-size: 16px; font-weight: 700;">${value}${percent}</span>`
  html += `</div>`
  html += `</div>`
  return html
}

/**
 * 标准 axis tooltip 配置（带背景图风格）
 * @param extra 额外的 tooltip 配置项
 */
export function axisTooltipConfig(extra?: Record<string, unknown>) {
  return {
    trigger: 'axis',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    textStyle: { color: '#fff' },
    appendToBody: true,
    formatter: (params: TooltipParamItem[]) =>{
      return axisTooltipHtml(params)
    } ,
    ...extra
  }
}

/**
 * 标准 item tooltip 配置（带背景图风格，用于饼图等）
 * @param extra 额外的 tooltip 配置项
 */
export function itemTooltipConfig(extra?: Record<string, unknown>) {
  return {
    trigger: 'item',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    textStyle: { color: '#fff' },
    appendToBody: true,
    formatter: (param: TooltipParamItem) => itemTooltipHtml(param),
    ...extra
  }
}
