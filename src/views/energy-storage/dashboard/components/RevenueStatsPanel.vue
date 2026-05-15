<template>
  <div class="panel revenue-panel">
    <div class="panel-header-bar">
      <img src="/public//images/title@2x.png" class="header-bg" alt="" />
      <span class="header-title">收益统计与曲线</span>
    </div>
    <div class="panel-body">
      <div class="revenue-content">
        <!-- 左侧收益信息卡片 -->
        <div class="revenue-info-card">
          <div class="revenue-info-title">累计总收益</div>
          <div class="revenue-info-amount">¥{{ revenueAmount.toLocaleString('zh-CN') }}</div>
          <div class="revenue-info-growth">
            <!-- <span class="growth-arrow">↑</span> -->
            <span>{{ revenueGrowth }}</span>
          </div>
          <div class="revenue-info-link" >查看明细  ></div>
        </div>
        <!-- 右侧图表 -->
        <div class="revenue-chart-area">
          <v-chart class="chart-el" :option="revenueChartOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { axisTooltipConfig } from '@/utils/echartsTooltip'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const revenueAmount = ref(15280)
const revenueGrowth = ref('较上月增长 ↑12.5%')

const revenueChartOption = computed(() => ({
  tooltip: axisTooltipConfig(),
  grid: { left: '2%', right: '4%', bottom: '4%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 250,
    interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [
    {
      name: '总收益',
      type: 'line',
       itemStyle: { color: '#ED7318' }, 
      smooth: true,
       symbolSize :10,
      showSymbol: false,
      lineStyle: { color: '#ED7318', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 154, 35, 0.25)' },
            { offset: 1, color: 'rgba(245, 154, 35, 0.02)' }
          ]
        }
      },
      data: [150, 140, 130, 160, 155, 175, 210, 190, 170, 180, 185, 195]
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
.panel::before {
  content: '';
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}
.revenue-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-bar {
  position: relative;
  height: 49px;
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
  width: 800px;
  object-fit: fill;
}
.header-title {
  position: relative;
  z-index: 10;
  font-size: 24px;
  font-style: italic;
  /* font-weight: 700; */
  padding-left: 36px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
 color: #D5F2FF;
  line-height: 23px;
}
.revenue-panel .panel-body {
  flex: 1;
  min-height: 0;
}
.revenue-content {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 6px 10px;
}

/* 左侧信息卡片 */
.revenue-info-card {
  width: 300px;
  background: url('/images/img-3D-revenue@2x.png') no-repeat center / contain;
  height: 100%;
  padding: 10px 60px;
}
.revenue-info-title {
   transform: skew(10deg, -12deg);
font-size: 18px;
color: #DFE2E6;
}
.revenue-info-amount {
   transform: skew(10deg, -12deg);
  font-size: 24px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}
.revenue-info-growth {
   transform: skew(10deg, -12deg);
      width: fit-content;
      padding: 0 6px;
  background: rgba(61,178,104,0.2);
border-radius: 29px 29px 29px 29px;
  font-size: 11px;
  color: #22c55e;
  /* display: flex; */
  align-items: center;
  margin-top: 8px;
}
.growth-arrow {
  font-size: 12px;
}
.revenue-info-link {
  width: fit-content;
   transform: skew(10deg, -12deg);
  background: #1F5EFF;
border-radius: 4px 4px 4px 4px;
padding: 3px 6px;
  font-size: 11px;
  color: #fff;
  text-decoration: none;
  margin-top: 12px;
  margin-left: 6px;
  cursor:pointer
}
.revenue-info-link:hover {
  text-decoration: underline;
}

/* 右侧图表 */
.revenue-chart-area {
  flex: 1;
  min-width: 0;
  height: 100%;
}
.chart-el {
  width: 100%;
  height: 100%;
}
</style>
