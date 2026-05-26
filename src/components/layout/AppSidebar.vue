<template>
  <!-- Overlay backdrop (tablet/mobile) -->
  <div v-if="overlayMode" class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
    @click="userStore.setSidebarCollapsed(true)" />

  <aside :class="[
    'fixed left-0 transition-all duration-300 z-50 flex flex-col',
    overlayMode ? (userStore.sidebarCollapsed ? '-translate-x-full' : 'translate-x-0 shadow-2xl') : ''
  ]" style="top:calc(35px + var(--header-height)) ; bottom: 0; width: 70px;">

<!-- 顶部展开/收起按钮 -->
      <img
        ref="toggleIconRef"
        :src="userStore.sidebarCollapsed ? '/icons/expand.png' : '/icons/foldUp.png'"
        class="object-contain cursor-pointer"
        style="filter: drop-shadow(0 0 6px rgba(2, 167, 240, 0.5));margin-left: -24px;"
        alt=""
        @click="userStore.toggleSidebar()"
      />

    <nav ref="navRef" v-show="!userStore.sidebarCollapsed || isMenuAnimating" :class="['relative flex-1 py-2', { 'overflow-hidden': isMenuAnimating }]" style="padding-top: 36px;">
      <template v-for="(group, gi) in visibleMenuGroups" :key="group.title">
        <!-- 组间分隔线 -->
        <div v-if="gi > 0" class="mx-5 my-2 h-px" style="background: rgba(255,255,255,0.06);" />
        <div class="mb-1" style="background: linear-gradient( 0deg, rgba(68,121,255,0) 0%, rgba(68,121,255,0.36) 50%, rgba(68,121,255,0) 100%);border-right: 1px solid transparent;border-image: linear-gradient(180deg, rgba(69,131,255,0) 0%, rgba(69,131,255,1) 50%, rgba(69,131,255,0) 100%) 1;">
          <!-- 菜单项：仅显示图标 -->
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            :class="[
              'menu-item relative flex items-center  py-5 transition-all duration-200',
              isActive(item) ? 'active' : 'inactive'
            ]"
            :style="{paddingLeft: '18px',
                // background: isActive(item)? '#02A7F0':''
            }"
          >
            <!-- 左侧选中发光竖条 -->

            <!-- 图标 -->
            <img
              :src="item.icon"
              class="menu-icon w-6 h-6 flex-shrink-0 transition-all duration-200"
              alt=""
            />

            <!-- 选中悬浮标签外包裹层（absolute 定位，相对于 menu-item） -->
            <Transition name="tooltip-fade">
              <div
                v-if="isActive(item)"
                class="active-tooltip-wrapper absolute left-[calc(100%-8px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none"
              >
                <!-- 左侧装饰角（z-index 低于 tooltip，不遮挡背景） -->
                <span class="active-tooltip-decor-left" />
                <span class="active-tooltip-decor-left-hz"></span>
                <span class="active-tooltip-decor-right-hz"></span>
                <!-- 右上装饰角（z-index 低于 tooltip，不遮挡背景） -->
                <span class="active-tooltip-decor-right" />
                <!-- 选中悬浮标签 -->
                <div class="active-tooltip relative flex items-center gap-2 py-1.5 rounded-full whitespace-nowrap" style="z-index: 2;">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background: var(--color-primary); box-shadow: 0 0 4px rgba(2, 167, 240, 0.6);" />
                  <span class="text-xs text-white/90">{{ item.title }}</span>
                </div>
              </div>
            </Transition>
          </router-link>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/composables/useResponsive'

const route = useRoute()
const userStore = useUserStore()
const { isTouch } = useResponsive()

/** 导航区域 DOM 引用 */
const navRef = ref<HTMLElement>()
/** 菜单动画是否正在执行中（控制 nav 元素显隐时机） */
const isMenuAnimating = ref(false)


const overlayMode = computed(() => isTouch.value)

interface MenuItem {
  title: string
  path: string
  match?: string
  icon: string
  /** 允许访问该菜单的角色列表，未指定则对所有角色可见 */
  roles?: string[]
}

const allMenuGroups = [
  {
    title: '业务模块',
    items: [
      { title: '设备', path: '/device', icon: '/icons/icon-device-management@2x.png' },
      { title: '储能', path: '/energy-storage/dashboard', match: '/energy-storage', icon: '/icons/icon-energy-storage@2x.png' },
      { title: '光伏', path: '/solar/monitor', match: '/solar', icon: '/icons/icon-solar@2x.png' },
      { title: '充电桩', path: '/charging-station', icon: '/icons/chargingPile.png' },
      { title: '负荷', path: '/commercial-load', icon: '/icons/icon-commercial-load@2x.png' },
      { title: '告警', path: '/alarm-center', icon: '/icons/icon-alarm-center@2x.png' }
    ] as MenuItem[]
  }
]
// 收集所有用于匹配的菜单路径
/** 根据当前用户角色过滤后的菜单组 */
const visibleMenuGroups = computed(() =>
  allMenuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(userStore.userInfo.role ?? '')
      )
    }))
    .filter((group) => group.items.length > 0)
)

// 收集所有用于匹配的菜单路径
const allMatchPaths = computed(() =>
  visibleMenuGroups.value.flatMap((g) => g.items.map((i) => i.match || i.path))
)

/**
 * 判断当前路由是否匹配指定菜单项
 * 支持精确匹配和前缀匹配，多个菜单项前缀冲突时选最长匹配
 * @param item 菜单项配置
 * @returns 是否处于活跃状态
 */
const isActive = (item: MenuItem) => {
  const matchPath = item.match || item.path

  // 精确匹配
  if (route.path === matchPath) return true

  // 前缀匹配
  if (!route.path.startsWith(matchPath + '/')) return false

  // 如果有其他菜单项匹配得更精确（更长），则当前 path 不视为活跃
  const hasMoreSpecific = allMatchPaths.value.some(p =>
    p !== matchPath &&
    p.length > matchPath.length &&
    (route.path === p || route.path.startsWith(p + '/'))
  )
  return !hasMoreSpecific
}
onMounted(() => {
  // 确保菜单项的图标已加载
  console.log('Filtering menu groups for role:', userStore.userInfo)
})


/** 监听侧边栏状态变化 */
watch(
  () => userStore.sidebarCollapsed,
  async (collapsed) => {
    if (!collapsed) {
    } 
  }
)

onUnmounted(() => {
  
})
</script>

<style scoped>

/* 菜单项基础 */
.menu-item {
  position: relative;
  will-change: transform, opacity;
}

/* 未选中：图标灰色 */
.menu-item.inactive .menu-icon {
  opacity: 0.45;
  filter: grayscale(0.8);
}

.menu-item.inactive:hover .menu-icon {
  opacity: 0.75;
  filter: grayscale(0.4);
}

/* 选中：左侧发光竖条 */
.menu-item.active .active-bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, transparent 0%, #02A7F0 50%, transparent 100%);
  border-radius: 0 1px 1px 0;
  box-shadow: 0 0 8px rgba(2, 167, 240, 0.6);
}

/* 选中：图标蓝色发光 */
.menu-item.active .menu-icon {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(2, 167, 240, 0.8));
}

/* 选中悬浮标签 — 使用 CSS 动画作为 fallback，animejs 会覆盖 */
.active-tooltip {
  padding: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 27px 27px 27px 27px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  animation: tooltipSpring 0.48s ease-out both;
}

/* 左侧装饰角（z-index 低于 tooltip，不遮挡背景） */
.active-tooltip-decor-left {
  position: absolute;
  top: 50%;
  left: -10px;
  width: 20px;
  height: 20px;
  background-color: #10141a;
  border-left: #02A7F0 1px solid;
  border-bottom-left-radius: 20px;
  box-shadow: #0055FF -11px -8px 15px 4px;;
  z-index: 1
}
.active-tooltip-decor-left-hz {
    position: absolute;
    top: 115%;
    left: -1.5px;
    width: 10px;
    background-color: transparent;
    height: 20px;
    border-right: rgba(2, 167, 240,0.5) 1px solid;
    border-top-right-radius: 20px;
    box-shadow: #10141a 5px -5px 4px;
    z-index: 2;
}
/* 右上装饰角（z-index 低于 tooltip，不遮挡背景） */
.active-tooltip-decor-right {
  position: absolute;
  top: -7px;
  left: -10px;
  width: 20px;
  height: 20px;
  background-color: #10141a;
  border-left: #02A7F0 1px solid;
  border-top-left-radius: 20px;
  /* box-shadow: #0055FF 0 0 4px; */
  z-index: 1
}
.active-tooltip-decor-right-hz {
     position: absolute;
    top: -94%;
    left: -1.5px;
    width: 10px;
    background-color: transparent;
    height: 20px;
    border-right: rgba(2, 167, 240,0.5) 1px solid;
    border-bottom-right-radius: 20px;
    box-shadow: #10141a 5px 3px 4px;
    z-index: 2;
}

/* 选中悬浮标签外包裹层过渡 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-50%) scale(0.85);
}

/**
 * Tooltip 弹性弹出关键帧
 * 模拟 spring 物理模型的 overshoot 效果：
 * 小 → 微超弹跳 → 回缩 → 稳定
 * 注意：不包含 translateY，由 wrapper 的 -translate-y-1/2 统一控制垂直居中
 */
@keyframes tooltipSpring {
  0%   { opacity: 0; transform: scale(0.75); }
  55%  { opacity: 1; transform: scale(1.07); }
  72%  { transform: scale(0.96); }
  88%  { transform: scale(1.02); }
  100% { opacity: 1; transform: scale(1); }
}

/* 无障碍：减少动画偏好时禁用所有过渡和动画 */
@media (prefers-reduced-motion: reduce) {
  .menu-item,
  .menu-item .menu-icon,
  .toggle-icon-wrapper img,
  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active,
  .active-tooltip {
    transition-duration: 0s !important;
    animation: none !important;
  }
}
</style>
