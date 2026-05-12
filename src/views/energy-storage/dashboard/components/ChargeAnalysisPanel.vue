<template>
  <div class="panel charge-panel">
    <div class="panel-header-bar">
      <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
      <span class="header-title">充放电分析</span>
    </div>
    <div class="panel-body">
      <img src="/images/储能-可视看板/u3517.svg" class="panel-bg-img" alt="" />
      <div class="panel-inner charge-inner">
        <div class="charge-chart-wrap">
          <v-chart class="charge-chart-el" :option="chargeDischargeChartOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const chargeDischargeChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['放电量(kWh)', '充电量(kWh)'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10,
    icon: 'circle',
    top: 4,
    left: 'center'
  },
  grid: { left: '2%', right: '4%', bottom: '4%', top: '18%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [
    {
      name: '放电量(kWh)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#70B603', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(112, 182, 3, 0.25)' },
            { offset: 1, color: 'rgba(112, 182, 3, 0.02)' }
          ]
        }
      },
      data: [96, 93, 95, 97, 94, 96, 98, 95, 93, 96, 97, 95]
    },
    {
      name: '充电量(kWh)',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#02A7F0', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(2, 167, 240, 0.25)' },
            { offset: 1, color: 'rgba(2, 167, 240, 0.02)' }
          ]
        }
      },
      data: [92, 90, 93, 95, 91, 94, 96, 93, 91, 94, 95, 93]
    }
  ]
}))
</script>

<style scoped>
.panel {
  background: linear-gradient(180deg, rgba(22, 43, 131, 0) 0%, rgba(22, 43, 131, 0.15) 100%);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}
.charge-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-bar {
  position: relative;
  height: 24px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 200px;
  object-fit: fill;
}
.header-title {
  position: relative;
  z-index: 10;
  font-size: 16px;
  font-weight: 700;
  padding-left: 12px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #02A7F0;
  line-height: 23px;
}
.charge-panel .panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.panel-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.charge-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 4px 6px;
}
.charge-chart-wrap {
  width: 100%;
  height: 100%;
}
.charge-chart-el {
  width: 100%;
  height: 100%;
}
</style>
