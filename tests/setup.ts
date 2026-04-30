import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.innerWidth / innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1600
})

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 900
})

// Mock addEventListener/removeEventListener
window.addEventListener = vi.fn() as unknown as typeof window.addEventListener
window.removeEventListener = vi.fn() as unknown as typeof window.removeEventListener
