<template>
  <div class="relative min-h-screen overflow-hidden" style="background: #0A1628;">
    <!-- 全屏背景图 -->
    <div class="fixed inset-0 bg-cover bg-center" style="background-image: url('/images/登录/u0.png'); z-index: 0;" />
    <AppSidebar />
    <AppHeader />
    <main class="relative pt-[var(--header-height)] min-h-screen transition-all duration-300"
      :style="{ paddingLeft: sidebarWidth, zIndex: 1 }">
      <div class="p-5">
        <router-view />
      </div>
    </main>
    <ConnectionStatus />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useResponsive } from '@/composables/useResponsive'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'

const userStore = useUserStore()
const { isTouch } = useResponsive()

const sidebarWidth = computed(() => {
  if (isTouch.value) return '0px'
  return userStore.sidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-expanded-width)'
})
</script>
