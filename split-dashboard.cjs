const fs = require('fs');

const content = fs.readFileSync('src/views/energy-storage/dashboard/Dashboard.vue', 'utf8');
const lines = content.split('\n');

const scriptStart = lines.findIndex(l => l.trim() === '<script setup lang="ts">');
const scriptEnd = lines.findIndex(l => l.trim() === '</script>');
const styleStart = lines.findIndex(l => l.trim() === '<style scoped>');

const templateLines = lines.slice(0, scriptStart);
const scriptLines = lines.slice(scriptStart, scriptEnd + 1);
const styleLines = lines.slice(styleStart);

// Helper to extract template sections by line range
function extractTemplate(startLine, endLine) {
  // startLine and endLine are 1-indexed
  return templateLines.slice(startLine - 1, endLine).join('\n');
}

// Helper to extract style rules by searching for selectors
function extractStyleRules(selectors) {
  const result = [];
  let i = 0;
  while (i < styleLines.length) {
    const line = styleLines[i];
    const matched = selectors.some(sel => line.includes(sel));
    if (matched) {
      // Find the matching closing brace, considering nested rules
      let depth = 0;
      let j = i;
      while (j < styleLines.length) {
        const l = styleLines[j];
        if (l.includes('{')) depth += (l.match(/{/g) || []).length;
        if (l.includes('}')) depth -= (l.match(/}/g) || []).length;
        j++;
        if (depth === 0) break;
      }
      result.push(...styleLines.slice(i, j));
      i = j;
    } else {
      i++;
    }
  }
  return result.join('\n');
}

// StationOverviewPanel: template lines 9-45, script: statIcons, stationStats, formatNumber, realtime update
// Scene3DPanel: template lines 48-99, script: anchors, activeAnchorId, handleSceneClick, handleAnchorClick
// ChargeAnalysisPanel: template lines 104-117, script: chargeDischargeChartOption
// RevenueStatsPanel: template lines 120-144, script: revenueAmount, revenueGrowth, revenueChartOption
// AlarmStatsPanel: template lines 147-158, script: alarmData, alarmChartOption

// Shared echarts imports and use() call
const echartsImports = `import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])`;

// 1. StationOverviewPanel
const stationTemplate = extractTemplate(9, 45);
const stationScript = `import { ref } from 'vue'
import {
  Battery, Zap, Plug, ShieldCheck, MapPin, Server
} from 'lucide-vue-next'

const statIcons = [Battery, Zap, Plug, Zap, ShieldCheck, MapPin, Server]

const stationStats = ref([
  { label: '累计装机容量', value: 15280, unit: 'MWh', trend: '+8.5%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
  { label: '累计装机功率', value: 2500, unit: 'MW', trend: '+6.2%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
  { label: '累计总充电量', value: 85600, unit: 'MWh', desc: '历史累计充电总量', color: '#22c55e', borderColor: '#22c55e' },
  { label: '累计总放电量', value: 78300, unit: 'MWh', desc: null, color: '#f59e0b', borderColor: '#f59e0b' },
  { label: '安全运行天数', value: 1250, unit: '天', desc: '历史无安全事故总天数', color: '#22c55e', borderColor: '#22c55e' },
  { label: '总电站数', value: 328, unit: '站', desc: null, color: '#a855f7', borderColor: '#a855f7' },
  { label: '总储能柜数', value: 1850, unit: '台', desc: null, color: '#ec4899', borderColor: '#ec4899' }
])

const formatNumber = (num: number) => num.toLocaleString('zh-CN')`;
const stationStyle = extractStyleRules(['.station-panel', '.station-inner', '.stats-grid', '.stat-card', '.stat-accent-line', '.stat-body', '.stat-icon-wrap', '.stat-icon', '.stat-info', '.stat-label', '.stat-value-row', '.stat-value', '.stat-unit', '.stat-trend', '.trend-label', '.trend-value', '.stat-desc', '.stat-desc-placeholder']);

fs.writeFileSync('src/views/energy-storage/dashboard/components/StationOverviewPanel.vue',
`<template>
${stationTemplate}
</template>

<script setup lang="ts">
${stationScript}
</script>

<style scoped>
${stationStyle}
</style>
`, 'utf8');

// 2. Scene3DPanel
const sceneTemplate = extractTemplate(48, 99);
const sceneScript = `import { ref } from 'vue'
import { MapPin } from 'lucide-vue-next'

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
  { id: '1', top: '28%', left: '42%', deviceCode: 'R251205J0055', status: '正常', capacity: '200Wh', area: 'G12', operateTime: '2026年1月3日' },
  { id: '2', top: '35%', left: '52%', deviceCode: 'R251205J0056', status: '正常', capacity: '300Wh', area: 'G13', operateTime: '2026年1月5日' },
  { id: '3', top: '22%', left: '58%', deviceCode: 'R251205J0057', status: '告警', capacity: '150Wh', area: 'G14', operateTime: '2026年1月8日' }
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
}`;
const sceneStyle = extractStyleRules(['.revenue-panel', '.scene-panel-body', '.panel-bg-img', '.scene-overlay', '.scene-anchor', '.anchor-pin', '.anchor-pulse', '.anchor-icon', '.anchor-popup', '.popup-header', '.popup-body', '.popup-row', '.popup-label', '.popup-value', '.status-normal', '.status-alert']);

fs.writeFileSync('src/views/energy-storage/dashboard/components/Scene3DPanel.vue',
`<template>
${sceneTemplate}
</template>

<script setup lang="ts">
${sceneScript}
</script>

<style scoped>
${sceneStyle}
</style>
`, 'utf8');

// 3. ChargeAnalysisPanel
const chargeTemplate = extractTemplate(104, 117);
const chargeScript = `import { computed } from 'vue'
${echartsImports}

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
}))`;
const chargeStyle = extractStyleRules(['.charge-panel', '.charge-inner', '.charge-label', '.charge-value', '.charge-divider', '.charge-chart-wrap', '.charge-chart-el']);

fs.writeFileSync('src/views/energy-storage/dashboard/components/ChargeAnalysisPanel.vue',
`<template>
${chargeTemplate}
</template>

<script setup lang="ts">
${chargeScript}
</script>

<style scoped>
${chargeStyle}
</style>
`, 'utf8');

// 4. RevenueStatsPanel
const revenueTemplate = extractTemplate(120, 144);
const revenueScript = `import { computed, ref } from 'vue'
import { TrendingUp } from 'lucide-vue-next'
${echartsImports}

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
      return \`<div style="font-size:12px">\${p.name}</div><div style="font-size:12px">总收益 \${p.value}</div>\`
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
}))`;
const revenueStyle = extractStyleRules(['.runtime-panel', '.runtime-inner', '.runtime-grid', '.runtime-card', '.rt-label', '.rt-value', '.revenue-chart-wrap', '.revenue-info', '.revenue-icon-wrap', '.revenue-icon', '.revenue-detail', '.revenue-label', '.revenue-amount', '.revenue-growth', '.growth-arrow', '.revenue-link', '.revenue-chart-area', '.chart-el']);

fs.writeFileSync('src/views/energy-storage/dashboard/components/RevenueStatsPanel.vue',
`<template>
${revenueTemplate}
</template>

<script setup lang="ts">
${revenueScript}
</script>

<style scoped>
${revenueStyle}
</style>
`, 'utf8');

// 5. AlarmStatsPanel
const alarmTemplate = extractTemplate(147, 158);
const alarmScript = `import { computed, ref } from 'vue'
${echartsImports}

const alarmData = ref([
  { value: 61, itemStyle: { color: '#EC808D', borderRadius: [3, 3, 0, 0] } },
  { value: 112, itemStyle: { color: '#F59A23', borderRadius: [3, 3, 0, 0] } },
  { value: 44, itemStyle: { color: '#588BF0', borderRadius: [3, 3, 0, 0] } }
])

const alarmChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '12%', right: '6%', bottom: '16%', top: '10%', containLabel: false },
  xAxis: {
    type: 'category', data: ['紧急告警', '重要告警', '一般告警'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value', max: 250, interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [{
    type: 'bar', barWidth: 32, data: alarmData.value,
    label: { show: true, position: 'top', color: '#fff', fontSize: 11 }
  }]
}))`;
const alarmStyle = extractStyleRules(['.alarm-panel', '.alarm-inner', '.alarm-chart-el']);

fs.writeFileSync('src/views/energy-storage/dashboard/components/AlarmStatsPanel.vue',
`<template>
${alarmTemplate}
</template>

<script setup lang="ts">
${alarmScript}
</script>

<style scoped>
${alarmStyle}
</style>
`, 'utf8');

// Now rewrite Dashboard.vue as a thin container
const dashboardTemplate = `<template>
  <div class="dashboard-container">
    <ModuleTabs :tabs="energyStorageTabs" />

    <div class="upper-section">
      <StationOverviewPanel />
      <Scene3DPanel />
    </div>
    <div class="lower-section">
      <ChargeAnalysisPanel />
      <RevenueStatsPanel />
      <AlarmStatsPanel />
    </div>
  </div>
</template>`;

const dashboardScript = `<script setup lang="ts">
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import StationOverviewPanel from './components/StationOverviewPanel.vue'
import Scene3DPanel from './components/Scene3DPanel.vue'
import ChargeAnalysisPanel from './components/ChargeAnalysisPanel.vue'
import RevenueStatsPanel from './components/RevenueStatsPanel.vue'
import AlarmStatsPanel from './components/AlarmStatsPanel.vue'

const energyStorageTabs = [
  { name: '可视看板', path: '/energy-storage/dashboard' },
  { name: '实时监控', path: '/energy-storage/monitor' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '电价管理', path: '/energy-storage/price' },
  { name: '抄表结算', path: '/energy-storage/settlement' },
  { name: '收益管理', path: '/energy-storage/revenue' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]
</script>`;

const dashboardStyle = extractStyleRules(['.dashboard-container', '.upper-section', '.lower-section']);

fs.writeFileSync('src/views/energy-storage/dashboard/Dashboard.vue',
`${dashboardTemplate}

${dashboardScript}

<style scoped>
${dashboardStyle}
</style>
`, 'utf8');

console.log('Split Dashboard.vue into 5 sub-components');
