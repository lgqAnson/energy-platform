/**
 * 通用类型定义
 * 业务组件中频繁使用的接口建议统一收敛到这里
 */

/** 分页响应结构 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 下拉选项 */
export interface SelectOption {
  label: string
  value: string | number
}

/** 表格排序 */
export interface TableSort {
  prop: string
  order: 'ascending' | 'descending' | null
}

/** 时间范围 */
export interface DateRange {
  startDate: string
  endDate: string
}
