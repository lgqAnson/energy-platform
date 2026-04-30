/**
 * 响应式断点检测 Composable
 *
 * 提供单例模式的窗口尺寸监听与断点判断能力。
 * 多个组件同时使用时共享同一个 resize 监听器，通过引用计数自动管理生命周期。
 *
 * 断点定义：
 *  - mobile  < 768px  （手机）
 *  - tablet  768-1199px（平板）
 *  - laptop  1200-1599px（笔记本）
 *  - desktop ≥ 1600px（桌面）
 */

import { ref, readonly, computed, onMounted, onUnmounted } from 'vue'

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop'

/** 各断点的最小宽度阈值 */
const BREAKPOINTS: Record<Breakpoint, number> = {
  mobile: 768,
  tablet: 1200,
  laptop: 1600,
  desktop: 1600
}

/** 获取当前窗口宽度，SSR 环境下返回默认值 1600 */
const getWindowWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1600)

/** 获取当前窗口高度，SSR 环境下返回默认值 900 */
const getWindowHeight = () => (typeof window !== 'undefined' ? window.innerHeight : 900)

const windowWidth = ref(getWindowWidth())
const windowHeight = ref(getWindowHeight())

let resizeHandler: (() => void) | null = null
let listenerCount = 0

/** 注册 resize 事件监听器（首次调用时创建） */
function addListener() {
  if (!resizeHandler) {
    resizeHandler = () => {
      windowWidth.value = getWindowWidth()
      windowHeight.value = getWindowHeight()
    }
    window.addEventListener('resize', resizeHandler)
  }
}

/** 移除 resize 事件监听器（引用计数归零时销毁） */
function removeListener() {
  if (resizeHandler && listenerCount <= 0) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
}

/**
 * 响应式断点检测 Composable
 *
 * 在组件挂载时注册 resize 监听，卸载时递减引用计数并清理。
 * 返回只读的窗口尺寸、当前断点以及便捷的判断方法。
 *
 * @returns 窗口尺寸、断点状态与判断函数
 */
export function useResponsive() {
  listenerCount++
  onMounted(() => addListener())
  onUnmounted(() => {
    listenerCount--
    removeListener()
  })

  /** 当前窗口宽度对应的断点 */
  const breakpoint = computed<Breakpoint>(() => {
    const w = windowWidth.value
    if (w < 768) return 'mobile'
    if (w < 1200) return 'tablet'
    if (w < 1600) return 'laptop'
    return 'desktop'
  })

  /** 是否为手机端 */
  const isMobile = computed(() => breakpoint.value === 'mobile')
  /** 是否为平板端 */
  const isTablet = computed(() => breakpoint.value === 'tablet')
  /** 是否为笔记本端 */
  const isLaptop = computed(() => breakpoint.value === 'laptop')
  /** 是否为桌面端 */
  const isDesktop = computed(() => breakpoint.value === 'desktop')

  /** 是否为触屏设备（手机或平板） */
  const isTouch = computed(() => isMobile.value || isTablet.value)

  /** 判断当前窗口宽度是否小于指定断点阈值 */
  const isBelow = (bp: Breakpoint) => windowWidth.value < BREAKPOINTS[bp]
  /** 判断当前窗口宽度是否大于等于指定断点阈值 */
  const isAbove = (bp: Breakpoint) => windowWidth.value >= BREAKPOINTS[bp]

  return {
    windowWidth: readonly(windowWidth),
    windowHeight: readonly(windowHeight),
    breakpoint,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isTouch,
    isBelow,
    isAbove
  }
}
