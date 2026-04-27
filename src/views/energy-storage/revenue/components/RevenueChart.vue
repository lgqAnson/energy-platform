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
          <!-- 季: month（选季度起始月） -->
          <template v-else-if="activePeriod === 'quarter'">
            <input v-model="searchForm.startQuarter" type="month" class="date-input" />
            <span class="date-sep">至</span>
            <input v-model="searchForm.endQuarter" type="month" class="date-input" />
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
        <div class="stat-label">充电总成本</div>
        <div class="stat-value">{{ formatNumber(statValues.cost) }}</div>
        <div class="stat-change down">环比下降 3.2%</div>
      </div>
      <div class="stat-card income">
        <div class="stat-label">放电总收益</div>
        <div class="stat-value">{{ formatNumber(statValues.income) }}</div>
        <div class="stat-change up">环比增长 12.5%</div>
      </div>
      <div class="stat-card net">
        <div class="stat-label">净收益</div>
        <div class="stat-value">{{ formatNumber(statValues.net) }}</div>
        <div class="stat-change up">环比增长 8.2%</div>
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

const searchForm = ref({
  startDate: '2026-03-12',
  endDate: '2026-03-18',
  startMonth: '2026-01',
  endMonth: '2026-12',
  startQuarter: '2026-01',
  endQuarter: '2026-12',
  startYear: 2022,
  endYear: 2026
})

const periods = [
  { key: 'day', label: '日' },
  { key: 'month', label: '月' },
  { key: 'quarter', label: '季' },
  { key: 'year', label: '年' }
]
const activePeriod = ref('day')

function onPeriodChange(key: string) {
  activePeriod.value = key
  refreshChartData()
}

function onSearch() { console.log('search', searchForm.value, activePeriod.value) }

// 根据维度生成 X 轴标签和模拟数据
const chartLabels = ref<string[]>([])
const costData = ref<number[]>([])
const incomeData = ref<number[]>([])

const statValues = computed(() => {
  const cost = costData.value.reduce((a, b) => a + b, 0)
  const income = incomeData.value.reduce((a, b) => a + b, 0)
  return { cost, income, net: income - cost }
})

function formatNumber(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

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

function getTooltipFormatter() {
  const dim = activePeriod.value
  const suffix = dim === 'day' ? '日' : dim === 'month' ? '' : dim === 'quarter' ? '' : '年'
  return (params: any) => {
    const p = params as any[]
    return p[0].axisValue + suffix + '<br/>' + p[0].marker + ' 成本: ' + p[0].value.toFixed(0) + '<br/>' + p[1].marker + ' 收益: ' + p[1].value.toFixed(0)
  }
}

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  updateChart()
}

function updateChart() {
  if (!chartInstance) return
  const option: any = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 31, 53, 0.95)',
      borderColor: 'rgba(129, 211, 248, 0.2)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: getTooltipFormatter()
    },
    grid: { left: 50, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: chartLabels.value,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 }
    },
    series: [
      {
        name: '成本',
        type: 'line',
        data: costData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#FF6B6B', width: 2 },
        itemStyle: { color: '#FF6B6B' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,107,0.2)' },
            { offset: 1, color: 'rgba(255,107,107,0)' }
          ])
        }
      },
      {
        name: '收益',
        type: 'line',
        data: incomeData.value,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#4CAF50', width: 2 },
        itemStyle: { color: '#4CAF50' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(76,175,80,0.2)' },
            { offset: 1, color: 'rgba(76,175,80,0)' }
          ])
        }
      }
    ]
  }
  chartInstance.setOption(option, true)
}

// WebSocket 实时数据订阅（5s）
useRealtimeChannel('revenue', (payload) => {
  const lastIdx = costData.value.length - 1
  if (payload.costData !== undefined && lastIdx >= 0) {
    costData.value[lastIdx] = payload.costData
  }
  if (payload.incomeData !== undefined && lastIdx >= 0) {
    incomeData.value[lastIdx] = payload.incomeData
  }
  chartInstance?.setOption({
    series: [
      { data: costData.value },
      { data: incomeData.value }
    ]
  })
})

function resizeChart() { chartInstance?.resize() }

onMounted(() => { nextTick(() => initChart()); window.addEventListener('resize', resizeChart) })
onUnmounted(() => { window.removeEventListener('resize', resizeChart); chartInstance?.dispose() })
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
.date-sep { color: rgba(255,255,255,0.4); font-size: 13px; }
.period-tabs { display: flex; gap: 2px; }
.period-btn { padding: 5px 14px; border-radius: 3px; background: rgba(255,255,255,0.06); border: 1px solid rgba(129,211,248,0.1); color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.2s; }
.period-btn.active { background: #02A7F0; color: #fff; border-color: #02A7F0; }
.period-btn:hover:not(.active) { background: rgba(2,167,240,0.15); }
.search-btn { display: flex; align-items: center; gap: 4px; padding: 6px 14px; border-radius: 4px; background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%); color: #fff; font-size: 13px; border: none; cursor: pointer; }
.stat-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card { padding: 14px 16px; border-radius: 8px; background: rgba(10,23,42,0.5); border: 1px solid rgba(129,211,248,0.1); }
.stat-label { font-size: 13px; color: rgba(255,255,255,0.6); margin-bottom: 6px; }
.stat-value { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
.stat-card.cost .stat-value { color: #FF6B6B; }
.stat-card.income .stat-value { color: #4CAF50; }
.stat-card.net .stat-value { color: #7B68EE; }
.stat-change { font-size: 12px; }
.stat-change.up { color: #4CAF50; }
.stat-change.down { color: #FF6B6B; }
.chart-area { width: 100%; height: 220px; }
@media (max-width: 768px) { .stat-cards { grid-template-columns: 1fr; } }
</style>
