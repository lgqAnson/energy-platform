<template>
  <div class="revenue-container">
    <!-- <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" /> -->
    <div class="revenue-page-header">
      <span class="page-title">峰谷价差收益详情</span>
    </div>
    <div class="revenue-main">
      <div class="revenue-left">
        <RevenueChart />
        <RevenueTable :data="revenueTableData ?? []" />
      </div>
      <div class="revenue-right">
        <ExportPanel :revenue-data="revenueData" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { useApiData } from '@/composables/useApiData'
import { getMockRevenueData } from '@/mocks/providers/energyStorage'
import { energyStorageApi } from '@/api/api'

import { energyStorageTabs } from '@/constants/navigation'
import RevenueChart from './components/RevenueChart.vue'
import RevenueTable, { type RevenueRow } from './components/RevenueTable.vue'
import ExportPanel from './components/ExportPanel.vue'
import type { RevenueExportRow } from './components/ExportPanel.vue'

defineProps<{ embedded?: boolean }>()

const { data: revenueTableData } = useApiData<RevenueRow[]>(
  getMockRevenueData,
  () => energyStorageApi.getRevenueList().then(r => r.data as unknown as RevenueRow[])
)

const revenueData = computed<RevenueExportRow[]>(() => (revenueTableData.value ?? []) as unknown as RevenueExportRow[])
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
  width: 50%;
  background-image: url('/images/title@2x.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: left center;
  padding-left: 36px;
  height: 49px;
  display: flex;
  align-items: center;
}
.page-title {
  font-size: 24px;
  font-weight: 500;
    font-style: italic;
  color: #D5F2FF;
}
.revenue-main {
  display: flex;
  gap: 16px;
  flex: 1;

  min-height: 0;
}

.revenue-left {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
    padding: 16px 18px;
  gap: 16px;
  min-width: 0;
}
.revenue-left::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.revenue-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}
.revenue-right {
  position: relative;
  padding: 16px 18px;
  width: 30%;
  flex-shrink: 0;
}
.revenue-right::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.revenue-right::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}
@media (max-width: 1024px) {
  .revenue-main { flex-direction: column; }
  .revenue-right { width: 100%; }
}
</style>
