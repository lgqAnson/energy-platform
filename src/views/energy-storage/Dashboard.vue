<template>
  <div class="dashboard-container">
    <!-- Tab 标签 -->


    <!-- 上部区域 -->
    <div class="upper-section">
      <!-- 电站规模及运行概况 -->
      <div class="panel station-panel">
        <div class="panel-header-bar">
          <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
          <span class="header-title">电站规模及运行概况</span>
        </div>
        <div class="panel-body">
          <img src="/images/储能-可视看板/u3608.svg" class="panel-bg-img" alt="" />
          <div class="panel-inner">
            <div class="device-cards">
              <div v-for="i in 7" :key="i" class="device-card">
                <img :src="`/images/储能-可视看板/u361${i + 10}.svg`" class="card-bg-img" alt="" />
                <div class="card-overlay">
                  <span class="card-label">{{ deviceLabels[i - 1] }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3D 园区场景 -->
      <div class="panel revenue-panel">
        <div class="panel-header-bar">
          <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
          <div class="tabs-bar">
            <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="tab-item"
              :class="{ active: route.path === tab.path }">
              <img src="/images/储能-可视看板/u3496.png" class="tab-bg"
                :style="{ opacity: route.path === tab.path ? 1 : 0.35 }" alt="" />
              <div v-if="route.path === tab.path" class="tab-border" />
              <span class="tab-text">{{ tab.name }}</span>
            </router-link>
          </div>
        </div>
        <div class="panel-body">
          <img src="/images/储能-可视看板/u3492.svg" class="panel-bg-img" alt="" />
          <div class="panel-inner three-scene-inner">

          </div>
        </div>
      </div>
    </div>

    <!-- 下部区域 -->
    <div class="lower-section">
      <!-- 充放电分析 -->
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

      <!-- 收益统计与曲线 -->
      <div class="panel runtime-panel">
        <div class="panel-header-bar">
          <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
          <span class="header-title">收益统计与曲线</span>
        </div>
        <div class="revenue-chart-wrap">
          <v-chart class="chart-el" :option="revenueChartOption" autoresize />
        </div>
      </div>

      <!-- 未处理告警统计 -->
      <div class="panel alarm-panel">
        <div class="panel-header-bar">
          <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
          <span class="header-title">未处理告警统计</span>
        </div>
        <div class="panel-body">
          <img src="/images/储能-可视看板/u3522.svg" class="panel-bg-img" alt="" />
          <div class="panel-inner alarm-inner">
            <v-chart class="alarm-chart-el" :option="alarmChartOption" autoresize />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ThreeBuildingScene from '@/components/ThreeBuildingScene.vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

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

const deviceLabels = [
  'PCS信息', 'BMS信息', '电芯信息', '环境温度', '消防状态', '门禁状态', 'PCS信息'
]

const revenueChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff' }
  },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)' }
  },
  series: [
    {
      name: '收益',
      type: 'line',
      smooth: true,
      symbol: 'none',
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(2, 167, 240, 0.4)' },
            { offset: 1, color: 'rgba(2, 167, 240, 0.02)' }
          ]
        }
      },
      lineStyle: { color: '#02A7F0', width: 2 },
      data: [12000, 8500, 15200, 28000, 24500, 18900, 22100]
    }
  ]
}))

const chargeDischargeChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: {
    data: ['充电量', '放电量'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    itemWidth: 12,
    itemHeight: 2,
    right: 4,
    top: 0
  },
  grid: { left: '2%', right: '4%', bottom: '6%', top: '22%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
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
      name: '充电量',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#02A7F0', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(2, 167, 240, 0.3)' },
            { offset: 1, color: 'rgba(2, 167, 240, 0.02)' }
          ]
        }
      },
      data: [30, 45, 80, 95, 70, 50, 35]
    },
    {
      name: '放电量',
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#70B603', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(112, 182, 3, 0.3)' },
            { offset: 1, color: 'rgba(112, 182, 3, 0.02)' }
          ]
        }
      },
      data: [20, 35, 60, 93, 85, 55, 30]
    }
  ]
}))

const alarmChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '12%', right: '6%', bottom: '16%', top: '10%', containLabel: false },
  xAxis: {
    type: 'category',
    data: ['紧急告警', '重要告警', '一般告警'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    max: 250,
    interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [
    {
      type: 'bar',
      barWidth: 32,
      data: [
        { value: 61, itemStyle: { color: '#EC808D', borderRadius: [3, 3, 0, 0] } },
        { value: 112, itemStyle: { color: '#F59A23', borderRadius: [3, 3, 0, 0] } },
        { value: 44, itemStyle: { color: '#588BF0', borderRadius: [3, 3, 0, 0] } }
      ],
      label: {
        show: true,
        position: 'top',
        color: '#fff',
        fontSize: 11
      }
    }
  ]
}))
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 1580px;
  height: calc(100vh - 110px);
  overflow: auto;
}

/* Tab 标签 */
.tabs-bar {
  display: flex;
  gap: 0;
  height: 43px;
  flex-shrink: 0;
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 124px;
  height: 43px;
  text-decoration: none;
}

.tab-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.tab-border {
  position: absolute;
  inset: 0;
  border: 1px solid #01CAFE;
  border-radius: 3px;
  pointer-events: none;
}

.tab-text {
  position: relative;
  z-index: 2;
  font-size: 16px;
  color: #D7D7D7;
}

.tab-item.active .tab-text {
  color: #FFFFFF;
}

/* 上部区域 */
.upper-section {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* 下部区域 */
.lower-section {
  display: flex;
  gap: 16px;
  height: 280px;
  align-items: flex-end;
  flex-shrink: 0;
}

/* 面板通用 */
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
}

.panel-header-bar {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  margin-bottom: -8px;
  z-index: 2;
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
  z-index: 1;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #02A7F0;
  padding-left: 20px;
  line-height: 40px;
  white-space: nowrap;
}

.panel-body {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.panel-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.panel-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

/* 电站规模面板 */
.station-panel {
  width: 340px;
  height: 100%;
}

.station-panel .panel-body {
  padding-top: 8px;
}

.device-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px 4px;
}

.device-card {
  position: relative;
  width: 100%;
  aspect-ratio: 139 / 108;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.card-overlay {
  position: relative;
  z-index: 1;
  text-align: center;
}

.card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

/* 收益统计面板 */
.revenue-panel {
  flex: 1;
  height: 100%;
  min-width: 0;
}

.revenue-inner {
  display: flex;
  gap: 16px;
  padding: 20px;
}

.three-scene-inner {
  padding: 0;
  height: 100%;
}

.revenue-chart-wrap {
  flex: 1;
  min-width: 0;
  height: 100%;
}

.chart-el {
  width: 100%;
  height: 100%;
}

.revenue-info {
  position: relative;
  width: 180px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 120px;
  object-fit: fill;
}

.info-content {
  position: relative;
  z-index: 1;
}

.info-row {
  line-height: 1.8;
  white-space: nowrap;
}

.info-profit {
  margin-top: 12px;
}

/* 充放电分析 */
.charge-panel {
  width: 340px;
  height: 100%;
}

.charge-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.charge-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 实时运行数据 */
.runtime-panel {
  flex: 1;
  height: 220px;
  min-width: 0;
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

/* 告警统计 */
.alarm-panel {
  width: 300px;
  height: 220px;
  flex-shrink: 0;
}

.alarm-inner {
  padding: 4px 8px;
  height: 100%;
  box-sizing: border-box;
}

.alarm-chart-el {
  width: 100%;
  height: 100%;
}
</style>
