<template>
  <div class="dashboard-container">
    <ModuleTabs :tabs="energyStorageTabs" />

    <div class="upper-section">
      <StationOverviewPanel />
      <Scene3DPanel />
    </div>
    <div class="lower-section">
      <ChargeAnalysisPanel />
      <RevenueStatsPanel />
      <AlarmStatsPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import StationOverviewPanel from './components/StationOverviewPanel.vue'
import Scene3DPanel from './components/Scene3DPanel.vue'
import ChargeAnalysisPanel from './components/ChargeAnalysisPanel.vue'
import RevenueStatsPanel from './components/RevenueStatsPanel.vue'
import AlarmStatsPanel from './components/AlarmStatsPanel.vue'

const energyStorageTabs = [
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
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  min-width: 1580px;
}
.upper-section {
  display: flex;
  gap: 16px;
}
.lower-section {
  display: flex;
  gap: 16px;
}
</style>
