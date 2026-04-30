import { describe, it, expect, vi } from 'vitest'
import { useAsyncState } from '@/composables/useAsyncState'

describe('useAsyncState', () => {
  it('starts with idle state', () => {
    const state = useAsyncState<string[]>(null)

    expect(state.loading.value).toBe(false)
    expect(state.error.value).toBeNull()
    expect(state.data.value).toBeNull()
    expect(state.isEmpty.value).toBe(true)
  })

  it('sets loading to true during execution', async () => {
    const state = useAsyncState<string[]>()

    const fetcher = vi.fn().mockResolvedValue(['a', 'b'])
    const promise = state.execute(fetcher)

    expect(state.loading.value).toBe(true)
    expect(state.error.value).toBeNull()

    await promise
    expect(state.loading.value).toBe(false)
    expect(state.data.value).toEqual(['a', 'b'])
    expect(state.isEmpty.value).toBe(false)
    expect(state.isReady.value).toBe(true)
  })

  it('handles errors', async () => {
    const state = useAsyncState<string[]>()

    await state.execute(() => Promise.reject(new Error('Network error')))

    expect(state.loading.value).toBe(false)
    expect(state.error.value).toBe('Network error')
    expect(state.data.value).toBeNull()
  })

  it('detects empty array', async () => {
    const state = useAsyncState<string[]>()

    await state.execute(() => Promise.resolve([]))

    expect(state.isEmpty.value).toBe(true)
    expect(state.isReady.value).toBe(false)
  })

  it('uses custom empty check', async () => {
    const state = useAsyncState<{ items: unknown[] }>(null, (d) => d.items.length === 0)

    await state.execute(() => Promise.resolve({ items: [] }))

    expect(state.isEmpty.value).toBe(true)
  })

  it('resets to initial state', async () => {
    const state = useAsyncState<string[]>(null)

    await state.execute(() => Promise.resolve(['x']))
    state.reset()

    expect(state.loading.value).toBe(false)
    expect(state.error.value).toBeNull()
    expect(state.data.value).toBeNull()
  })

  it('handles non-Error rejects', async () => {
    const state = useAsyncState<string[]>()

    await state.execute(() => Promise.reject('string error'))

    expect(state.error.value).toBe('数据加载失败')
  })
})
