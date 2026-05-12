<template>
  <div class="relative min-h-screen overflow-hidden" style="background: #0A1628;">
    <AppSidebar />
    <AppHeader />
    <main class="relative pt-[var(--header-height)] min-h-screen transition-all duration-300"
      :style="{ paddingLeft: sidebarWidth, zIndex: 1 }">
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
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import ConnectionStatus from '@/components/common/ConnectionStatus.vue'

const { isTouch } = useResponsive()

const sidebarWidth = computed(() => {
  if (isTouch.value) return '0px'
  return 'var(--sidebar-width)'
})
</script>
