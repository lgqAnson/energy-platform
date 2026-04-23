<template>
  <div class="charts-row">
    <div class="chart-panel">
      <div class="chart-title">历史充放电量统计（按日/时段）</div>
      <v-chart class="chart-canvas" :option="historyOption" autoresize />
    </div>
    <div class="chart-panel">
      <div class="chart-title">当日实时充放电曲线</div>
      <v-chart class="chart-canvas" :option="realtimeOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const historyOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff', fontSize: 11 }
  },
  legend: {
    data: ['充电量(峰时段)', '充电量(平时段)', '放电量(峰时段)', '放电量(平时段)'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
    itemWidth: 10,
    itemHeight: 10,
    top: 0,
    right: 0
  },
  grid: { left: '2%', right: '4%', bottom: '6%', top: '18%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['3/5', '3/6', '3/7', '3/8', '3/9', '3/10', '3/11', '3/12', '3/13', '3/14', '3/15', '3/16'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  series: [
    { name: '充电量(峰时段)', type: 'bar', stack: 'charge', data: [120, 132, 101, 134, 90, 230, 210, 180, 150, 200, 170, 190], itemStyle: { color: '#52C41A' } },
    { name: '充电量(平时段)', type: 'bar', stack: 'charge', data: [220, 182, 191, 234, 290, 330, 310, 280, 250, 300, 270, 290], itemStyle: { color: '#02A7F0' } },
    { name: '放电量(峰时段)', type: 'bar', stack: 'discharge', data: [150, 232, 201, 154, 190, 330, 410, 350, 300, 380, 320, 340], itemStyle: { color: '#FAAD14' } },
    { name: '放电量(平时段)', type: 'bar', stack: 'discharge', data: [320, 332, 301, 334, 390, 330, 320, 350, 380, 340, 360, 370], itemStyle: { color: '#f97316' } }
  ]
}))

const realtimeOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff', fontSize: 11 }
  },
  legend: {
    data: ['关口功率', '并网功率', '充放电功率'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
    itemWidth: 14,
    itemHeight: 2,
    top: 0,
    right: 0
  },
  grid: { left: '2%', right: '4%', bottom: '6%', top: '18%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  series: [
    { name: '关口功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#02A7F0', width: 2 }, data: [0, 0, 0, 200, 800, 1200, 1400, 1300, 1100, 900, 600, 200, 0] },
    { name: '并网功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#52C41A', width: 2 }, data: [0, 0, 0, 150, 600, 1000, 1200, 1100, 900, 700, 400, 150, 0] },
    { name: '充放电功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#FAAD14', width: 2 }, data: [0, 0, 0, 100, 400, 800, 1000, 900, 700, 500, 300, 100, 0] }
  ]
}))
</script>

<style scoped>
.charts-row {
  display: flex;
  gap: 12px;
  height: 100%;
}

.chart-panel {
  flex: 1;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #02A7F0;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.chart-canvas {
  flex: 1;
  min-height: 0;
}
</style>