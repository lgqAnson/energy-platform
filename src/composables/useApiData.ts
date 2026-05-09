/**
 * 双模数据加载 Composable
 *
 * 封装 useAsyncState，通过 isApiMockMode 标志自动切换数据来源：
 *   mock 模式 → 返回提供的静态 mock 数据
 *   联调模式 → 调用后端 API
 *
 * 联调时只需修改 .env.development 中的 VITE_API_MOCK 即可全局切换。
 */

import { computed, type Ref } from 'vue'
import { useAsyncState, type AsyncState } from './useAsyncState'
import { isApiMockMode } from '@/utils/env'
import type { PageParams, PaginatedResponse, ApiResponse } from '@/api/api'

// ============================================================
// useApiData — 通用双模数据加载
// ============================================================

export function useApiData<T>(
  mockData: T | (() => T),
  apiFetcher: () => Promise<T>,
  options?: { immediate?: boolean }
): AsyncState<T> & { data: Ref<T | null> } {
  const initial = isApiMockMode ? (typeof mockData === 'function' ? null : mockData) : null
  const state = useAsyncState<T>(initial as T | null)

  const fetcher = async () => {
    if (isApiMockMode) {
      const data = typeof mockData === 'function'
        ? (mockData as () => T)()
        : mockData
      // 模拟网络延迟
      await new Promise(r => setTimeout(r, 80 + Math.random() * 120))
      return data
    }
    return apiFetcher()
  }

  if (options?.immediate !== false) {
    state.execute(fetcher)
  }

  return {
    ...state,
    execute: () => state.execute(fetcher),
    data: state.data
  }
}

// ============================================================
// useApiListData — 列表数据双模加载（内置分页）
// ============================================================

export interface ListDataState<T> {
  loading: Ref<boolean>
  error: Ref<string | null>
  data: Ref<T[]>
  isEmpty: Ref<boolean>
  isReady: Ref<boolean>
  execute: (params?: PageParams) => Promise<void>
  reset: () => void
  pagination: {
    page: Ref<number>
    pageSize: Ref<number>
    total: Ref<number>
    setPage: (page: number) => void
    setPageSize: (size: number) => void
  }
}

export function useApiListData<T>(
  mockData: T[],
  apiFetcher: (params: PageParams) => Promise<ApiResponse<PaginatedResponse<T>>>,
  options?: { pageSize?: number }
): ListDataState<T> {
  const loading = computed(() => innerState.loading.value)
  const error = computed(() => innerState.error.value)
  const data = computed(() => innerState.data.value ?? [])
  const isEmpty = computed(() => data.value.length === 0 && !innerState.loading.value)
  const isReady = computed(() => !loading.value && !error.value)

  const innerState = useAsyncState<T[]>(isApiMockMode ? [] : [])

  const page = { value: 1 }
  const pageSize = { value: options?.pageSize ?? 10 }
  const total = { value: 0 }

  const currentParams = { value: undefined as PageParams | undefined }

  const fetcher = async (params?: PageParams) => {
    currentParams.value = params
    if (isApiMockMode) {
      await new Promise(r => setTimeout(r, 50 + Math.random() * 80))
      const q = params?.keyword?.toString().toLowerCase() || ''
      let filtered = mockData
      if (q) {
        filtered = mockData.filter(item =>
          Object.values(item as Record<string, unknown>).some(v =>
            String(v).toLowerCase().includes(q)
          )
        )
      }
      total.value = filtered.length
      const start = ((params?.page ?? page.value) - 1) * (params?.pageSize ?? pageSize.value)
      const pageData = filtered.slice(start, start + (params?.pageSize ?? pageSize.value))
      innerState.data.value = pageData
    } else {
      const res = await apiFetcher(params ?? { page: page.value, pageSize: pageSize.value })
      innerState.data.value = res.data.list
      total.value = res.data.total
      page.value = res.data.page
      pageSize.value = res.data.pageSize
    }
  }

  if (options?.immediate !== false) {
    innerState.execute(() => fetcher({ page: 1, pageSize: pageSize.value }))
  }

  return {
    loading: loading as Ref<boolean>,
    error: error as Ref<string | null>,
    data: data as Ref<T[]>,
    isEmpty: isEmpty as Ref<boolean>,
    isReady: isReady as Ref<boolean>,
    execute: (params?: PageParams) => innerState.execute(() => fetcher(params)),
    reset: () => { innerState.reset(); page.value = 1; total.value = 0 },
    pagination: {
      page: page as Ref<number>,
      pageSize: pageSize as Ref<number>,
      total: total as Ref<number>,
      setPage: (p: number) => {
        page.value = p
        innerState.execute(() => fetcher({ ...currentParams.value, page: p, pageSize: pageSize.value }))
      },
      setPageSize: (s: number) => {
        pageSize.value = s
        page.value = 1
        innerState.execute(() => fetcher({ ...currentParams.value, page: 1, pageSize: s }))
      }
    }
  }
}
