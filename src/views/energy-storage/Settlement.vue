<template>
  <div class="space-y-5">
    <div class="flex items-center gap-1">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        :class="[
          'px-6 py-2.5 text-sm font-medium rounded-t-lg transition-all',
          $route.path === tab.path
            ? 'text-white bg-primary/20 border-b-2 border-primary'
            : 'text-white/50 hover:text-white/80'
        ]"
      >
        {{ tab.name }}
      </router-link>
    </div>
    <CardPanel title="抄表结算">
      <div class="h-[400px] flex items-center justify-center text-white/40">
        <div class="text-center space-y-4">
          <FileText class="w-16 h-16 mx-auto opacity-30" />
          <p>抄表结算模块开发中...</p>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import CardPanel from '@/components/common/CardPanel.vue'
import { FileText } from 'lucide-vue-next'

const tabs = [
  { name: '可视看板', path: '/energy-storage/dashboard' },
  { name: '实时监控', path: '/energy-storage/monitor' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '电价管理', path: '/energy-storage/price' },
  { name: '抄表结算', path: '/energy-storage/settlement' },
  { name: '收益管理', path: '/energy-storage/revenue' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]
</script>
