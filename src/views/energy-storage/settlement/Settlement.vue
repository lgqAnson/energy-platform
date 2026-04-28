<template>
  <div class="settlement-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />

    <!-- 页面标题 -->
    <div class="settlement-page-header">
      <span class="page-title">电表数据详情</span>
    </div>

    <!-- 计量电表数据 -->
    <MeterDataSection />
  </div>
</template>

<script setup lang="ts">
import ModuleTabs from '@/components/common/ModuleTabs.vue'

const energyStorageTabs = [
  { name: '可视看板', path: '/energy-storage/dashboard' },
  { name: '实时监控', path: '/energy-storage/monitor' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '电价管理', path: '/energy-storage/price' },
  { name: '抄表结算', path: '/energy-storage/settlement' },
  { name: '收益管理', path: '/energy-storage/revenue' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]
import MeterDataSection from './components/MeterDataSection.vue'

defineProps<{ embedded?: boolean }>()
</script>

<style scoped>
.settlement-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settlement-page-header {
  margin-bottom: 4px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #02A7F0;
}
</style>
