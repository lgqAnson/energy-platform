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

  <!-- 充放电记录明细弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="dialogVisible" class="modal-overlay" @click="closeDialog">
        <div class="modal-container" @click.stop>
          <!-- 标题栏 -->
          <div class="modal-header">
            <div class="modal-title">
              <ClipboardList class="modal-title-icon" />
              <span>充放电记录明细</span>
            </div>
            <button class="modal-close" @click="closeDialog">
              <X />
            </button>
          </div>

          <!-- 搜索栏 -->
          <div class="modal-toolbar">
            <div class="toolbar-label">时间范围：</div>
            <div class="date-range">
              <input v-model="searchForm.startDate" type="date" class="date-input" />
              <span class="date-sep">-</span>
              <input v-model="searchForm.endDate" type="date" class="date-input" />
            </div>
            <button class="toolbar-btn btn-primary" @click="handleSearch">
              <Search class="btn-icon" />
              <span>查询</span>
            </button>
            <button class="toolbar-btn btn-default" @click="handleReset">
              <RotateCcw class="btn-icon" />
              <span>重置</span>
            </button>
            <button class="toolbar-btn btn-success" @click="handleExport">
              <Download class="btn-icon" />
              <span>导出</span>
            </button>
          </div>

          <!-- 表格 -->
          <div class="modal-table-wrap">
            <table class="modal-table">
              <thead>
                <tr>
                  <th>储能柜名称</th>
                  <th>柜号</th>
                  <th>充放电类型</th>
                  <th>平均功率(kW)</th>
                  <th>累计电量(kWh)</th>
                  <th>起始时间</th>
                  <th>结束时间</th>
                  <th>起始SOC(%)</th>
                  <th>结束SOC(%)</th>
                  <th>充放电时长</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in paginatedData" :key="idx" :class="{ even: idx % 2 === 1 }">
                  <td>{{ row.cabinetName }}</td>
                  <td>{{ row.cabinetNo }}</td>
                  <td>
                    <span class="type-tag" :class="row.type === '充电' ? 'charge' : 'discharge'">{{ row.type }}</span>
                  </td>
                  <td>{{ row.avgPower }}</td>
                  <td>{{ row.totalEnergy }}</td>
                  <td>{{ row.startTime }}</td>
                  <td>{{ row.endTime }}</td>
                  <td>{{ row.startSoc }}</td>
                  <td>{{ row.endSoc }}</td>
                  <td>{{ row.duration }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="modal-pagination">
            <span class="page-total">共 {{ tableData.length }} 条</span>
            <select v-model="pageSize" class="page-size-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
            <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">&lt;</button>
            <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{ active: p === currentPage }"
              @click="currentPage = p">
              {{ p }}
            </button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import { ChevronDown, Search, X, ClipboardList, RotateCcw, Download } from 'lucide-vue-next'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

// ===== 下拉选择器 =====
const dim = ref(7)
const dropdownOpen = ref(false)
const dimOptions = [
  { value: 7, label: '最近7天' },
  { value: 15, label: '最近15天' },
  { value: 30, label: '最近30天' }
]
const dimLabel = computed(() => dimOptions.find(o => o.value === dim.value)?.label || '最近7天')

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}
function selectDim(v: number) {
  dim.value = v
  dropdownOpen.value = false
}
if (typeof window !== 'undefined') {
  window.addEventListener('click', () => { dropdownOpen.value = false })
}

// ===== 弹窗 =====
const dialogVisible = ref(false)
function openDialog() {
  dialogVisible.value = true
}
function closeDialog() {
  dialogVisible.value = false
}

// ===== 搜索表单 =====
const today = new Date().toISOString().split('T')[0]
const searchForm = ref({
  startDate: today,
  endDate: today
})
function handleSearch() {
  // 模拟查询
  currentPage.value = 1
}
function handleReset() {
  searchForm.value.startDate = today
  searchForm.value.endDate = today
  currentPage.value = 1
}
function handleExport() {
  alert('导出功能开发中...')
}

// ===== 模拟表格数据 =====
const cabinetNames = ['R251205J0055', 'R251205J0057', 'R251205J0054', 'R251205J0056', 'R251205J0058']
const tableData = ref(Array.from({ length: 23 }, (_, i) => {
  const cabinetIdx = i % cabinetNames.length
  const isCharge = i % 3 !== 0
  const start = new Date('2026-03-25T00:00:00')
  start.setMinutes(start.getMinutes() + i * 7 + Math.floor(Math.random() * 30))
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 60 + Math.floor(Math.random() * 10))
  const durationMin = (end.getTime() - start.getTime()) / 60000
  const hours = Math.floor(durationMin / 60)
  const mins = Math.floor(durationMin % 60)
  return {
    cabinetName: cabinetNames[cabinetIdx],
    cabinetNo: (i % 5),
    type: isCharge ? '充电' : '放电',
    avgPower: ((isCharge ? -1 : 1) * (58 + Math.random() * 2)).toFixed(2),
    totalEnergy: (61 + Math.random() * 2).toFixed(1),
    startTime: start.toISOString().replace('T', ' ').slice(0, 19),
    endTime: end.toISOString().replace('T', ' ').slice(0, 19),
    startSoc: 1,
    endSoc: 23 + Math.floor(Math.random() * 3),
    duration: `${hours}.${(mins / 60 * 100).toFixed(0).padStart(2, '0')}`
  }
}))

// ===== 分页 =====
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.ceil(tableData.value.length / pageSize.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})
const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

// ===== ECharts =====
function genDates(days: number): string[] {
  const arr: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    arr.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return arr
}

function genData(seed: number, days: number, min: number, max: number): number[] {
  const arr: number[] = []
  for (let i = 0; i < days; i++) {
    const x = Math.sin(seed + i * 1.7) * 0.5 + 0.5
    arr.push(Math.round(min + x * (max - min)))
  }
  return arr
}

const historyOption = computed(() => {
  const days = dim.value
  const dates = genDates(days)
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      borderColor: 'rgba(2, 167, 240, 0.3)',
      textStyle: { color: '#fff', fontSize: 12 },
      axisPointer: { type: 'shadow' }
    },
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

// 实时曲线数据（响应式，支持增量更新）
const MAX_POINTS = 50 // 滑动窗口最大点数

const realtimeXData = ref(['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'])
const realtimeGatePower = ref([0, 0, 0, 200, 800, 1200, 1400, 1300, 1100, 900, 600, 200, 0])
const realtimeGridPower = ref([0, 0, 0, 150, 600, 1000, 1200, 1100, 900, 700, 400, 150, 0])
const realtimeChargeDischarge = ref([0, 0, 0, 100, 400, 800, 1000, 900, 700, 500, 300, 100, 0])

const realtimeOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.9)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff', fontSize: 11 }
  },
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
    data: realtimeXData.value,
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
    { name: '关口功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#02A7F0', width: 2 }, data: realtimeGatePower.value },
    { name: '并网功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#52C41A', width: 2 }, data: realtimeGridPower.value },
    { name: '充放电功率', type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#FAAD14', width: 2 }, data: realtimeChargeDischarge.value }
  ]
}))

// WebSocket 实时数据订阅：追加实时曲线点
useRealtimeChannel('monitor', (payload) => {
  if (payload.realtimePoint) {
    const p = payload.realtimePoint
    realtimeXData.value.push(p.time)
    realtimeGatePower.value.push(p.gatePower)
    realtimeGridPower.value.push(p.gridPower)
    realtimeChargeDischarge.value.push(p.chargeDischargePower)

    // 滑动窗口：超过最大点数时移除最旧的点
    if (realtimeXData.value.length > MAX_POINTS) {
      realtimeXData.value.shift()
      realtimeGatePower.value.shift()
      realtimeGridPower.value.shift()
      realtimeChargeDischarge.value.shift()
    }
  }
})
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #02A7F0;
}

.detail-btn {
  display: flex;
  align-items: center;
  margin-right: 120px;
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

/* ===== 弹窗 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-container {
  width: 90vw;
  max-width: 1200px;
  max-height: 85vh;
  background: linear-gradient(180deg, #1a2a3e 0%, #132233 100%);
  border: 1px solid rgba(2, 167, 240, 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* 进入/离开动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(2, 167, 240, 0.15);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #02A7F0;
}

.modal-title-icon {
  width: 20px;
  height: 20px;
  color: #FAAD14;
}

.modal-close {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 4px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.modal-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.toolbar-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  color: #fff;
  outline: none;
  color-scheme: dark;
}

.date-input:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.date-sep {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 5px 14px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-icon {
  width: 13px;
  height: 13px;
}

.btn-primary {
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.85) 0%, rgba(2, 167, 240, 0.6) 100%);
  color: #fff;
  border: 1px solid rgba(2, 167, 240, 0.5);
}

.btn-primary:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.8) 100%);
  box-shadow: 0 0 10px rgba(2, 167, 240, 0.3);
}

.btn-default {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-default:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-success {
  background: linear-gradient(90deg, rgba(82, 196, 26, 0.8) 0%, rgba(82, 196, 26, 0.5) 100%);
  color: #fff;
  border: 1px solid rgba(82, 196, 26, 0.5);
}

.btn-success:hover {
  background: linear-gradient(90deg, rgba(82, 196, 26, 1) 0%, rgba(82, 196, 26, 0.7) 100%);
  box-shadow: 0 0 10px rgba(82, 196, 26, 0.3);
}

.modal-table-wrap {
  flex: 1;
  overflow: auto;
  padding: 0 20px;
}

.modal-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.modal-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.modal-table th {
  background: rgba(2, 167, 240, 0.12);
  color: #02A7F0;
  font-weight: 600;
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid rgba(2, 167, 240, 0.2);
  white-space: nowrap;
}

.modal-table td {
  padding: 9px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.modal-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.06);
}

.modal-table tbody tr.even {
  background: rgba(255, 255, 255, 0.02);
}

.type-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
}

.type-tag.charge {
  background: rgba(82, 196, 26, 0.18);
  color: #52C41A;
}

.type-tag.discharge {
  background: rgba(250, 173, 20, 0.18);
  color: #FAAD14;
}

.modal-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.page-total {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.page-size-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #fff;
  outline: none;
}

.page-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.15s;
  min-width: 30px;
}

.page-btn:hover:not(:disabled) {
  background: rgba(2, 167, 240, 0.15);
  border-color: rgba(2, 167, 240, 0.4);
  color: #02A7F0;
}

.page-btn.active {
  background: rgba(2, 167, 240, 0.25);
  border-color: rgba(2, 167, 240, 0.5);
  color: #02A7F0;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
