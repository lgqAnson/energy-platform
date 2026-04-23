<template>
  <div class="space-y-5">
    <CardPanel title="工商业负荷">
      <div class="h-[400px] flex items-center justify-center text-white/40">
        <div class="text-center space-y-4">
          <Factory class="w-16 h-16 mx-auto opacity-30" />
          <p>工商业负荷模块开发中...</p>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import CardPanel from '@/components/common/CardPanel.vue'
import { Factory } from 'lucide-vue-next'
</script>
