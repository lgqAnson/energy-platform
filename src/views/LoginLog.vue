<template>
  <div class="space-y-5">
    <CardPanel title="登录日志">
      <div class="h-[400px] flex items-center justify-center text-white/40">
        <div class="text-center space-y-4">
          <FileText class="w-16 h-16 mx-auto opacity-30" />
          <p>登录日志模块开发中...</p>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import CardPanel from '@/components/common/CardPanel.vue'
import { FileText } from 'lucide-vue-next'
</script>
