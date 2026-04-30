/**
 * 异步状态管理 Composable
 * 为数据加载场景提供统一的 loading / error / empty 状态管理
 */

import { ref, computed, type Ref } from 'vue'

export interface AsyncState<T> {
  loading: Ref<boolean>
  error: Ref<string | null>
  data: Ref<T | null>
  isEmpty: Ref<boolean>
  isReady: Ref<boolean>
  execute: (fetcher: () => Promise<T>) => Promise<void>
  reset: () => void
}

export function useAsyncState<T>(initialData: T | null = null, isEmptyCheck?: (data: T) => boolean): AsyncState<T> {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(initialData) as Ref<T | null>

  const isEmpty = computed(() => {
    if (data.value === null) return true
    if (isEmptyCheck) return isEmptyCheck(data.value)
    if (Array.isArray(data.value)) return data.value.length === 0
    return false
  })

  const isReady = computed(() => !loading.value && !error.value && !isEmpty.value)

  async function execute(fetcher: () => Promise<T>) {
    loading.value = true
    error.value = null
    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '数据加载失败'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    loading.value = false
    error.value = null
    data.value = initialData
  }

  return { loading, error, data, isEmpty, isReady, execute, reset }
}
