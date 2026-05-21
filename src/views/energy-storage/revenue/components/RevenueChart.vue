<template>
  <div class="revenue-chart-section">
    <div class="chart-toolbar">
      <div class="toolbar-left">
        <div class="date-range">
          <Calendar class="date-icon" :size="16" />
          <!-- 日: date -->
          <template v-if="activePeriod === 'day'">
            <input v-model="searchForm.startDate" type="date" class="date-input" />
            <span class="date-sep">至</span>
            <input v-model="searchForm.endDate" type="date" class="date-input" />
          </template>
          <!-- 月: month -->
          <template v-else-if="activePeriod === 'month'">
            <input v-model="searchForm.startMonth" type="month" class="date-input" />
            <span class="date-sep">至</span>
            <input v-model="searchForm.endMonth" type="month" class="date-input" />
          </template>
          <!-- 季: quarter -->
          <template v-else-if="activePeriod === 'quarter'">
            <select v-model="searchForm.startQuarter" class="date-input quarter-select">
              <option v-for="q in quarterOptions" :key="q.value" :value="q.value">{{ q.label }}</option>
            </select>
            <span class="date-sep">至</span>
            <select v-model="searchForm.endQuarter" class="date-input quarter-select">
              <option v-for="q in quarterOptions" :key="q.value" :value="q.value">{{ q.label }}</option>
            </select>
          </template>
          <!-- 年: number -->
          <template v-else-if="activePeriod === 'year'">
            <input v-model.number="searchForm.startYear" type="number" min="2020" max="2030" class="date-input year-input" />
            <span class="date-sep">至</span>
            <input v-model.number="searchForm.endYear" type="number" min="2020" max="2030" class="date-input year-input" />
          </template>
        </div>
        <div class="period-tabs">
          <button v-for="p in periods" :key="p.key" class="period-btn" :class="{ active: activePeriod === p.key }" @click="onPeriodChange(p.key)">{{ p.label }}</button>
        </div>
        <button class="search-btn" @click="onSearch">
          <Search :size="14" />
          <span>查询</span>
        </button>
      </div>
    </div>
    <div class="stat-cards">
      <div class="stat-card cost">
        <div class="stat-left">
          <div class="stat-info">
            <span class="stat-label">充电总成本</span>
            <span class="stat-change down">环比下降3.2%</span>
          </div>
        </div>
        <div class="stat-right">
          <span class="stat-currency">¥</span>
          <span class="stat-value">{{ formatNumber(statValues.cost) }}</span>
        </div>
      </div>
      <div class="stat-card income">
        <div class="stat-left">
          <div class="stat-info">
            <span class="stat-label">放电总收益</span>
            <span class="stat-change up">环比增长12.5%</span>
          </div>
        </div>
        <div class="stat-right">
          <span class="stat-currency">¥</span>
          <span class="stat-value">{{ formatNumber(statValues.income) }}</span>
        </div>
      </div>
      <div class="stat-card net">
        <div class="stat-left">
          <div class="stat-info">
            <span class="stat-label">净收益</span>
            <span class="stat-change up">环比增长8.2%</span>
          </div>
        </div>
        <div class="stat-right">
          <span class="stat-currency">¥</span>
          <span class="stat-value">{{ formatNumber(statValues.net) }}</span>
        </div>
      </div>
    </div>
    <div ref="chartRef" class="chart-area"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { Calendar, Search } from 'lucide-vue-next'
import * as echarts from 'echarts'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import { axisTooltipHtml } from '@/utils/echartsTooltip'

const searchForm = ref({
  startDate: '2026-03-12',
  endDate: '2026-03-18',
  startMonth: '2026-01',
  endMonth: '2026-12',
  startQuarter: '2026-Q1',
  endQuarter: '2026-Q4',
  startYear: 2022,
  endYear: 2026
})

/** 生成年份-季度选项列表（2020-2030） */
const quarterOptions = computed(() => {
  const options: { value: string; label: string }[] = []
  for (let y = 2020; y <= 2030; y++) {
    for (let q = 1; q <= 4; q++) {
      options.push({ value: `${y}-Q${q}`, label: `${y}年Q${q}` })
    }
  }
  return options
})

const periods = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'quarter', label: '季' },
  { key: 'year', label: '年' }
]
const activePeriod = ref('day')

/**
 * 切换收益统计周期（日/月/季/年）
 * 更新 activePeriod 并刷新图表数据和统计卡片
 * @param key 周期标识
 */
function onPeriodChange(key: string) {
  activePeriod.value = key
  refreshChartData()
}

/** 触发收益数据查询（TODO: 实际查询逻辑） */
function onSearch() { console.log('search', searchForm.value, activePeriod.value) }

// 根据维度生成 X 轴标签和模拟数据
const chartLabels = ref<string[]>([])
const costData = ref<number[]>([])
const incomeData = ref<number[]>([])

/** 汇总充电成本和放电收益，计算净收益 */
const statValues = computed(() => {
  const cost = costData.value.reduce((a, b) => a + b, 0)
  const income = incomeData.value.reduce((a, b) => a + b, 0)
  return { cost, income, net: income - cost }
})

/**
 * 将数字格式化为中文千分位小数（保留两位）
 * @param n 数值
 * @returns 格式化后的字符串
 */
function formatNumber(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * 根据当前周期维度生成 X 轴标签和模拟成本/收益数据
 * 日→31 天，月→12 个月，季→4 个季度，年→5 年
 */
function refreshChartData() {
  const dim = activePeriod.value
  if (dim === 'day') {
    chartLabels.value = Array.from({ length: 31 }, (_, i) => (i + 1).toString())
    costData.value = chartLabels.value.map((_, d) => 200 + Math.random() * 300 + d * 15)
    incomeData.value = chartLabels.value.map((_, d) => 800 + Math.random() * 400 + d * 30)
  } else if (dim === 'month') {
    chartLabels.value = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    costData.value = chartLabels.value.map(() => 8000 + Math.random() * 4000)
    incomeData.value = chartLabels.value.map(() => 35000 + Math.random() * 15000)
  } else if (dim === 'quarter') {
    chartLabels.value = ['Q1', 'Q2', 'Q3', 'Q4']
    costData.value = chartLabels.value.map(() => 30000 + Math.random() * 15000)
    incomeData.value = chartLabels.value.map(() => 120000 + Math.random() * 50000)
  } else if (dim === 'year') {
    chartLabels.value = ['2022', '2023', '2024', '2025', '2026']
    costData.value = chartLabels.value.map((_, i) => 120000 + i * 15000 + Math.random() * 20000)
    incomeData.value = chartLabels.value.map((_, i) => 500000 + i * 80000 + Math.random() * 50000)
  }
  updateChart()
}

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

/** 生成 ECharts tooltip 格式化函数，根据当前周期追加单位后缀 */
function getTooltipFormatter() {
  const dim = activePeriod.value
  const suffix = dim === 'day' ? '日' : dim === 'month' ? '' : dim === 'quarter' ? '' : '年'
  return (params: any[]) => {
    const title = params[0].axisValue + suffix
    return axisTooltipHtml(
      params.map((p) => ({
        axisValue: title,
        seriesName: p.seriesName,
        value: p.value.toFixed(0),
        color: p.color
      })),
      title
    )
  }
}

/** 初始化 ECharts 实例并绑定到 chartRef 容器 */
function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

/**
 * 更新 ECharts 图表配置
 * 双折线（成本 + 收益）+ 面积渐变填充
 */
function updateChart() {
  if (!chartInstance) return
  const option: any = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'transparent',
      borderWidth: 0,
      padding: 0,
      textStyle: { color: '#fff' },
      appendToBody: true,
      formatter: getTooltipFormatter()
    },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: chartLabels.value,
      axisLine: { lineStyle: { color: 'rgba(6,182,212,0.3)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
    },
    series: [
      {
        name: '成本',
        type: 'line',
        data: costData.value,
        smooth: false,
        symbol: 'none',
        lineStyle: { color: '#F59E0B', width: 2 },
        itemStyle: { color: '#F59E0B' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,158,11,0.25)' },
            { offset: 1, color: 'rgba(245,158,11,0)' }
          ])
        }
      },
      {
        name: '收益',
        type: 'line',
        data: incomeData.value,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#1DE9B6', width: 2, type: 'dashed' },
        itemStyle: { color: '#1DE9B6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'RGBA(29, 233, 182, 0.15)' },
            { offset: 1, color: 'RGBA(29, 233, 182, 0)' }
          ])
        }
      }
    ]
  }
  chartInstance.setOption(option, true)
}

/**
 * 订阅 WebSocket 实时收益数据（5s 间隔）
 * 更新当前周期最后一项的成本/收益数据并刷新图表
 */
useRealtimeChannel('revenue', (payload: unknown) => {
  const p = payload as { costData?: number; incomeData?: number }
  const lastIdx = costData.value.length - 1
  if (p.costData !== undefined && lastIdx >= 0) {
    costData.value[lastIdx] = p.costData
  }
  if (p.incomeData !== undefined && lastIdx >= 0) {
    incomeData.value[lastIdx] = p.incomeData
  }
  chartInstance?.setOption({
    series: [
      { data: costData.value },
      { data: incomeData.value }
    ]
  })
})

/** 响应 resize 事件重新绘制图表 */
function resizeChart() { chartInstance?.resize() }

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(() => {
    initChart()
    if (chartRef.value) {
      resizeObserver = new ResizeObserver(() => chartInstance?.resize())
      resizeObserver.observe(chartRef.value)
    }
  })
  window.addEventListener('resize', resizeChart)
})
/** 组件卸载时清理 ECharts 实例、ResizeObserver 和全局 resize 监听 */
onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  resizeObserver?.disconnect()
  chartInstance?.dispose()
  chartInstance = null
})
/** 切换统计周期后重新计算图表尺寸 */
watch(activePeriod, () => { nextTick(() => chartInstance?.resize()) })

// 初始化数据
refreshChartData()
</script>
<style scoped>
.revenue-chart-section { display: flex; flex-direction: column; gap: 14px; }
.chart-toolbar { display: flex; align-items: center; gap: 12px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.date-range { display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(129,211,248,0.15); border-radius: 4px; }
.date-icon { color: rgba(255,255,255,0.4); }
.date-input { background: transparent; border: none; color: #fff; font-size: 13px; outline: none; width: 110px; }
.date-input::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.6; cursor: pointer; }
.year-input { width: 70px; text-align: center; }
.year-input::-webkit-inner-spin-button,
.year-input::-webkit-outer-spin-button { opacity: 0.6; }
.quarter-select { width: 110px; background: transparent; border: none; color: #fff; font-size: 13px; outline: none; cursor: pointer; }
.quarter-select option { background: #1a2a3e; color: #fff; }
.date-sep { color: rgba(255,255,255,0.4); font-size: 13px; }
.period-tabs { display: flex; gap: 2px; }
.period-btn { padding: 5px 24px; border-radius: 3px; background: transparent; background-image: url('/images/tabDefaultBg.png'); background-size: 100% 100%; background-repeat: no-repeat; border: none; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.2s; }
.period-btn.active { background-image: url('/images/tabSeletedBg.png'); color: #fff; }
.period-btn:hover:not(.active) { background: rgba(2,167,240,0.15); }
.search-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 4px; background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%); color: #fff; font-size: 13px; border: none; cursor: pointer; }
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.stat-card { padding: 28px 18px 28px 100px; border-radius: 8px; background-size: 100% 100%; background-repeat: no-repeat; display: flex; align-items: center; justify-content: space-between; }
.stat-card.cost { background-image: url('/images/chargingCost@2x.png'); }
.stat-card.income { background-image: url('/images/dischargeRevenue@2x.png'); }
.stat-card.net { background-image: url('/images/netIncome@2x.png'); }
.stat-left { display: flex; align-items: center; gap: 10px; }
.stat-icon { color: rgba(255,255,255,0.7); flex-shrink: 0; }
.stat-card.cost .stat-icon { color: #FF6B6B; }
.stat-card.income .stat-icon { color: #4CAF50; }
.stat-card.net .stat-icon { color: #7B68EE; }
.stat-info { display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 13px; color: rgba(255,255,255,0.8); }
.stat-change { font-size: 12px; }
.stat-change.up { color: #4CAF50; background: rgba(22,163,74,0.2);padding:2px 4px;border-radius: 4px;}
.stat-change.down { color: #FF6B6B; background: rgba(217,45,32,0.2);padding:2px 4px;border-radius: 4px;}
.stat-right { display: flex; align-items: baseline; gap: 2px; }
.stat-currency { font-size: 16px; color: rgba(255,255,255,0.8); }
.stat-value { font-size: 26px; font-weight: 700; }
.stat-card.cost .stat-value { color: #FF6B6B; }
.stat-card.income .stat-value { color: #4CAF50; }
.stat-card.net .stat-value { color: #7B68EE; }
.chart-area { width: 100%; height: 220px; background: rgba(6,12,24,0.8); border: 1px solid rgba(6,182,212,0.25); border-radius: 4px; }
@media (max-width: 768px) { .stat-cards { grid-template-columns: 1fr; } }
</style>
