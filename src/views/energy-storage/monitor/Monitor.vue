<template>
  <div class="monitor-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />

    <!-- 主体：左右分栏 -->
    <div class="monitor-main">
      <!-- 左侧：系统拓扑结构图 -->
      <div class="monitor-left">
        <TopologyPanel :groups="topologyData.groups" :blocks="topologyData.blocks" />
      </div>

      <!-- 右侧：多个模块 -->
      <div class="monitor-right">
        <!-- 右上：能量组监控 + 能量块监控 -->
        <div class="monitor-right-top">
          <EnergyGroupMonitor :groups="energyGroups" />
          <EnergyBlockMonitor :blocks="energyBlockMonitors" />
        </div>

        <!-- 右中：充放电图表 -->
        <div class="monitor-right-middle">
          <ChargeDischargeCharts :realtime-series="realtimeSeries" />
        </div>

        <!-- 右下：天气 + 电表 -->
        <div class="monitor-right-bottom">
          <WeatherPanel />
          <MeterMonitor :meter-data="meterData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useEnergyStorageStore } from '@/stores/energyStorage'
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { energyStorageTabs } from '@/constants/navigation'
import TopologyPanel from './components/TopologyPanel.vue'
import EnergyGroupMonitor from './components/EnergyGroupMonitor.vue'
import EnergyBlockMonitor from './components/EnergyBlockMonitor.vue'
import ChargeDischargeCharts from './components/ChargeDischargeCharts.vue'
import WeatherPanel from './components/WeatherPanel.vue'
import MeterMonitor from './components/MeterMonitor.vue'

defineProps<{ embedded?: boolean }>()

const store = useEnergyStorageStore()
const { topologyData, energyGroups, energyBlockMonitors, meterData, realtimeSeries } = storeToRefs(store)

onMounted(() => { store.loadMonitorInitData(); store.startMonitorRealtime() })
onUnmounted(() => store.stopMonitorRealtime())
</script>
<style scoped>
.monitor-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.monitor-main {
  display: flex;
  gap: 12px;
  height: calc(100vh - var(--header-height) - 126px);
  min-height: 600px;
}

.monitor-left {
  width: 38%;
  min-width: 320px;
  flex-shrink: 0;
}

.monitor-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.monitor-right-top {
  display: flex;
  gap: 12px;
  height: 28%;
  min-height: 180px;
}

.monitor-right-top>* {
  flex: 1;
  min-width: 0;
}

.monitor-right-middle {
  height: 34%;
  min-height: 220px;
}

.monitor-right-bottom {
  display: flex;
  gap: 12px;
  height: 28%;
  min-height: 180px;
}

.monitor-right-bottom>* {
  flex: 1;
  min-width: 0;
}

/* Tablet and below: stack vertically */
@media (max-width: 1199px) {
  .monitor-main {
    flex-direction: column;
    height: auto;
  }
  .monitor-left {
    width: 100%;
    min-width: 0;
    min-height: 350px;
  }
  .monitor-right {
    width: 100%;
  }
  .monitor-right-top,
  .monitor-right-middle,
  .monitor-right-bottom {
    height: auto;
    min-height: 0;
  }
}

/* Mobile: further simplification */
@media (max-width: 767px) {
  .monitor-right-top,
  .monitor-right-bottom {
    flex-direction: column;
  }
}
</style>