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
defineOptions({
  name: 'EnergyStorageDashboard'
})
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { energyStorageTabs } from '@/constants/navigation'
import StationOverviewPanel from './components/StationOverviewPanel.vue'
import Scene3DPanel from './components/Scene3DPanel.vue'
import ChargeAnalysisPanel from './components/ChargeAnalysisPanel.vue'
import RevenueStatsPanel from './components/RevenueStatsPanel.vue'
import AlarmStatsPanel from './components/AlarmStatsPanel.vue'
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}
.upper-section {
  display: flex;
  gap: 16px;
}
.lower-section {
  display: flex;
  gap: 16px;
}

/* Tablet and below: stack panels vertically */
@media (max-width: 1199px) {
  .upper-section,
  .lower-section {
    flex-direction: column;
  }
}
</style>
