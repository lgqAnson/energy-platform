<template>
  <header class="fixed top-0 right-0 z-40 transition-all duration-300" style="left: 0;">
    <!-- 顶部栏背景 -->
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('/images/header-bg@2x.png');" />

    <!-- 内容 -->
    <div class="relative z-10 flex flex-col w-full" style="height: var(--header-height);">
      <!-- 第一行：标题 + 信息 -->
      <div class="flex items-center justify-between flex-1 min-h-0">
        <!-- 左侧：汉堡菜单 + 标题 + 折线 -->
        <div class="flex items-center" style="padding-left: 24px; position: relative;">
          <!-- 平板/手机端汉堡菜单 -->
          <button v-if="isTouch" @click="userStore.toggleSidebar()"
            class="mr-3 text-white/70 hover:text-white transition-colors">
            <Menu class="w-6 h-6" />
          </button>
          <h1 class="font-bold whitespace-nowrap page-title" style="position: absolute; top:0">
            {{ pageTitle }}
          </h1>
        </div>

        <!-- 右侧信息 -->
        <div class="flex items-center" style="padding-right: var(--header-padding-right);">
          <div class="hidden md:flex items-center text-white text-sm gap-2">
            <span class="time-text">{{ currentTime }}</span>
            <span class="divider">|</span>
            <span class="date-text">{{ currentDate }}</span>
            <span class="date-text">{{ currentWeekday }}</span>
            <span class="divider">|</span>
            <div class="flex items-center cursor-pointer user-info" >
              <img src="/icons/img-default-avatar@2x.png" class="w-[18px] h-[18px] mr-1" alt="avatar" />
              <span class="mr-1">{{ userStore.userInfo.name }}</span>
              <span class="divider">|</span>
              <img src="/icons/img-logout@2x.png" class="w-[18px] h-[18px] mr-1" alt="avatar" @click="handleCommand('logout')"/>
              <!-- <Settings class="w-4 h-4 text-white/80 hover:text-white" /> -->
            </div>
          </div>

          <!-- 移动端简化的用户信息 -->
          <div class="md:hidden flex items-center">
            <img src="/icons/img-default-avatar@2x.png" class="w-[24px] h-[24px] mr-1" alt="avatar" />
            <span class="text-white text-xs">{{ userStore.userInfo.name }}</span>
          </div>
        </div>
      </div>

      <!-- 第二行：模块 Tab 导航（仅在储能模块路由下显示） -->
      <div v-if="showEnergyTabs" class="flex items-center h-[44px]" style="padding: 0 12px;">
        <div ref="tabContainerRef" class="module-tabs">
          <router-link v-for="(tab, index) in energyStorageTabs" :key="tab.path" :to="tab.path"
            :ref="el => setTabRef(el, index)"
            class="flex items-center justify-center tab-item" :class="{ active: route.path === tab.path }">
            <img
              v-show="route.path === tab.path"
              src="/images/selected-label@2x.png"
              class="absolute inset-0 w-full h-full object-fill tab-bg"
              alt=""
            />
            <span class="relative z-10 text-[15px] font-medium">
              {{ tab.name }}
            </span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import anime from 'animejs'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/composables/useResponsive'
import { Settings, Menu } from 'lucide-vue-next'
import { energyStorageTabs } from '@/constants/navigation'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isTouch } = useResponsive()

const pageTitle = '能源管理系统'

/** 是否在储能模块路由下，控制 Tab 导航显示 */
const showEnergyTabs = computed(() => route.path.startsWith('/energy-storage'))

/** Tab 容器 DOM 引用 */
const tabContainerRef = ref<HTMLElement>()
/** 各 Tab 项 DOM 引用数组（通过 setTabRef 动态收集） */
const tabRefs = ref<(HTMLElement | null)[]>([])
/**
 * 动态收集每个 Tab 项的 DOM 引用
 * @param el Vue 传递的 DOM 元素或组件实例
 * @param index Tab 在列表中的索引位置
 */
const setTabRef = (el: any, index: number) => {
  if (el) tabRefs.value[index] = el?.$el ?? el
}

const currentTime = ref('')
const currentDate = ref('')
const currentWeekday = ref('')

let timer: ReturnType<typeof setInterval>

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

/**
 * 每秒更新顶部栏显示的时间、日期和星期
 * 使用 toLocaleTimeString / toLocaleDateString 格式化中文展示
 */
const updateTime = () => {
  const now = dayjs()
  currentTime.value = now.format('HH:mm:ss')
  currentDate.value = now.format('YYYY.MM.DD')
  currentWeekday.value = weekdays[now.day()]
}

/** 挂载时立刻更新时间并启动每秒刷新的定时器 */
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

/** 组件卸载时清除定时器 */
onUnmounted(() => {
  clearInterval(timer)
})

/**
 * 处理用户命令（退出登录）
 * @param command 命令标识
 */
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

/**
 * 检测系统是否启用了"减少动画"偏好设置（无障碍降级）
 * @returns 是否应禁用动画效果
 */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** 当前活跃的 Tab 切换动画实例 */
let tabSwitchInstance = null as unknown as { pause: () => void } | null

/**
 * 执行 Tab 切换过渡动画
 * 新激活的 Tab：背景图淡入 + 文字微弹缩放
 * 原激活的 Tab：背景图淡出
 * @param activeIndex 当前激活的 Tab 索引
 */
const playTabSwitchAnimation = async (activeIndex: number) => {
  if (!tabContainerRef.value || prefersReducedMotion()) return

  // 中断正在执行的旧动画
  tabSwitchInstance?.pause()

  await nextTick()
  const allTabs = tabRefs.value.filter(Boolean) as HTMLElement[]

  allTabs.forEach((tabEl, idx) => {
    const bgImg = tabEl.querySelector('.tab-bg') as HTMLElement | null
    const textSpan = tabEl.querySelector('.relative.z-10') as HTMLElement | null

    if (idx === activeIndex) {
      /* === 新激活 Tab：背景淡入 + 文字微弹 === */
      if (bgImg) {
        // 背景图从透明淡入，同时微微放大再回弹
        anime({
          targets: bgImg,
          opacity: [0, 1],
          scale: [0.92, 1.03, 1],
          duration: 400,
          easing: 'easeOutCubic',
        })
      }
      if (textSpan) {
        // 文字微缩放强调
        anime({
          targets: textSpan,
          scale: [0.96, 1.02, 1],
          duration: 360,
          easing: 'easeOutBack',
        })
      }
    } else {
      /* === 非 Tab：背景图平滑淡出 === */
      if (bgImg && parseFloat(getComputedStyle(bgImg).opacity || '0') > 0) {
        anime({
          targets: bgImg,
          opacity: [1, 0],
          duration: 220,
          easing: 'easeInQuad',
        })
      }
    }
  })
}

/** 监听路由变化触发 Tab 切换动画 */
watch(
  () => route.path,
  async (newPath, oldPath) => {
    // 仅在储能模块内部切换时触发
    if (!newPath.startsWith('/energy-storage') || !oldPath?.startsWith('/energy-storage')) return
    const activeIdx = energyStorageTabs.findIndex(t => t.path === newPath)
    if (activeIdx >= 0) playTabSwitchAnimation(activeIdx)
  },
)
</script>

<style scoped>
.page-title {
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  font-size: 36px;
  color: #BDE1FF ;
  text-shadow:
    0 0 10px rgba(2, 167, 240, 0.6),
    0 0 30px rgba(2, 167, 240, 0.4),
    0 0 60px rgba(2, 167, 240, 0.2);
}

/* 黄色折线装饰 */
.decoration-line {
  position: relative;
  width: 80px;
  height: 2px;
  margin-left: 16px;
  background: linear-gradient(90deg, #F5A623 0%, #FFD700 100%);
  transform: skewX(-30deg);
  opacity: 0.9;
}

.decoration-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: -4px;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.4) 0%, rgba(255, 215, 0, 0.4) 100%);
}

.decoration-line::after {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%);
}

.module-tabs {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  flex-wrap: wrap;
  overflow-x: auto;
  /* background: rgba(6, 22, 46, 0.85); */
background: linear-gradient( 90deg, rgba(21,41,75,0) 0%, #15294B 50%, rgba(21,41,75,0) 100%);
border-radius: 0px 0px 0px 0px;
border: 1px solid;
border-image: linear-gradient(90deg, rgba(68, 121, 255, 0), rgba(68, 121, 255, 1), rgba(68, 121, 255, 0)) 1 1;
  border-radius: 4px;
  padding: 3px;
  margin-top: 16px;
  margin-left: 24%;
  box-shadow: inset 0 0 12px rgba(2, 167, 240, 0.08);
  width: 76%;
}

.tab-item {
  flex: 1;
  min-width: 0;
  height: 36px;
  padding: 0 8px;
  border-radius: 3px;
  color: #8C9DBE;
  position: relative;
  cursor: pointer;
  text-decoration: none;
  overflow: hidden;
  white-space: nowrap;
  will-change: transform, opacity;
}

.tab-item:hover {
  color: #B0C4DE;
  background: rgba(2, 167, 240, 0.08);
}

.tab-item.active {
  color: #FFFFFF;
  text-shadow: 0 0 6px rgba(2, 167, 240, 0.6);
}

/* Tab 背景图初始状态（由 anime.js 驱动过渡） */
.tab-bg {
  pointer-events: none;
  z-index: 0;
}

.time-text {
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.date-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.divider {
  color: #00F6FF ;
  font-size: 12px;
  margin: 0 2px;
}

.user-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  transition: color 0.2s;
}

.user-info:hover {
  color: #FFFFFF;
}

/* Tablet */
@media (max-width: 1199px) {
  .page-title {
    font-size: 28px;
  }

  .tab-item {
    min-width: 80px;
    height: 30px;
    padding: 0 12px;
    font-size: 13px !important;
  }

  .decoration-line {
    width: 40px;
  }
}

/* Mobile */
@media (max-width: 767px) {
  .page-title {
    font-size: 22px;
  }

  .tab-item {
    min-width: 60px;
    height: 28px;
    padding: 0 8px;
    font-size: 11px !important;
  }

  .decoration-line {
    width: 20px;
    margin-left: 8px;
  }
}

/* 无障碍：减少动画偏好时禁用 Tab 过渡 */
@media (prefers-reduced-motion: reduce) {
  .tab-item,
  .tab-bg,
  .tab-item span {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
</style>
