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
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const chargeDischargeChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['充电量', '放电量'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    itemWidth: 12, itemHeight: 2, right: 4, top: 0
  },
  grid: { left: '2%', right: '4%', bottom: '6%', top: '22%', containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  yAxis: {
    type: 'value', axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [
    {
      name: '充电量', type: 'line', smooth: true, symbol: 'none',
      lineStyle: { color: '#02A7F0', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(2, 167, 240, 0.3)' }, { offset: 1, color: 'rgba(2, 167, 240, 0.02)' }] } },
      data: [320, 280, 450, 520, 680, 850, 920, 880, 650, 480, 380, 350]
    },
    {
      name: '放电量', type: 'line', smooth: true, symbol: 'none',
      lineStyle: { color: '#70B603', width: 2 },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(112, 182, 3, 0.3)' }, { offset: 1, color: 'rgba(112, 182, 3, 0.02)' }] } },
      data: [280, 250, 400, 480, 620, 780, 850, 810, 600, 440, 350, 320]
    }
  ]
}))
</script>

<style scoped>
.charge-panel {
  width: 340px;
  display: flex;
  flex-direction: column;
}
.panel-header-bar {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
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
  font-size: 18px;
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
  display: flex;
  align-items: center;
  gap: 12px;
}
.charge-label {
  font-size: 12px;
  color: #AAAAAA;
}
.charge-value {
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 500;
}
.charge-divider {
  width: 100%;
  height: 1px;
  background: rgba(170, 170, 170, 0.3);
  margin: 4px 0;
}
.charge-chart-wrap {
  flex: 1;
  height: 160px;
  min-width: 0;
}
.charge-chart-el {
  width: 100%;
  height: 100%;
}
</style>
