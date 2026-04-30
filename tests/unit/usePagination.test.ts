import { describe, it, expect } from 'vitest'
import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  const list = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }))

  it('returns first page of data with default pageSize', () => {
    const { paginated, page, pageSize, total } = usePagination(list, 10)

    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(10)
    expect(total.value).toBe(25)
    expect(paginated.value).toHaveLength(10)
    expect(paginated.value[0].id).toBe(1)
    expect(paginated.value[9].id).toBe(10)
  })

  it('returns correct total pages', () => {
    const { totalPages } = usePagination(list, 10)
    expect(totalPages.value).toBe(3)
  })

  it('handles single page', () => {
    const short = list.slice(0, 5)
    const { paginated, totalPages } = usePagination(short, 10)

    expect(totalPages.value).toBe(1)
    expect(paginated.value).toHaveLength(5)
  })

  it('handles empty list', () => {
    const { paginated, total, totalPages } = usePagination([], 10)

    expect(total.value).toBe(0)
    expect(totalPages.value).toBe(1)
    expect(paginated.value).toHaveLength(0)
  })

  it('returns page list for navigation', () => {
    const { pageList } = usePagination(list, 10)
    expect(pageList.value).toEqual([1, 2, 3])
  })
})
