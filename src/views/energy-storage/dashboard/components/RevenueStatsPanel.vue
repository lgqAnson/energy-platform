<template>
        <div class="panel runtime-panel">
          <div class="panel-header-bar">
            <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
            <span class="header-title">收益统计与曲线</span>
          </div>
          <div class="panel-body">
            <div class="revenue-chart-wrap">
            <div class="revenue-info">
              <div class="revenue-icon-wrap">
                <TrendingUp class="revenue-icon" />
              </div>
              <div class="revenue-detail">
                <div class="revenue-label">累计总收益</div>
                <div class="revenue-amount">¥{{ revenueAmount.toLocaleString('zh-CN') }}</div>
                <div class="revenue-growth">
                  <span class="growth-arrow">↑</span>
                  <span>{{ revenueGrowth }}</span>
                </div>
                <a class="revenue-link" href="javascript:void(0)">查看明细&gt;&gt;</a>
              </div>
            </div>
            <div class="revenue-chart-area">
              <v-chart class="chart-el" :option="revenueChartOption" autoresize />
            </div>
          </div>
          </div>
        </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrendingUp } from 'lucide-vue-next'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const revenueAmount = ref(1248650)
const revenueGrowth = ref('较上月增长 12.5%')

const revenueChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff' },
    formatter: (params: any) => {
      const p = params[0]
      return `<div style="font-size:12px">${p.name}</div><div style="font-size:12px">总收益 ${p.value}</div>`
    }
  },
  grid: { left: '3%', right: '4%', bottom: '6%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  yAxis: {
    type: 'value', min: 0, max: 250, interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  series: [{
    name: '总收益', type: 'line', smooth: true, symbol: 'circle', symbolSize: 6,
    itemStyle: { color: '#02A7F0', borderColor: '#fff', borderWidth: 1 },
    lineStyle: { color: '#02A7F0', width: 2 },
    data: [45, 65, 80, 75, 95, 110, 125, 135, 150, 165, 180, 200]
  }]
}))
</script>

<style scoped>
.revenue-chart-wrap {
  flex: 1;
  min-width: 0;
  min-height: 200px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
}
.revenue-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
}
.revenue-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(2, 132, 199, 0.35);
}
.revenue-icon {
  width: 32px;
  height: 32px;
  color: #fff;
}
.revenue-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.revenue-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}
.revenue-amount {
  font-size: 22px;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}
.revenue-growth {
  font-size: 11px;
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 3px;
}
.growth-arrow {
  font-size: 12px;
}
.revenue-link {
  font-size: 11px;
  color: #02A7F0;
  text-decoration: none;
  margin-top: 2px;
}
.revenue-link:hover {
  text-decoration: underline;
}
.revenue-chart-area {
  flex: 1;
  min-width: 0;
  height: 100%;
}
.chart-el {
  width: 100%;
  height: 100%;
}
.runtime-panel {
  flex: 1;
  min-width: 0;
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
.runtime-panel .panel-body {
  flex: 1;
  min-height: 0;
}
.runtime-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.runtime-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;
}
.runtime-card {
  background: rgba(30, 43, 60, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
.rt-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}
.rt-value {
  font-size: 22px;
  font-weight: bold;
  color: #FFFFFF;
}
</style>
