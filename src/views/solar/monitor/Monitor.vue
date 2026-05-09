<template>
  <div class="monitor-container">
    <ModuleTabs :tabs="solarTabs" />

    <!-- 主体：左右分栏 -->
    <div class="monitor-main">
      <!-- 左侧：拓扑结构图 -->
      <div class="monitor-left">
        <SolarTopologyPanel />
      </div>

      <!-- 右侧：多个模块 -->
      <div class="monitor-right">
        <!-- 右上：光伏站监控 -->
        <div class="monitor-panel station-monitor-panel">
          <div class="panel-header">
            <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
            <span class="panel-header-text">光伏站监控</span>
          </div>
          <div class="station-stats-grid">
            <div v-for="(stat, idx) in monitorData?.stationStats ?? []" :key="idx" class="station-stat-card"
              :style="{ '--accent': stat.color }">
              <div class="station-stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
              <div class="station-stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- 右中：光伏逆变器监控 -->
        <div class="monitor-panel inverter-monitor-panel">
          <div class="panel-header">
            <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
            <span class="panel-header-text">光伏逆变器监控</span>
          </div>
          <div class="inverter-stats-grid">
            <div v-for="(stat, idx) in monitorData?.inverterStats ?? []" :key="idx" class="inverter-stat-card"
              :class="{ 'status-normal': stat.isStatus, 'status-normal-text': stat.statusType === 'normal', 'status-warning-text': stat.statusType === 'warning' }">
              <div class="inverter-stat-value">{{ stat.value }}</div>
              <div class="inverter-stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- 右下：发电量图表 -->
        <div class="monitor-panel generation-chart-panel">
          <div class="panel-header">
            <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
            <span class="panel-header-text">发电量统计</span>
          </div>
          <div class="generation-chart-body">
            <div ref="chartMainRef" class="chart-main-area">
              <v-chart ref="generationChartRef" class="chart-el" :option="generationChartOption" autoresize />
            </div>
            <div class="chart-right-sidebar">
              <!-- 日/周/月切换 -->
              <div class="period-tabs">
                <button v-for="p in periods" :key="p.key" class="period-tab" :class="{ active: activePeriod === p.key }"
                  @click="activePeriod = p.key">
                  {{ p.label }}
                </button>
              </div>
              <!-- 发电偏差率 -->
              <div class="deviation-card">
                <div class="deviation-value">+9.5%</div>
                <div class="deviation-label">发电偏差率</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { useApiData } from '@/composables/useApiData'
import { getMockSolarMonitorData } from '@/mocks/providers/energyStorage'
import { solarApi } from '@/api/api'

const solarTabs = [
  { name: '实时监控', path: '/solar/monitor' },
  { name: '运维管理', path: '/solar/maintenance' },
  { name: '计量与能效', path: '/solar/metering' }
]
import SolarTopologyPanel from './components/SolarTopologyPanel.vue'

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent
])

const { data: monitorData } = useApiData(
  getMockSolarMonitorData,
  () => solarApi.getMonitorData().then(r => r.data as any)
)

// 图表周期
const periods = [
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' }
]
const activePeriod = ref('month')
const generationChartRef = ref<any>(null)
const chartMainRef = ref<HTMLDivElement | null>(null)

const chartDataMap: Record<string, { planned: number[]; actual: number[]; xAxis: string[] }> = {
  day: { planned: [], actual: [], xAxis: Array.from({ length: 24 }, (_, i) => `${i}时`) },
  week: { planned: [], actual: [], xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
  month: { planned: [], actual: [], xAxis: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] }
}

const generationChartOption = computed(() => {
  const data = chartDataMap[activePeriod.value]
  const chartData = monitorData.value?.chartData as any
  if (chartData?.[activePeriod.value]) {
    data.planned = chartData[activePeriod.value].planned
    data.actual = chartData[activePeriod.value].actual
  }
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.9)',
      borderColor: 'rgba(2, 167, 240, 0.3)',
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['计划发电量', '实际发电量'],
      textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
      itemWidth: 18,
      itemHeight: 4,
      top: 4,
      left: 'center'
    },
    grid: { left: '3%', right: '4%', bottom: '6%', top: '18%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.xAxis,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 105,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
    },
    series: [
      {
        name: '计划发电量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#70B603', width: 2 },
        data: data.planned
      },
      {
        name: '实际发电量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#02A7F0', width: 2 },
        data: data.actual
      }
    ]
  }
})

/** 组件挂载后通过 ResizeObserver 监听容器尺寸，flex 布局稳定后自动 resize */
let resizeTimer: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!chartMainRef.value || !generationChartRef.value) return

  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    // debounce 50ms：等过渡动画结束后再 resize，避免频繁重绘
    resizeTimer = setTimeout(() => {
      generationChartRef.value?.resize()
    }, 50)
  })

  resizeObserver.observe(chartMainRef.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  if (resizeTimer) clearTimeout(resizeTimer)
})
</script>

<style scoped>
.monitor-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.monitor-main {
  display: flex;
  gap: 12px;
  height: calc(100vh - var(--header-height) - 66px);
  min-height: 600px;
}

.monitor-left {
  width: 32%;
  min-width: 280px;
  flex-shrink: 0;
}

.monitor-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.monitor-panel {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  padding: 16px;
}

.panel-header {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
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

.station-monitor-panel {
  flex-shrink: 0;
}

.station-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.station-stat-card {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.station-stat-value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.station-stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.inverter-monitor-panel {
  flex-shrink: 0;
}

.inverter-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.inverter-stat-card {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.inverter-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #02A7F0;
  line-height: 1.2;
}

.inverter-stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.inverter-stat-card.status-normal .inverter-stat-value {
  color: #22c55e;
}

.generation-chart-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.generation-chart-body {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
}

.chart-main-area {
  flex: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.chart-el {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.chart-right-sidebar {
  width: 140px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.period-tabs {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.period-tab {
  width: 36px;
  height: 28px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.period-tab:hover {
  border-color: rgba(2, 167, 240, 0.5);
  color: rgba(255, 255, 255, 0.8);
}

.period-tab.active {
  background: #02A7F0;
  border-color: #02A7F0;
  color: #fff;
}

.deviation-card {
  flex: 1;
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.deviation-value {
  font-size: 28px;
  font-weight: 700;
  color: #02A7F0;
}

.deviation-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 1199px) {
  .station-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .inverter-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .monitor-main {
    flex-direction: column;
    height: auto;
  }

  .monitor-left {
    width: 100%;
    min-width: 0;
    min-height: 300px;
  }

  .monitor-right {
    width: 100%;
  }

  .chart-right-sidebar {
    width: 100%;
    flex-direction: row;
    align-items: center;
  }

  .deviation-card {
    flex: 0 0 auto;
    padding: 12px 24px;
  }

  .generation-chart-body {
    flex-direction: column;
  }
}

@media (max-width: 767px) {
  .station-stats-grid {
    grid-template-columns: 1fr;
  }

  .inverter-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
