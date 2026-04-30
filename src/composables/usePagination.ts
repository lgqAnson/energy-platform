/**
 * 客户端分页 Composable
 *
 * 对已加载到前端的列表数据进行前端分页，适用于小到中等规模的数据集。
 *
 * @param list  源数据数组
 * @param defaultSize  每页默认条数，默认 10
 * @returns 分页状态（当前页、每页条数、总条数、总页数）与分页后的数据切片
 */

import { ref, computed } from 'vue'

/**
 * 客户端分页 Composable
 *
 * @param list 源数据数组（响应式或静态均可，调用处传入 ref 的 .value 即可）
 * @param defaultSize 每页默认条数
 * @returns 分页状态与方法
 */
export function usePagination<T>(list: T[], defaultSize = 10) {
  /** 当前页码（从 1 开始） */
  const page = ref(1)
  /** 每页显示条数 */
  const pageSize = ref(defaultSize)

  /** 数据总条数 */
  const total = computed(() => list.length)
  /** 总页数 */
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  /** 当前页对应的数据切片 */
  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  /** 页码数组，用于渲染分页导航 */
  const pageList = computed(() => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
    return pages
  })

  /** 重置到第一页 */
  function reset() {
    page.value = 1
  }

  return { page, pageSize, total, totalPages, paginated, pageList, reset }
}
