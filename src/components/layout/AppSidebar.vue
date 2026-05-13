<template>
  <!-- Overlay backdrop (tablet/mobile) -->
  <div v-if="overlayMode" class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
    @click="userStore.setSidebarCollapsed(true)" />

  <aside :class="[
    'fixed left-0 transition-all duration-300 z-50 flex flex-col',
    overlayMode ? (userStore.sidebarCollapsed ? '-translate-x-full' : 'translate-x-0 shadow-2xl') : ''
  ]" style="top:calc(35px + var(--header-height)) ; bottom: 0; width: var(--sidebar-width);">

    <!-- 顶部展开/收起按钮 -->
      <img
        :src="userStore.sidebarCollapsed ? '/icons/expand.png' : '/icons/foldUp.png'"
        class="object-contain cursor-pointer transition-all duration-300"
        style="filter: drop-shadow(0 0 6px rgba(2, 167, 240, 0.5));margin-left: -24px;"
        alt=""
        @click="userStore.toggleSidebar()"
      />

    <nav v-show="!userStore.sidebarCollapsed" class="relative flex-1 py-2" style="padding-top: 36px;">
      <template v-for="(group, gi) in visibleMenuGroups" :key="group.title">
        <!-- 组间分隔线 -->
        <div v-if="gi > 0" class="mx-5 my-2 h-px" style="background: rgba(255,255,255,0.06);" />
        <div class="mb-1" style="background: linear-gradient( 0deg, rgba(68,121,255,0) 0%, rgba(68,121,255,0.36) 50%, rgba(68,121,255,0) 100%);">
          <!-- 菜单项：仅显示图标 -->
          <router-link
            v-for="item in group.items"
            :key="item.path"
            :to="item.path"
            :class="[
              'menu-item relative flex items-center  py-3.5 transition-all duration-200',
              isActive(item) ? 'active' : 'inactive'
            ]"
            style="padding-left: 18px;"
          >
            <!-- 左侧选中发光竖条 -->
            <div v-if="isActive(item)" class="active-bar" />

            <!-- 图标 -->
            <img
              :src="item.icon"
              class="menu-icon w-6 h-6 flex-shrink-0 transition-all duration-200"
              alt=""
            />

            <!-- 选中悬浮标签（absolute 定位，相对于 menu-item） -->
            <div
              v-if="isActive(item)"
              class="active-tooltip absolute left-[calc(100%-18px)] top-1/2 -translate-y-1/2 flex items-center gap-2 py-1.5 rounded-full whitespace-nowrap z-50 pointer-events-none"
            >
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" style="background: var(--color-primary); box-shadow: 0 0 4px rgba(2, 167, 240, 0.6);" />
              <span class="text-xs text-white/90">{{ item.title }}</span>
            </div>
          </router-link>
        </div>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/composables/useResponsive'

const route = useRoute()
const userStore = useUserStore()
const { isTouch } = useResponsive()

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
      { title: '设备', path: '/energy-storage/device', icon: '/icons/icon-device-management@2x.png' },
      { title: '储能', path: '/energy-storage/dashboard', match: '/energy-storage', icon: '/icons/icon-energy-storage@2x.png' },
      { title: '光伏', path: '/solar/monitor', match: '/solar', icon: '/icons/icon-solar@2x.png' },
      { title: '充电桩', path: '/charging-station', icon: '/icons/chargingPile.png' },
      { title: '负荷', path: '/commercial-load', icon: '/icons/icon-commercial-load@2x.png' },
      { title: '告警', path: '/alarm-center', icon: '/icons/icon-alarm-center@2x.png' }
    ] as MenuItem[]
  },
  {
    title: '系统管理',
    items: [
      { title: '登录日志', path: '/login-log', icon: '/icons/img-logout@2x.png', roles: ['admin'] }
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

<style scoped>

/* 菜单项基础 */
.menu-item {
  position: relative;
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

/* 选中悬浮标签 */
.active-tooltip {
  padding: 4px;
 background: rgba(255,255,255,0.2);
border-radius: 27px 27px 27px 27px;
border: 1px solid rgba(255, 255, 255, 0.45);
/* border-image: linear-gradient(90deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 1)) 1 1; */
  animation: tooltipIn 0.2s ease-out;
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}
</style>
