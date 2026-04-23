<template>
  <div class="monitor-container">
    <!-- 顶部 Tab 导航 -->
    <div v-if="!embedded" class="flex items-center gap-1 mb-4">
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
          <ChargeDischargeCharts />
        </div>

        <!-- 右下：天气 + 电表 -->
        <div class="monitor-right-bottom">
          <WeatherPanel />
          <MeterMonitor />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import TopologyPanel from './components/TopologyPanel.vue'
import EnergyGroupMonitor from './components/EnergyGroupMonitor.vue'
import EnergyBlockMonitor from './components/EnergyBlockMonitor.vue'
import ChargeDischargeCharts from './components/ChargeDischargeCharts.vue'
import WeatherPanel from './components/WeatherPanel.vue'
import MeterMonitor from './components/MeterMonitor.vue'

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

const topologyData = {
  groups: [
    { id: 'G5', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
    { id: 'G8', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
    { id: 'G12', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' }
  ],
  blocks: [
    { id: '01', name: '#1', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '25.3C' },
    { id: '02', name: '#2', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '26.1C' },
    { id: '03', name: '#3', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.8C' },
    { id: '04', name: '#4', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.2C' },
    { id: '05', name: '#5', power: '200kW', capacity: '400kWh', group: 'G12', temperature: '25.5C' }
  ]
}

const energyGroups = ref([
  { id: 'a', name: '能量组 A', power: 856, soc: 78.5, maxTemp: 28.3, minTemp: 25.3, voltage: 382.5, current: 1245, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: 'b', name: '能量组 B', power: 912, soc: 65.2, maxTemp: 36.7, minTemp: 26.1, voltage: 381.8, current: 1320, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
  { id: 'c', name: '能量组 C', power: 798, soc: 82.1, maxTemp: 27.9, minTemp: 25.3, voltage: 383.1, current: 1185, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
])

const energyBlockMonitors = ref([
  { id: '01', name: '能量块 #01', power: 198, soc: 82.3, maxTemp: 25.3, voltage: 382.5, totalVoltage: 615.2, current: 325, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '02', name: '能量块 #02', power: 201, soc: 79.8, maxTemp: 26.1, voltage: 382.3, totalVoltage: 614.8, current: 328, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '03', name: '能量块 #03', power: 195, soc: 76.5, maxTemp: 36.7, voltage: 381.5, totalVoltage: 608.7, current: 322, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
  { id: '04', name: '能量块 #04', power: 197, soc: 74.2, maxTemp: 24.2, voltage: 381.2, totalVoltage: 607.5, current: 320, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '05', name: '能量块 #05', power: 199, soc: 81.1, maxTemp: 25.5, voltage: 382.8, totalVoltage: 616.0, current: 326, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
])
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
  height: calc(100vh - 140px);
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
</style>