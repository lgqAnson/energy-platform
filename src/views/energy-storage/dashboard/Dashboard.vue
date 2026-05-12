<template>
  <div class="dashboard-container">
    <!-- 左列：电站概况 + 充放电分析 -->
    <StationOverviewPanel class="grid-station" />
    <ChargeAnalysisPanel class="grid-charge" />

    <!-- 右上：3D 场景 -->
    <Scene3DPanel class="grid-scene" />

    <!-- 右下：收益统计 + 告警统计 -->
    <RevenueStatsPanel class="grid-revenue" />
    <AlarmStatsPanel class="grid-alarm" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'EnergyStorageDashboard'
})
import Scene3DPanel from './components/Scene3DPanel.vue'
import ChargeAnalysisPanel from './components/ChargeAnalysisPanel.vue'
import RevenueStatsPanel from './components/RevenueStatsPanel.vue'
import AlarmStatsPanel from './components/AlarmStatsPanel.vue'
import StationOverviewPanel from './components/StationOverviewPanel.vue'
</script>

<style scoped>
.dashboard-container {
  display: grid;
  grid-template-columns: 360px 1fr 320px;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 12px;
  height: calc(100vh - var(--header-height));
  overflow: hidden;
}

.grid-station {
  grid-column: 1;
  grid-row: 1;
}

.grid-charge {
  grid-column: 1;
  grid-row: 2;
}

.grid-scene {
  grid-column: 2 / 4;
  grid-row: 1;
  min-height: 0;
}

.grid-revenue {
  grid-column: 2;
  grid-row: 2;
}

.grid-alarm {
  grid-column: 3;
  grid-row: 2;
}

/* Tablet and below: stack panels vertically */
@media (max-width: 1199px) {
  .dashboard-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    overflow-y: auto;
    height: auto;
    min-height: calc(100vh - var(--header-height));
  }
  .grid-station,
  .grid-charge,
  .grid-scene,
  .grid-revenue,
  .grid-alarm {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
