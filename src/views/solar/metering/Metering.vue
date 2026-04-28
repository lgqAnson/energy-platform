<template>
  <div class="metering-container">
    <ModuleTabs :tabs="solarTabs" />

    <!-- 上部三列 -->
    <div class="top-section">
      <!-- 左：能效分析 -->
      <div class="top-panel">
        <div class="panel-header">
          <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
          <span class="panel-header-text">能效分析</span>
        </div>
        <!-- 两个指标卡片 -->
        <div class="efficiency-cards">
          <div class="eff-card">
            <div class="eff-card-top">
              <div class="eff-icon green">
                <Zap class="w-4 h-4" />
              </div>
              <span class="eff-name">逆变器平均转换效率</span>
            </div>
            <div class="eff-value-row">
              <span class="eff-value">98.7%</span>
              <span class="eff-mom">环比 ↑0.3%</span>
            </div>
          </div>
          <div class="eff-card">
            <div class="eff-card-top">
              <div class="eff-icon orange">
                <Sun class="w-4 h-4" />
              </div>
              <span class="eff-name">光伏阵列平均发电效率</span>
            </div>
            <div class="eff-value-row">
              <span class="eff-value">82.5%</span>
              <span class="eff-mom">环比 ↑1.2%</span>
            </div>
          </div>
        </div>
        <!-- 折线图 -->
        <div class="chart-wrap">
          <v-chart class="eff-chart" :option="efficiencyChartOption" autoresize />
        </div>
      </div>

      <!-- 中：损失分析 -->
      <div class="top-panel">
        <div class="panel-header">
          <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
          <span class="panel-header-text">损失分析</span>
        </div>
        <div class="loss-charts">
          <v-chart class="loss-pie" :option="lossPieOption" autoresize />
          <v-chart class="loss-bar" :option="lossBarOption" autoresize />
        </div>
      </div>

      <!-- 右：数据导出 -->
      <div class="top-panel export-panel">
        <div class="panel-header">
          <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
          <span class="panel-header-text">数据导出</span>
        </div>
        <div class="export-body">
          <div class="export-label">选择导出数据范围：</div>
          <div class="export-checkboxes">
            <label v-for="item in exportOptions" :key="item" class="cb-label">
              <input type="checkbox" v-model="selectedExports" :value="item" />
              <span class="cb-box"></span>
              <span class="cb-text">{{ item }}</span>
            </label>
          </div>
          <div class="export-format">
            <button
              class="format-btn"
              :class="{ active: exportFormat === 'excel' }"
              @click="exportFormat = 'excel'"
            >
              <FileSpreadsheet class="w-4 h-4" />
              Excel
            </button>
            <button
              class="format-btn"
              :class="{ active: exportFormat === 'pdf' }"
              @click="exportFormat = 'pdf'"
            >
              <FileText class="w-4 h-4" />
              PDF
            </button>
          </div>
          <button class="export-btn" @click="handleExport">
            <Download class="w-4 h-4" />
            导出数据
          </button>
        </div>
      </div>
    </div>

    <!-- 下部：分时段电量统计 -->
    <div class="bottom-section">
      <div class="panel-header">
        <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
        <span class="panel-header-text">分时段电量统计</span>
      </div>

      <!-- 标签页 -->
      <div class="time-tabs">
        <button
          v-for="tab in timeTabs"
          :key="tab.key"
          class="time-tab"
          :class="{ active: activeTimeTab === tab.key }"
          @click="activeTimeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="bottom-body">
        <!-- 左侧四个电量卡片 -->
        <div class="power-cards">
          <div
            v-for="(card, idx) in activePowerCards"
            :key="idx"
            class="power-card"
            :style="{ '--accent': card.color }"
          >
            <div class="power-top">
              <div class="power-dot" :style="{ background: card.color }"></div>
              <span class="power-title">{{ card.title }}</span>
            </div>
            <div class="power-value">
              {{ card.value }}
              <span class="power-unit">MWh</span>
            </div>
            <div class="power-ratio">占比 {{ card.ratio }}%</div>
          </div>
        </div>

        <!-- 右侧对比柱状图 -->
        <div class="chart-wrap compare-wrap">
          <v-chart class="compare-chart" :option="compareChartOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import ModuleTabs from '@/components/common/ModuleTabs.vue'

const solarTabs = [
  { name: '实时监控', path: '/solar/monitor' },
  { name: '运维管理', path: '/solar/maintenance' },
  { name: '计量与能效', path: '/solar/metering' }
]
import { Zap, Sun, Download, FileSpreadsheet, FileText } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
])

/* ========== 能效分析折线图 ========== */
const effDates = ['03-31', '04-01', '04-02', '04-03', '04-04', '04-05', '04-06']
const effInv = [96.8, 97.0, 97.2, 97.6, 97.4, 97.8, 98.0]
const effArray = [80.5, 81.0, 81.5, 82.0, 82.2, 82.5, 83.0]

const efficiencyChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff' }
  },
  legend: {
    data: ['逆变器效率', '阵列效率'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    itemWidth: 14,
    itemHeight: 4,
    top: 0,
    left: 'center'
  },
  grid: { left: '2%', right: '4%', bottom: '2%', top: '18%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: effDates,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    min: 70,
    max: 100,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, formatter: '{value}%' }
  },
  series: [
    {
      name: '逆变器效率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: '#02A7F0', width: 2 },
      itemStyle: { color: '#02A7F0' },
      data: effInv
    },
    {
      name: '阵列效率',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: '#70B603', width: 2 },
      itemStyle: { color: '#70B603' },
      data: effArray
    }
  ]
}))

/* ========== 损失分析 ========== */
const lossPieOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c} MWh ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 4,
    top: 'center',
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 8,
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 }
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      center: ['62%', '50%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      data: [
        { value: 28.5, name: '设备故障', itemStyle: { color: '#FF4D4F' } },
        { value: 18.2, name: '天气', itemStyle: { color: '#02A7F0' } },
        { value: 15.8, name: '遮挡', itemStyle: { color: '#FAAD14' } },
        { value: 12.4, name: '污渍', itemStyle: { color: '#F59A23' } },
        { value: 8.6, name: '其他', itemStyle: { color: '#8C8C8C' } }
      ]
    }
  ]
}))

const lossDates = ['03-31', '04-01', '04-02', '04-03', '04-04', '04-05', '04-06']
const lossData = [5.2, 4.8, 6.1, 14.2, 5.5, 4.9, 5.1]

const lossBarOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff' },
    axisPointer: { type: 'shadow' }
  },
  grid: { left: '10%', right: '6%', bottom: '8%', top: '8%', containLabel: true },
  xAxis: {
    type: 'category',
    data: lossDates,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, formatter: '{value} MWh' }
  },
  series: [
    {
      type: 'bar',
      barWidth: '50%',
      itemStyle: { color: '#F59A23', borderRadius: [3, 3, 0, 0] },
      data: lossData
    }
  ]
}))

/* ========== 数据导出 ========== */
const exportOptions = ['发电量', '效率', '减排量', '告警记录']
const selectedExports = ref(['发电量', '效率'])
const exportFormat = ref<'excel' | 'pdf'>('excel')

function handleExport() {
  if (selectedExports.value.length === 0) {
    ElMessage.warning('请至少选择一项导出内容')
    return
  }
  ElMessage.success(`正在导出 ${selectedExports.value.join('、')} 数据（${exportFormat.value.toUpperCase()}）…`)
}

/* ========== 分时段电量统计 ========== */
const timeTabs = [
  { key: 'peak', label: '尖峰平谷时段' },
  { key: 'daynight', label: '昼夜时段' },
  { key: 'grid', label: '上网/自发自用' }
]
const activeTimeTab = ref('peak')

interface PowerCard {
  title: string
  value: number
  unit: string
  ratio: number
  color: string
}

const peakCards: PowerCard[] = [
  { title: '尖时段电量 (10:00-12:00, 19:00-21:00)', value: 98.6, unit: 'MWh', ratio: 17.3, color: '#FF4D4F' },
  { title: '平时段电量 (7:00-8:00, 22:00-23:00)', value: 82.3, unit: 'MWh', ratio: 14.5, color: '#B37FEB' },
  { title: '峰时段电量 (7:00-10:00, 12:00-19:00, 21:00-23:00)', value: 215.8, unit: 'MWh', ratio: 38.0, color: '#F59A23' },
  { title: '谷时段电量 (23:00-7:00)', value: 45.2, unit: 'MWh', ratio: 8.0, color: '#02A7F0' }
]

const daynightCards: PowerCard[] = [
  { title: '白天发电量 (6:00-18:00)', value: 358.2, unit: 'MWh', ratio: 63.1, color: '#F59A23' },
  { title: '夜间发电量 (18:00-6:00)', value: 12.5, unit: 'MWh', ratio: 2.2, color: '#B37FEB' },
  { title: '白天自用电量', value: 156.8, unit: 'MWh', ratio: 27.6, color: '#70B603' },
  { title: '夜间自用电量', value: 39.6, unit: 'MWh', ratio: 7.0, color: '#02A7F0' }
]

const gridCards: PowerCard[] = [
  { title: '上网电量', value: 245.8, unit: 'MWh', ratio: 43.3, color: '#02A7F0' },
  { title: '自发自用电量', value: 196.4, unit: 'MWh', ratio: 34.6, color: '#70B603' },
  { title: '弃光电量', value: 18.2, unit: 'MWh', ratio: 3.2, color: '#FF4D4F' },
  { title: '储能充电量', value: 106.3, unit: 'MWh', ratio: 18.7, color: '#F59A23' }
]

const activePowerCards = computed(() => {
  if (activeTimeTab.value === 'peak') return peakCards
  if (activeTimeTab.value === 'daynight') return daynightCards
  return gridCards
})

// 对比柱状图数据
const compareCategories = ['发电量', '逆变器效率', '阵列效率', '损失率']
const compareData = {
  station1: [580, 97.8, 82.5, 3.2],
  station2: [620, 97.2, 81.8, 3.8],
  station3: [540, 96.8, 80.5, 4.5]
}

const compareChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff' },
    axisPointer: { type: 'shadow' }
  },
  legend: {
    data: ['1号场站', '2号场站', '3号场站'],
    textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    itemWidth: 12,
    itemHeight: 12,
    top: 4,
    left: 'center'
  },
  grid: { left: '3%', right: '4%', bottom: '6%', top: '16%', containLabel: true },
  xAxis: {
    type: 'category',
    data: compareCategories,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10, formatter: '{value}' }
  },
  series: [
    {
      name: '1号场站',
      type: 'bar',
      barGap: '15%',
      barWidth: 16,
      itemStyle: { color: '#02A7F0', borderRadius: [3, 3, 0, 0] },
      data: compareData.station1
    },
    {
      name: '2号场站',
      type: 'bar',
      barWidth: 16,
      itemStyle: { color: '#70B603', borderRadius: [3, 3, 0, 0] },
      data: compareData.station2
    },
    {
      name: '3号场站',
      type: 'bar',
      barWidth: 16,
      itemStyle: { color: '#B37FEB', borderRadius: [3, 3, 0, 0] },
      data: compareData.station3
    }
  ]
}))
</script>

<style scoped>
.metering-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ===== 上部三列 ===== */
.top-section {
  display: flex;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.top-panel {
  flex: 1;
  min-width: 0;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
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

/* ===== 能效分析 ===== */
.efficiency-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  flex-shrink: 0;
  margin-bottom: 10px;
}

.eff-card {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.eff-card-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.eff-icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.eff-icon.green {
  background: linear-gradient(135deg, #70B603, #52c41a);
}

.eff-icon.orange {
  background: linear-gradient(135deg, #F59A23, #fa8c16);
}

.eff-name {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.2;
}

.eff-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.eff-value {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
}

.eff-mom {
  font-size: 10px;
  color: #70B603;
}

.chart-wrap {
  flex: 1;
  min-height: 0;
}

.eff-chart {
  width: 100%;
  height: 100%;
}

/* ===== 损失分析 ===== */
.loss-charts {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 8px;
}

.loss-pie {
  width: 45%;
  height: 100%;
}

.loss-bar {
  width: 55%;
  height: 100%;
}

/* ===== 数据导出 ===== */
.export-panel {
  min-width: 260px;
}

.export-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
}

.export-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.export-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cb-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.cb-label input {
  display: none;
}

.cb-box {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.cb-label input:checked + .cb-box {
  background: #02A7F0;
  border-color: #02A7F0;
}

.cb-label input:checked + .cb-box::after {
  content: '';
  width: 7px;
  height: 4px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translate(0.5px, -1px);
}

.cb-text {
  white-space: nowrap;
}

.export-format {
  display: flex;
  gap: 10px;
}

.format-btn {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.format-btn:hover {
  border-color: rgba(2, 167, 240, 0.4);
  color: rgba(255, 255, 255, 0.8);
}

.format-btn.active {
  background: rgba(2, 167, 240, 0.15);
  border-color: #02A7F0;
  color: #02A7F0;
}

.export-btn {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #F59A23, #fa8c16);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: auto;
}

.export-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* ===== 下部：分时段电量统计 ===== */
.bottom-section {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  padding: 16px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.time-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.time-tab {
  padding: 0 18px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-tab:hover {
  border-color: rgba(2, 167, 240, 0.4);
  color: rgba(255, 255, 255, 0.8);
}

.time-tab.active {
  background: rgba(2, 167, 240, 0.2);
  border-color: #02A7F0;
  color: #02A7F0;
}

.bottom-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 16px;
}

.power-cards {
  width: 380px;
  flex-shrink: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 10px;
}

.power-card {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.power-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.power-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.power-title {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.3;
}

.power-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.power-unit {
  font-size: 11px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
}

.power-ratio {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.compare-wrap {
  flex: 1;
  min-width: 0;
}

.compare-chart {
  width: 100%;
  height: 100%;
}
</style>
