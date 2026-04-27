import { ref, computed } from 'vue'

export function usePagination<T>(list: T[], defaultSize = 10) {
  const page = ref(1)
  const pageSize = ref(defaultSize)

  const total = computed(() => list.length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  })

  const pageList = computed(() => {
    const pages: number[] = []
    for (let i = 1; i <= totalPages.value; i++) pages.push(i)
    return pages
  })

  function reset() {
    page.value = 1
  }

  return { page, pageSize, total, totalPages, paginated, pageList, reset }
}
