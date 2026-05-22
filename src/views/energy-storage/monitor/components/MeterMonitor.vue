<template>
  <div class="meter-panel">
    <div class="panel-header">
      <img src="" class="panel-header-bg" alt="" />
      <span class="panel-header-text">电表数据监测</span>
    </div>
    <div class="meter-table-wrap">
      <table class="data-table">
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
import type { MeterRow } from '../types'

defineProps<{
  meterData: MeterRow[]
}>()
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

/* data-table 基础样式已提取至全局 src/assets/index.css，此处仅保留组件特有覆盖 */
.data-table { font-size: 13px; }

.data-table tbody td:first-child {
  color: rgba(255, 255, 255, 0.6);
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