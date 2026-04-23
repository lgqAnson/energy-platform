<template>
  <div class="space-y-5">
    <CardPanel title="光伏-实时监控">
      <div class="h-[400px] flex items-center justify-center text-white/40">
        <div class="text-center space-y-4">
          <Sun class="w-16 h-16 mx-auto opacity-30" />
          <p>光伏实时监控模块开发中...</p>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import CardPanel from '@/components/common/CardPanel.vue'
import { Sun } from 'lucide-vue-next'
</script>
