<template>
  <div class="meter-panel">
    <div class="panel-header">
      <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
      <span class="panel-header-text">电表数据监测</span>
    </div>
    <div class="meter-table-wrap">
      <table class="meter-table">
        <thead>
          <tr>
            <th>参数名称</th>
            <th>A相</th>
            <th>B相</th>
            <th>C相</th>
            <th>平均值</th>
            <th>单位</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in meterData" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.phaseA }}</td>
            <td>{{ row.phaseB }}</td>
            <td>{{ row.phaseC }}</td>
            <td>{{ row.avg }}</td>
            <td>{{ row.unit }}</td>
            <td><span class="status-badge" :class="row.statusType">{{ row.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'

const meterData = ref([
  { name: '电压', phaseA: '221.5', phaseB: '220.8', phaseC: '222.3', avg: '221.5', unit: 'V', status: '正常', statusType: 'normal' },
  { name: '电流', phaseA: '156.8', phaseB: '158.2', phaseC: '155.7', avg: '156.9', unit: 'A', status: '正常', statusType: 'normal' },
  { name: '有功功率', phaseA: '32.5', phaseB: '33.1', phaseC: '32.8', avg: '98.4', unit: 'kW', status: '正常', statusType: 'normal' }
])

// WebSocket 实时数据订阅
useRealtimeChannel('monitor', (payload) => {
  if (payload.meter) {
    payload.meter.forEach((m: any, i: number) => {
      if (meterData.value[i]) {
        meterData.value[i].phaseA = m.phaseA
        meterData.value[i].phaseB = m.phaseB
        meterData.value[i].phaseC = m.phaseC
        meterData.value[i].avg = m.avg
      }
    })
  }
})
</script>

<style scoped>
.meter-panel {
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.panel-header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 200px;
  object-fit: fill;
}

.panel-header-text {
  position: relative;
  z-index: 10;
  font-size: 18px;
  font-weight: 700;
  padding-left: 12px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #02A7F0;
  line-height: 23px;
}

.meter-table-wrap {
  flex: 1;
  overflow: auto;
}

.meter-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.meter-table thead th {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  text-align: center;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.meter-table tbody td {
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  padding: 12px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.meter-table tbody td:first-child {
  color: rgba(255, 255, 255, 0.6);
}

.status-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 4px;
  display: inline-block;
}

.status-badge.normal {
  background: rgba(82, 196, 26, 0.2);
  color: #52C41A;
}

.status-badge.warning {
  background: rgba(250, 173, 20, 0.2);
  color: #FAAD14;
}
</style>