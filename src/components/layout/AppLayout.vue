<template>
  <div class="relative min-h-screen overflow-hidden"
  style="background: #0A1628 url('/images/bg-new.png') no-repeat center center fixed; background-size: cover;">
    <AppSidebar />
    <AppHeader />
    <main class="relative pt-[var(--header-height)] min-h-screen transition-all duration-300"
      :style="{ paddingLeft: sidebarWidth, zIndex: 1 ,marginTop:'35px'}">
      <div class="h-full">
        <router-view />
      </div>
    </main>
    <ConnectionStatus />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResponsive } from '@/composables/useResponsive'
import { useUserStore } from '@/stores/user'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'

const { isTouch } = useResponsive()
const userStore = useUserStore()

const sidebarWidth = computed(() => {
  if (isTouch.value) return '0px'
  if (userStore.sidebarCollapsed) return '28px'
  return 'calc(var(--sidebar-width) + 8px)'
})
</script>
