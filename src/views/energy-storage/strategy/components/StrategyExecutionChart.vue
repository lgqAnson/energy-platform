<template>
  <div class="strategy-chart-panel">
    <v-chart class="strategy-chart" :option="strategyOption" autoresize />
    <button class="manage-strategy-btn" @click="$emit('manage')">
      <Settings class="manage-btn-icon" />
      <span>管理充放电策略</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Settings } from 'lucide-vue-next'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

defineEmits<{ manage: [] }>()

const strategyOption = computed(() => ({
  backgroundColor: '#0a172a',
  title: {
    text: '策略执行情况',
    top: 15,
    left: 15,
    textStyle: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold'
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' }
  },
  legend: {
    data: [
      { name: '充放电策略配置', icon: 'rect' },
      { name: '充放电实际情况', icon: 'rect' }
    ],
    top: 20,
    right: 20,
    textStyle: { color: '#8a93a5' },
    itemWidth: 24,
    itemHeight: 10
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '10%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
    ],
    axisLine: { lineStyle: { color: '#1a273f' } },
    axisLabel: { color: '#8a93a5', interval: 0 },
    axisTick: { show: false, alignWithLabel: true },
    splitLine: { show: true, lineStyle: { color: '#1a273f' } }
  },
  yAxis: {
    type: 'value',
    min: -300,
    max: 400,
    interval: 50,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#8a93a5' },
    splitLine: { show: true, lineStyle: { color: '#1a273f' } }
  },
  series: [
    {
      name: '充放电策略配置',
      type: 'bar',
      barWidth: '100%',
      itemStyle: { color: '#28364c' },
      data: [
        -50, -50, -50, -50, -50, -50, -50, -50,
        0, 0, 0, 0, 0,
        80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80
      ]
    },
    {
      name: '充放电实际情况',
      type: 'bar',
      barWidth: '100%',
      barGap: '-100%',
      itemStyle: { color: '#5599ff' },
      label: {
        show: true,
        position: 'inside',
        color: '#ffffff',
        fontWeight: 'bold',
        formatter: function (params: any) {
          return params.value !== null && params.value !== '-' ? params.value : ''
        }
      },
      data: [
        -58.65, '-', '-', '-', '-', '-', '-', '-',
        '-', '-', '-', '-', '-',
        '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'
      ]
    }
  ]
}))
</script>

<style scoped>
.strategy-chart-panel {
  flex: 1.2;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.strategy-chart {
  flex: 1;
  min-height: 0;
}

.manage-strategy-btn {
  position: absolute;
  bottom: 16px;
  right: 0;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.85) 0%, rgba(2, 167, 240, 0.6) 100%);
  border: 1px solid rgba(2, 167, 240, 0.5);
  border-radius: 4px;
  padding: 7px 18px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.manage-strategy-btn:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.8) 100%);
  box-shadow: 0 0 12px rgba(2, 167, 240, 0.3);
}

.manage-btn-icon {
  width: 15px;
  height: 15px;
}
</style>
