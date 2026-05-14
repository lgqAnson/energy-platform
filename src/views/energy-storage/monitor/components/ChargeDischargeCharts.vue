<template>
  <div class="charts-row">
    <div class="chart-panel">
      <div class="chart-header">
        <div class="chart-title">历史充放电量统计（按日/时段）</div>
        <button class="detail-btn" @click="openDialog">
          <Search class="detail-btn-icon" />
          <span>查看明细</span>
        </button>
        <div class="chart-dim-select" @click.stop="toggleDropdown">
          <span>{{ dimLabel }}</span>
          <ChevronDown class="dim-arrow" :class="{ open: dropdownOpen }" />
          <div v-if="dropdownOpen" class="dim-dropdown">
            <div v-for="opt in dimOptions" :key="opt.value" class="dim-option" :class="{ active: dim === opt.value }"
              @click.stop="selectDim(opt.value)">
              {{ opt.label }}
            </div>
          </div>
        </div>
      </div>
      <v-chart class="chart-canvas" :option="historyOption" autoresize />
    </div>
    <div class="chart-panel">
      <div class="chart-header">
        <div class="chart-title">当日实时充放电曲线</div>
      </div>
      <v-chart class="chart-canvas" :option="realtimeOption" autoresize />
    </div>
  </div>


  <ChargeRecordDialog v-model:visible="dialogVisible" />
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { ChevronDown, Search, X, ClipboardList, RotateCcw, Download } from 'lucide-vue-next'
import type { RealtimeChartSeries } from '../types'
import dayjs from 'dayjs'
import { axisTooltipConfig } from '@/utils/echartsTooltip'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const props = defineProps<{
  realtimeSeries: RealtimeChartSeries
}>()

// ===== 下拉选择器 =====
const dim = ref(7)
const dropdownOpen = ref(false)
const dimOptions = [
  { value: 7, label: '最近7天' },
  { value: 15, label: '最近15天' },
  { value: 30, label: '最近30天' }
]
const dimLabel = computed(() => dimOptions.find(o => o.value === dim.value)?.label || '最近7天')

/** 切换天数选择下拉框的展开/收起 */
function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

/**
 * 选择天数维度并关闭下拉框
 * @param v 天数（7/15/30）
 */
function selectDim(v: number) {
  dim.value = v
  dropdownOpen.value = false
}

/** 点击页面其他区域时关闭下拉框 */
const handleWindowClick = () => {
  dropdownOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', handleWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('click', handleWindowClick)
})

// ===== 弹窗 =====
import ChargeRecordDialog from './ChargeRecordDialog.vue'

const dialogVisible = ref(false)

/** 打开充放电记录明细弹窗 */
function openDialog() {
  dialogVisible.value = true
}

// ===== ECharts =====

/**
 * 生成最近 N 天的日期标签数组（格式: M/D）
 * @param days 天数
 * @returns 日期字符串数组
 */
function genDates(days: number): string[] {
  const arr: string[] = []
  const now = dayjs()
  for (let i = days - 1; i >= 0; i--) {
    const d = now.clone().subtract(i, 'day')
    arr.push(d.format('M/D'))
  }
  return arr
}

/**
 * 使用正弦函数生成伪随机模拟数据
 * @param seed 随机种子
 * @param days 数据点数
 * @param min 最小值
 * @param max 最大值
 * @returns 模拟数据数组
 */
function genData(seed: number, days: number, min: number, max: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < days; i++) {
    const x = Math.sin(seed + i * 1.7) * 0.5 + 0.5
    arr.push(Math.round(min + x * (max - min)))
  }
  return arr
}

/**
 * 历史充放电量柱状图 ECharts 配置
 * 堆叠柱状图展示谷时段充电/平时段充电/峰时段放电
 */
const historyOption = computed(() => {
  const days = dim.value
  const dates = genDates(days)
  return {
    tooltip: axisTooltipConfig({ axisPointer: { type: 'shadow' } }),
    legend: {
      data: ['充电量（谷时段）', '充电量（平时段）', '放电量（峰时段）'],
      textStyle: { color: 'rgba(255,255,255,0.65)', fontSize: 10 },
      itemWidth: 12,
      itemHeight: 8,
      top: 0,
      right: 100
    },
    grid: { left: '2%', right: '3%', bottom: '4%', top: '16%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '单位：kWh',
      nameTextStyle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, align: 'left', padding: [0, 0, 0, -30] },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 }
    },
    series: [
      {
        name: '充电量（谷时段）',
        type: 'bar',
        stack: 'total',
        barWidth: '55%',
        data: genData(1, days, 800, 1600),
        itemStyle: { color: '#52C41A' }
      },
      {
        name: '充电量（平时段）',
        type: 'bar',
        stack: 'total',
        barWidth: '55%',
        data: genData(2, days, 600, 1400),
        itemStyle: { color: '#02A7F0' }
      },
      {
        name: '放电量（峰时段）',
        type: 'bar',
        stack: 'total',
        barWidth: '55%',
        data: genData(3, days, 1200, 2600),
        itemStyle: { color: '#FAAD14', borderRadius: [3, 3, 0, 0] }
      }
    ]
  }
})

/**
 * 当日实时充放电曲线 ECharts 配置
 * 三折线展示关口功率/并网功率/充放电功率的时间序列
 */
const realtimeOption = computed(() => ({
  tooltip: axisTooltipConfig(),
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
    data: props.realtimeSeries.xData,
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
    { name: '关口功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#02A7F0', width: 2 }, data: props.realtimeSeries.gatePower },
    { name: '并网功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#52C41A', width: 2 }, data: props.realtimeSeries.gridPower },
    { name: '充放电功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#FAAD14', width: 2 }, data: props.realtimeSeries.chargeDischargePower }
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

.chart-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #02A7F0;
}

.chart-title {
  margin-right: auto;
}

.detail-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.8) 0%, rgba(2, 167, 240, 0.5) 100%);
  border: 1px solid rgba(2, 167, 240, 0.6);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.7) 100%);
  box-shadow: 0 0 8px rgba(2, 167, 240, 0.3);
}

.detail-btn-icon {
  width: 12px;
  height: 12px;
}

.chart-dim-select {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #fff;
  background: rgba(2, 167, 240, 0.15);
  border: 1px solid rgba(2, 167, 240, 0.3);
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.chart-dim-select:hover {
  background: rgba(2, 167, 240, 0.25);
}

.dim-arrow {
  width: 14px;
  height: 14px;
  transition: transform 0.2s;
  color: #02A7F0;
}

.dim-arrow.open {
  transform: rotate(180deg);
}

.dim-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: rgba(10, 22, 40, 0.98);
  border: 1px solid rgba(2, 167, 240, 0.3);
  border-radius: 6px;
  padding: 4px 0;
  min-width: 100px;
  z-index: 100;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.dim-option {
  padding: 7px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.dim-option:hover {
  background: rgba(2, 167, 240, 0.15);
  color: #02A7F0;
}

.dim-option.active {
  background: rgba(2, 167, 240, 0.25);
  color: #02A7F0;
  font-weight: 500;
}

.chart-canvas {
  flex: 1;
  min-height: 0;
}

</style>
