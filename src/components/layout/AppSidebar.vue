<template>
  <!-- Overlay backdrop (tablet/mobile) -->
  <div v-if="overlayMode && !collapsed" class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
    @click="userStore.setSidebarCollapsed(true)" />

  <aside :class="[
    'fixed left-0 top-0 h-full transition-all duration-300 z-50 flex flex-col',
    collapsed ? 'w-[var(--sidebar-collapsed-width)]' : 'w-[var(--sidebar-expanded-width)]',
    overlayMode ? (collapsed ? '-translate-x-full' : 'translate-x-0 shadow-2xl') : ''
  ]" style="background: transparent;">
    <!-- 侧边栏背景图 -->
    <div v-if="!collapsed" class="absolute inset-0 bg-cover bg-left-top"
      style="background-image: url('/images/资源关联/u22.png'); opacity: 0.15;" />

    <nav class="relative flex-1 overflow-y-auto py-2" style="margin-top: var(--header-height);">
      <template v-for="(group, gi) in visibleMenuGroups" :key="group.title">
        <!-- 组间分隔线 -->
        <div v-if="gi > 0 && !collapsed" class="mx-3 my-2 h-px" style="background: rgba(255,255,255,0.08);" />
        <div class="mb-1">
          <!-- 菜单项 -->
          <router-link v-for="item in group.items" :key="item.path" :to="item.path" :class="[
            'flex flex-col items-center py-2 transition-all duration-200 group relative',
            isActive(item)
              ? 'text-white'
              : 'text-white/60 hover:text-white/80'
          ]" :style="isActive(item) ? 'text-shadow: 0 0 5px rgba(255, 255, 255, 0.68);' : ''">
            <!-- 选中指示器 -->
            <div v-if="isActive(item)" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
            <component :is="item.icon" class="w-6 h-6 flex-shrink-0 mb-1" />
            <span v-if="!collapsed" class="text-xs whitespace-nowrap" style="font-size: 12px;">
              {{ item.title }}
            </span>
            <!-- 分隔线 -->
            <div v-if="!collapsed" class="w-[67px] h-px mt-1" style="background: rgba(255, 255, 255, 0.1);" />
          </router-link>
        </div>
      </template>
    </nav>

    <!-- 折叠按钮 -->
    <div class="relative p-2">
      <button @click="userStore.toggleSidebar()"
        class="w-full flex items-center justify-center py-2 text-white/50 hover:text-white transition-colors">
        <Menu v-if="collapsed" class="w-5 h-5" />
        <PanelLeftClose v-else class="w-5 h-5" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/composables/useResponsive'
import {
  Sun,
  Zap,
  Factory,
  Bell,
  Activity,
  Cpu,
  FileText,
  Menu,
  PanelLeftClose
} from 'lucide-vue-next'

const route = useRoute()
const userStore = useUserStore()
const { isTouch, isLaptop } = useResponsive()

const collapsed = computed(() => userStore.sidebarCollapsed)

const overlayMode = computed(() => isTouch.value)

// Auto-collapse on laptop and touch devices, auto-expand on desktop
watch([isLaptop, isTouch], ([laptop, touch]) => {
  if (laptop || touch) {
    userStore.setSidebarCollapsed(true)
  } else {
    userStore.setSidebarCollapsed(false)
  }
}, { immediate: true })

interface MenuItem {
  title: string
  path: string
  match?: string
  icon: any
  /** 允许访问该菜单的角色列表，未指定则对所有角色可见 */
  roles?: string[]
}

const allMenuGroups = [
  {
    title: '业务模块',
    items: [
      { title: '设备管理', path: '/energy-storage/device', icon: Cpu },
      { title: '储能', path: '/energy-storage/dashboard', match: '/energy-storage', icon: Activity },
      { title: '光伏', path: '/solar/monitor', match: '/solar', icon: Sun },
      { title: '充电桩', path: '/charging-station', icon: Zap },
      { title: '工商业负荷', path: '/commercial-load', icon: Factory },
      { title: '告警中心', path: '/alarm-center', icon: Bell }
    ] as MenuItem[]
  },
  {
    title: '系统管理',
    items: [
      { title: '登录日志', path: '/login-log', icon: FileText, roles: ['admin'] }
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
</script>
