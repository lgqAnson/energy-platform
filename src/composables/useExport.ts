import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'
import { isApiMockMode } from '@/utils/env'

export interface ExportColumn {
  header: string
  key: string
}

/**
 * 双模导出：mock 模式下走客户端 Excel，联调/生产模式下调用后端 blob 接口
 *
 * @param params.apiCall      后端导出函数（返回 blob）
 * @param params.filename     文件名前缀
 * @param params.columns      客户端导出时的列映射
 * @param params.data         客户端导出时的数据源
 * @param params.sheetName    工作表名
 * @param params.apiParams    传给后端 API 的查询参数
 */
export async function serverExport(params: {
  apiCall: (queryParams: Record<string, unknown>) => Promise<unknown>
  filename: string
  columns: ExportColumn[]
  data: Record<string, unknown>[]
  sheetName?: string
  apiParams?: Record<string, unknown>
}): Promise<void> {
  const { apiCall, filename, columns, data, sheetName, apiParams } = params

  if (isApiMockMode) {
    // mock 模式：客户端直接生成 Excel
    if (data.length === 0) {
      ElMessage.warning('没有数据可导出')
      return
    }
    exportToExcel(data, columns, filenameWithDate(filename), sheetName)
    ElMessage.success('导出成功')
  } else {
    // 联调/生产模式：调用后端 blob 接口
    try {
      const blob = await apiCall(apiParams ?? {}) as Blob
      downloadBlob(blob, filenameWithDate(filename))
      ElMessage.success('导出成功')
    } catch {
      ElMessage.error('导出失败，请稍后重试')
    }
  }
}

/**
 * 生成带日期后缀的文件名
 * @param prefix 文件名前缀
 * @returns 带日期后缀的文件名，如 "收益数据_2026-05-06"
 */
export function filenameWithDate(prefix: string): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  return `${prefix}_${date}`
}

/**
 * 触发浏览器下载 Blob 文件
 * @param blob 服务端返回的 Blob 数据
 * @param filename 下载文件名（不含扩展名）
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 将数据数组导出为单工作表的 Excel 文件（.xlsx）
 * @param data 数据数组
 * @param columns 列映射（header → 表头显示文字，key → 数据对象属性名）
 * @param filename 文件名（不含扩展名和日期后缀 — 会自动追加日期）
 * @param sheetName 工作表名称
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  columns: ExportColumn[],
  filename: string,
  sheetName = 'Sheet1'
): void {
  if (data.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  const exportData = data.map(row => {
    const mapped: Record<string, unknown> = {}
    columns.forEach(col => {
      mapped[col.header] = row[col.key] ?? ''
    })
    return mapped
  })

  const ws = XLSX.utils.json_to_sheet(exportData)
  ws['!cols'] = columns.map(col => ({
    wch: Math.max(col.header.length * 2, 12)
  }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * 将多组数据导出为多工作表的 Excel 文件（.xlsx）
 * @param sheets 工作表数组，每项包含名称、数据和列映射
 * @param filename 文件名（不含扩展名和日期后缀 — 会自动追加日期）
 */
export function exportToExcelMultiSheet(
  sheets: { name: string; data: Record<string, unknown>[]; columns: ExportColumn[] }[],
  filename: string
): void {
  if (sheets.length === 0 || sheets.every(s => s.data.length === 0)) {
    ElMessage.warning('没有数据可导出')
    return
  }

  const wb = XLSX.utils.book_new()

  sheets.forEach(sheet => {
    if (sheet.data.length === 0) return
    const exportData = sheet.data.map(row => {
      const mapped: Record<string, unknown> = {}
      sheet.columns.forEach(col => {
        mapped[col.header] = row[col.key] ?? ''
      })
      return mapped
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    ws['!cols'] = sheet.columns.map(col => ({
      wch: Math.max(col.header.length * 2, 12)
    }))
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  })

  XLSX.writeFile(wb, `${filename}.xlsx`)
}
