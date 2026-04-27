<template>
  <div class="revenue-container">
    <EnergyStorageTabs :embedded="embedded" />
    <div class="revenue-page-header">
      <span class="page-title">峰谷价差收益详情</span>
    </div>
    <div class="revenue-main">
      <div class="revenue-left">
        <RevenueChart />
        <RevenueTable />
      </div>
      <div class="revenue-right">
        <ExportPanel />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import EnergyStorageTabs from '@/components/common/EnergyStorageTabs.vue'
import RevenueChart from './components/RevenueChart.vue'
import RevenueTable from './components/RevenueTable.vue'
import ExportPanel from './components/ExportPanel.vue'

defineProps<{ embedded?: boolean }>()
</script>
<style scoped>
.revenue-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.revenue-page-header {
  margin-bottom: 4px;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #02A7F0;
}
.revenue-main {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}
.revenue-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.revenue-right {
  width: 260px;
  flex-shrink: 0;
}
@media (max-width: 1024px) {
  .revenue-main { flex-direction: column; }
  .revenue-right { width: 100%; }
}
</style>
