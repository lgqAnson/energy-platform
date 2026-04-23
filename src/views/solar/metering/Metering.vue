<template>
  <div class="space-y-5">
    <CardPanel title="光伏-计量与能效">
      <div class="h-[400px] flex items-center justify-center text-white/40">
        <div class="text-center space-y-4">
          <Activity class="w-16 h-16 mx-auto opacity-30" />
          <p>光伏计量与能效模块开发中...</p>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import CardPanel from '@/components/common/CardPanel.vue'
import { Activity } from 'lucide-vue-next'
</script>
