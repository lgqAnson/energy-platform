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
import { ref } from 'vue'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
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
import TopologyPanel from './components/TopologyPanel.vue'
import EnergyGroupMonitor from './components/EnergyGroupMonitor.vue'
import EnergyBlockMonitor from './components/EnergyBlockMonitor.vue'
import ChargeDischargeCharts from './components/ChargeDischargeCharts.vue'
import WeatherPanel from './components/WeatherPanel.vue'
import MeterMonitor from './components/MeterMonitor.vue'
import type {
  EnergyBlockItem,
  EnergyGroupItem,
  MeterRow,
  MonitorRealtimePayload,
  RealtimeChartSeries,
  TopologyBlock,
  TopologyGroup
} from './types'

defineProps<{ embedded?: boolean }>()

const topologyData = ref({
  groups: [
    { id: 'G5', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
    { id: 'G8', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
    { id: 'G12', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' }
  ] as TopologyGroup[],
  blocks: [
    { id: '01', name: '#1', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '25.3°C' },
    { id: '02', name: '#2', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '26.1°C' },
    { id: '03', name: '#3', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.8°C' },
    { id: '04', name: '#4', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.2°C' },
    { id: '05', name: '#5', power: '200kW', capacity: '400kWh', group: 'G12', temperature: '25.5°C' }
  ] as TopologyBlock[]
})

const energyGroups = ref<EnergyGroupItem[]>([
  { id: 'a', name: '能量组 A', power: 856, soc: 78.5, maxTemp: 28.3, minTemp: 25.3, voltage: 382.5, current: 1245, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: 'b', name: '能量组 B', power: 912, soc: 65.2, maxTemp: 36.7, minTemp: 26.1, voltage: 381.8, current: 1320, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
  { id: 'c', name: '能量组 C', power: 798, soc: 82.1, maxTemp: 27.9, minTemp: 25.3, voltage: 383.1, current: 1185, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
])

const energyBlockMonitors = ref<EnergyBlockItem[]>([
  { id: '01', name: '能量块 #01', power: 198, soc: 82.3, maxTemp: 25.3, voltage: 382.5, totalVoltage: 615.2, current: 325, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '02', name: '能量块 #02', power: 201, soc: 79.8, maxTemp: 26.1, voltage: 382.3, totalVoltage: 614.8, current: 328, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '03', name: '能量块 #03', power: 195, soc: 76.5, maxTemp: 36.7, voltage: 381.5, totalVoltage: 608.7, current: 322, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
  { id: '04', name: '能量块 #04', power: 197, soc: 74.2, maxTemp: 24.2, voltage: 381.2, totalVoltage: 607.5, current: 320, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '05', name: '能量块 #05', power: 199, soc: 81.1, maxTemp: 25.5, voltage: 382.8, totalVoltage: 616.0, current: 326, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
])

const meterData = ref<MeterRow[]>([
  { name: '电压', phaseA: '221.5', phaseB: '220.8', phaseC: '222.3', avg: '221.5', unit: 'V', status: '正常', statusType: 'normal' },
  { name: '电流', phaseA: '156.8', phaseB: '158.2', phaseC: '155.7', avg: '156.9', unit: 'A', status: '正常', statusType: 'normal' },
  { name: '有功功率', phaseA: '32.5', phaseB: '33.1', phaseC: '32.8', avg: '98.4', unit: 'kW', status: '正常', statusType: 'normal' }
])

const MAX_POINTS = 50
const realtimeSeries = ref<RealtimeChartSeries>({
  xData: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
  gatePower: [0, 0, 0, 200, 800, 1200, 1400, 1300, 1100, 900, 600, 200, 0],
  gridPower: [0, 0, 0, 150, 600, 1000, 1200, 1100, 900, 700, 400, 150, 0],
  chargeDischargePower: [0, 0, 0, 100, 400, 800, 1000, 900, 700, 500, 300, 100, 0]
})

// WebSocket 实时数据订阅（100ms）
useRealtimeChannel('monitor', (payload: MonitorRealtimePayload) => {
  if (payload.groups) {
    payload.groups.forEach((g, i) => {
      if (energyGroups.value[i]) {
        energyGroups.value[i].power = g.power
        energyGroups.value[i].soc = g.soc
        energyGroups.value[i].maxTemp = g.maxTemp
        energyGroups.value[i].minTemp = g.minTemp
        energyGroups.value[i].voltage = g.voltage
        energyGroups.value[i].current = g.current
        energyGroups.value[i].status = g.status
        energyGroups.value[i].statusType = g.statusType
        energyGroups.value[i].hasWarning = g.hasWarning
        energyGroups.value[i].socColor = g.socColor
      }
    })
  }
  if (payload.blocks) {
    payload.blocks.forEach((b, i) => {
      if (energyBlockMonitors.value[i]) {
        energyBlockMonitors.value[i].power = b.power
        energyBlockMonitors.value[i].soc = b.soc
        energyBlockMonitors.value[i].maxTemp = b.maxTemp
        energyBlockMonitors.value[i].voltage = b.voltage
        energyBlockMonitors.value[i].totalVoltage = b.totalVoltage
        energyBlockMonitors.value[i].current = b.current
        energyBlockMonitors.value[i].status = b.status
        energyBlockMonitors.value[i].statusType = b.statusType
        energyBlockMonitors.value[i].hasWarning = b.hasWarning
        energyBlockMonitors.value[i].socColor = b.socColor
      }
    })
  }
  if (payload.topology) {
    topologyData.value.groups = payload.topology.groups
    topologyData.value.blocks = payload.topology.blocks
  }
  if (payload.meter) {
    payload.meter.forEach((m, i) => {
      if (meterData.value[i]) {
        meterData.value[i].phaseA = m.phaseA
        meterData.value[i].phaseB = m.phaseB
        meterData.value[i].phaseC = m.phaseC
        meterData.value[i].avg = m.avg
      }
    })
  }
  if (payload.realtimePoint) {
    realtimeSeries.value.xData.push(payload.realtimePoint.time)
    realtimeSeries.value.gatePower.push(payload.realtimePoint.gatePower)
    realtimeSeries.value.gridPower.push(payload.realtimePoint.gridPower)
    realtimeSeries.value.chargeDischargePower.push(payload.realtimePoint.chargeDischargePower)

    if (realtimeSeries.value.xData.length > MAX_POINTS) {
      realtimeSeries.value.xData.shift()
      realtimeSeries.value.gatePower.shift()
      realtimeSeries.value.gridPower.shift()
      realtimeSeries.value.chargeDischargePower.shift()
    }
  }
})
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
  height: calc(100vh - 200px);
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