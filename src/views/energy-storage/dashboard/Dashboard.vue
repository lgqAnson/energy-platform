<template>
  <div class="dashboard-container">
    <!-- Tab 标签 -->
    <div class="tabs-bar">
      <div v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        <span class="tab-text">{{ tab.name }}</span>
      </div>
    </div>

    <!-- 可视看板内容 -->
    <template v-if="activeTab === 'dashboard'">
      <!-- 上部区域 -->
      <div class="upper-section">
        <!-- 电站规模及运行概况 -->
        <div class="panel station-panel">
          <div class="panel-header-bar">
            <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
            <span class="header-title">电站规模及运行概况</span>
          </div>
          <div class="panel-body">
            <div class="panel-inner station-inner">
              <img src="/images/储能-可视看板/u3608.svg" class="station-bg-img" alt="" />
              <div class="stats-grid">
                <div v-for="(stat, index) in stationStats" :key="index" class="stat-card"
                  :style="{ '--accent-color': stat.borderColor }">
                  <div class="stat-accent-line"></div>
                  <div class="stat-body">
                    <div class="stat-icon-wrap">
                      <component :is="statIcons[index]" class="stat-icon" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-label">{{ stat.label }}</div>
                      <div class="stat-value-row">
                        <span class="stat-value">{{ formatNumber(stat.value) }}</span>
                      </div>
                      <div class="stat-value-row">
                        <span class="stat-unit">{{ stat.unit }}</span>
                      </div>
                      <div v-if="stat.trend" class="stat-trend">
                        <span class="trend-label">{{ stat.trendLabel }}</span>
                        <span class="trend-value">{{ stat.trend }}</span>
                      </div>
                      <div v-else-if="stat.desc" class="stat-desc">{{ stat.desc }}</div>
                      <div v-else class="stat-desc-placeholder"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3D 园区场景 -->
        <div class="panel revenue-panel">
          <!-- <div class="panel-header-bar">
            <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
            <span class="header-title">3D 园区场景</span>
          </div> -->
          <div class="panel-body scene-panel-body" @click="handleSceneClick">
            <img src="/images/储能-可视看板/u3492.svg" class="panel-bg-img" alt="" />
            <div class="scene-overlay">
              <div
                v-for="anchor in anchors"
                :key="anchor.id"
                class="scene-anchor"
                :style="{ top: anchor.top, left: anchor.left }"
                @click.stop="handleAnchorClick(anchor.id)"
              >
                <div class="anchor-pin" :class="{ active: activeAnchorId === anchor.id }">
                  <MapPin class="anchor-icon" />
                  <div class="anchor-pulse"></div>
                </div>
                <transition name="popup">
                  <div
                    v-if="activeAnchorId === anchor.id"
                    class="anchor-popup"
                  >
                    <div class="popup-header">{{ anchor.deviceCode }}</div>
                    <div class="popup-body">
                      <div class="popup-row">
                        <span class="popup-label">运行状态:</span>
                        <span class="popup-value" :class="anchor.status === '正常' ? 'status-normal' : 'status-alert'">
                          {{ anchor.status }}
                        </span>
                      </div>
                      <div class="popup-row">
                        <span class="popup-label">装机容量:</span>
                        <span class="popup-value">{{ anchor.capacity }}</span>
                      </div>
                      <div class="popup-row">
                        <span class="popup-label">所属区域:</span>
                        <span class="popup-value">{{ anchor.area }}</span>
                      </div>
                      <div class="popup-row">
                        <span class="popup-label">投运时间:</span>
                        <span class="popup-value">{{ anchor.operateTime }}</span>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
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
            <div class="revenue-info">
              <div class="revenue-icon-wrap">
                <TrendingUp class="revenue-icon" />
              </div>
              <div class="revenue-detail">
                <div class="revenue-label">累计总收益</div>
                <div class="revenue-amount">¥1,248,650</div>
                <div class="revenue-growth">
                  <span class="growth-arrow">↑</span>
                  <span>较上月增长 12.5%</span>
                </div>
                <a class="revenue-link" href="javascript:void(0)">查看明细&gt;&gt;</a>
              </div>
            </div>
            <div class="revenue-chart-area">
              <v-chart class="chart-el" :option="revenueChartOption" autoresize />
            </div>
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
    </template>

    <!-- 其他 Tab 内容 -->
    <div v-else class="tab-content-wrapper">
      <MonitorView v-if="activeTab === 'monitor'" :embedded="true" />
      <StrategyView v-else-if="activeTab === 'strategy'" :embedded="true" />
      <PriceView v-else-if="activeTab === 'price'" :embedded="true" />
      <SettlementView v-else-if="activeTab === 'settlement'" :embedded="true" />
      <RevenueView v-else-if="activeTab === 'revenue'" :embedded="true" />
      <MaintenanceView v-else-if="activeTab === 'maintenance'" :embedded="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Battery,
  Zap,
  Plug,
  ShieldCheck,
  MapPin,
  Server,
  TrendingUp
} from 'lucide-vue-next'
import { use } from 'echarts/core'
import MonitorView from '@/views/energy-storage/monitor/Monitor.vue'
import StrategyView from '@/views/energy-storage/strategy/Strategy.vue'
import PriceView from '@/views/energy-storage/price/Price.vue'
import SettlementView from '@/views/energy-storage/settlement/Settlement.vue'
import RevenueView from '@/views/energy-storage/revenue/Revenue.vue'
import MaintenanceView from '@/views/energy-storage/maintenance/Maintenance.vue'
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

const activeTab = ref('dashboard')

const tabs = [
  { name: '可视看板', key: 'dashboard' },
  { name: '实时监控', key: 'monitor', component: MonitorView },
  { name: '策略控制', key: 'strategy', component: StrategyView },
  { name: '电价管理', key: 'price', component: PriceView },
  { name: '抄表结算', key: 'settlement', component: SettlementView },
  { name: '收益管理', key: 'revenue', component: RevenueView },
  { name: '运维管理', key: 'maintenance', component: MaintenanceView }
]

const statIcons = [Battery, Zap, Plug, Zap, ShieldCheck, MapPin, Server]

const stationStats = [
  { label: '累计装机容量', value: 15280, unit: 'MWh', trend: '+8.5%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
  { label: '累计装机功率', value: 2500, unit: 'MW', trend: '+6.2%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
  { label: '累计总充电量', value: 85600, unit: 'MWh', desc: '历史累计充电总量', color: '#22c55e', borderColor: '#22c55e' },
  { label: '累计总放电量', value: 78300, unit: 'MWh', desc: null, color: '#f59e0b', borderColor: '#f59e0b' },
  { label: '安全运行天数', value: 1250, unit: '天', desc: '历史无安全事故总天数', color: '#22c55e', borderColor: '#22c55e' },
  { label: '总电站数', value: 328, unit: '站', desc: null, color: '#a855f7', borderColor: '#a855f7' },
  { label: '总储能柜数', value: 1850, unit: '台', desc: null, color: '#ec4899', borderColor: '#ec4899' }
]

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

// 3D 场景锚点数据
interface AnchorInfo {
  id: string
  top: string
  left: string
  deviceCode: string
  status: string
  capacity: string
  area: string
  operateTime: string
}

const anchors = ref<AnchorInfo[]>([
  {
    id: '1',
    top: '28%',
    left: '42%',
    deviceCode: 'R251205J0055',
    status: '正常',
    capacity: '200Wh',
    area: 'G12',
    operateTime: '2026年1月3日'
  },
  {
    id: '2',
    top: '35%',
    left: '52%',
    deviceCode: 'R251205J0056',
    status: '正常',
    capacity: '300Wh',
    area: 'G13',
    operateTime: '2026年1月5日'
  },
  {
    id: '3',
    top: '22%',
    left: '58%',
    deviceCode: 'R251205J0057',
    status: '告警',
    capacity: '150Wh',
    area: 'G14',
    operateTime: '2026年1月8日'
  }
])

const activeAnchorId = ref<string | null>(null)

const handleAnchorClick = (id: string) => {
  activeAnchorId.value = activeAnchorId.value === id ? null : id
}

const handleSceneClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.scene-anchor') && !target.closest('.anchor-popup')) {
    activeAnchorId.value = null
  }
}

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
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 250,
    interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
  },
  series: [
    {
      name: '总收益',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: '#02A7F0', borderColor: '#fff', borderWidth: 1 },
      lineStyle: { color: '#02A7F0', width: 2 },
      data: [45, 65, 80, 75, 95, 110, 125, 135, 150, 165, 180, 200]
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
  align-items: center;
  gap: 12px;
  height: 40px;
  margin-left: 360px;
  flex-shrink: 0;
  padding: 0 8px;
}

.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 7px 20px;
  text-decoration: none;
  background: rgba(12, 28, 55, 0.5);
  border: 1px solid rgba(1, 202, 254, 0.35);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tab-item:hover {
  background: rgba(1, 202, 254, 0.1);
  border-color: rgba(1, 202, 254, 0.6);
}

.tab-item.active {
  background: rgba(1, 202, 254, 0.15);
  border-color: rgba(1, 202, 254, 0.8);
  box-shadow:
    inset 0 0 12px rgba(1, 202, 254, 0.15),
    0 0 8px rgba(1, 202, 254, 0.2);
}

.tab-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

.tab-item.active .tab-text {
  color: #FFFFFF;
  text-shadow: 0 0 6px rgba(1, 202, 254, 0.5);
}

/* 上部区域 */
.upper-section {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
  margin-bottom: 520px;
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
  /* margin-bottom: -8px; */
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
  height: 600px;
  top: -50px;
}

.station-panel .panel-body {
  padding-top: 4px;
}

.station-inner {
  position: relative;
  padding: 8px;
}

.station-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  z-index: 0;
}

.station-inner .stats-grid {
  position: relative;
  z-index: 1;
}

.tab-content-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 6px;
}

.stat-card {
  position: relative;
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid color-mix(in srgb, var(--accent-color), transparent 82%);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 2px 10px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.stat-accent-line {
  height: 3px;
  width: 100%;
  background: var(--accent-color);
  box-shadow: 0 0 8px var(--accent-color);
  flex-shrink: 0;
}

.stat-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 10px;
  flex: 1;
  min-height: 74px;
}

.stat-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon {
  width: 26px;
  height: 26px;
  color: var(--accent-color);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent-color), transparent 35%));
}

.stat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  line-height: 1.2;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1.1;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
  letter-spacing: 0.3px;
}

.stat-unit {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  margin-top: 2px;
}

.trend-label {
  color: rgba(255, 255, 255, 0.4);
}

.trend-value {
  color: #22c55e;
}

.stat-desc {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 2px;
}

.stat-desc-placeholder {
  height: 14px;
}

/* 收益统计面板 */
.revenue-panel {
  flex: 1;
  height: 600px;
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

.scene-panel-body {
  position: relative;
  overflow: hidden;
}

.scene-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.scene-anchor {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  z-index: 3;
}

.anchor-pin {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.6));
  transition: transform 0.2s ease;
}

.anchor-pin:hover,
.anchor-pin.active {
  transform: scale(1.2);
}

.anchor-icon {
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 2;
}

.anchor-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.25);
  animation: anchorPulse 2s ease-out infinite;
  z-index: 1;
}

@keyframes anchorPulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.anchor-popup {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  min-width: 180px;
  background: linear-gradient(145deg, rgba(20, 36, 60, 0.96) 0%, rgba(10, 22, 40, 0.96) 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 8px rgba(245, 158, 11, 0.15);
  overflow: hidden;
  z-index: 10;
}

.anchor-popup::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
}

.popup-header {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  border-bottom: 1px solid rgba(245, 158, 11, 0.15);
}

.popup-body {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.popup-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.popup-label {
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}

.popup-value {
  color: rgba(255, 255, 255, 0.85);
}

.status-normal {
  color: #22c55e;
}

.status-alert {
  color: #ef4444;
}

.popup-enter-active,
.popup-leave-active {
  transition: all 0.25s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

.revenue-chart-wrap {
  flex: 1;
  min-width: 0;
  height: 100%;
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

/* 充放电分析 */
.charge-panel {
  width: 340px;
  height: 100%;
  top: 20px;
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
  height: 260px;
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
