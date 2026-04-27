<template>
  <div v-if="!embedded" class="energy-storage-tabs">
    <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="relative flex items-center justify-center"
      style="width: 124px; height: 43px;">
      <img v-if="route.path === tab.path" src="/images/储能-可视看板/u3496.png"
        class="absolute inset-0 w-full h-full object-fill" style="opacity: 1;" alt="" />
      <img v-else src="/images/储能-可视看板/u3496.png" class="absolute inset-0 w-full h-full object-fill"
        style="opacity: 0.35;" alt="" />
      <div v-if="route.path === tab.path" class="absolute inset-0 border border-[#01CAFE] rounded-[3px]" />
      <span class="relative z-10 text-[16px] font-medium"
        :class="route.path === tab.path ? 'text-white' : 'text-[#D7D7D7]'">
        {{ tab.name }}
      </span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{ embedded?: boolean }>()
const route = useRoute()

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

<style scoped>
.energy-storage-tabs {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 500px;
  margin-bottom: 12px;
  flex-shrink: 0;
  /* position: sticky;
  top: 0;
  z-index: 50; */
}
</style>
