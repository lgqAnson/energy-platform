<template>
  <aside :class="[
    'fixed left-0 top-0 h-full transition-all duration-300 z-50 flex flex-col',
    collapsed ? 'w-[64px]' : 'w-[140px]'
  ]" style="background: transparent;">
    <!-- 侧边栏背景图 -->
    <div v-if="!collapsed" class="absolute inset-0 bg-cover bg-left-top"
      style="background-image: url('/images/资源关联/u22.png'); opacity: 0.15;" />

    <nav class="relative flex-1 overflow-y-auto py-2" style="margin-top: 74px;">
      <div v-for="group in menuGroups" :key="group.title" class="mb-1">
        <!-- 菜单项 -->
        <router-link v-for="item in group.items" :key="item.path" :to="item.path" :class="[
          'flex flex-col items-center py-2 transition-all duration-200 group relative',
          isActive(item.path)
            ? 'text-white'
            : 'text-white/60 hover:text-white/80'
        ]" :style="isActive(item.path) ? 'text-shadow: 0 0 5px rgba(255, 255, 255, 0.68);' : ''">
          <!-- 选中指示器 -->
          <div v-if="isActive(item.path)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
          <component :is="item.icon" class="w-6 h-6 flex-shrink-0 mb-1" />
          <span v-if="!collapsed" class="text-xs whitespace-nowrap" style="font-size: 12px;">
            {{ item.title }}
          </span>
          <!-- 分隔线 -->
          <div v-if="!collapsed" class="w-[67px] h-px mt-1" style="background: rgba(255, 255, 255, 0.1);" />
        </router-link>
      </div>
    </nav>

    <!-- 折叠按钮 -->
    <div class="relative p-2">
      <button @click="toggleSidebar"
        class="w-full flex items-center justify-center py-2 text-white/50 hover:text-white transition-colors">
        <Menu v-if="collapsed" class="w-5 h-5" />
        <PanelLeftClose v-else class="w-5 h-5" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Battery,
  Sun,
  Zap,
  Factory,
  Bell,
  FileText,
  LayoutDashboard,
  Activity,
  Settings,
  Receipt,
  TrendingUp,
  Wrench,
  Cpu,
  Menu,
  PanelLeftClose
} from 'lucide-vue-next'

const route = useRoute()
const userStore = useUserStore()
const collapsed = computed(() => userStore.sidebarCollapsed)

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleSidebar = () => {
  userStore.toggleSidebar()
}

const menuGroups = [
  {
    title: '储能管理',
    items: [
      { title: '设备管理', path: '/energy-storage/device', icon: Cpu }
    ]
  },
  {
    title: '光伏管理',
    items: [
      { title: '储能', path: '/solar/energy-storage', icon: Activity },
      { title: '光伏', path: '/solar/metering', icon: Sun }
    ]
  },
  {
    title: '其他',
    items: [
      { title: '充电桩', path: '/charging-station', icon: Zap },
      { title: '工商业负荷', path: '/commercial-load', icon: Factory },
      { title: '告警中心', path: '/alarm-center', icon: Bell }
    ]
  }
  // ,
  // {
  //   title: '系统',
  //   items: [
  //     { title: '登录日志', path: '/login-log', icon: FileText }
  //   ]
  // }
]
</script>
