<template>
  <div class="maintenance-container">
    <EnergyStorageTabs :embedded="embedded" />
    <CardPanel title="运维管理">
      <div class="h-[400px] flex items-center justify-center text-white/40">
        <div class="text-center space-y-4">
          <Wrench class="w-16 h-16 mx-auto opacity-30" />
          <p>运维管理模块开发中...</p>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import EnergyStorageTabs from '@/components/common/EnergyStorageTabs.vue'
import CardPanel from '@/components/common/CardPanel.vue'
import { Wrench } from 'lucide-vue-next'

defineProps<{ embedded?: boolean }>()
</script>

<style scoped>
.maintenance-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}
</style>
