<template>
  <div class="meter-section">
    <div class="section-title-row">
      <FileText class="title-icon" :size="20" />
      <span class="section-title-text">计量电表数据</span>
    </div>
    <div class="section-toolbar">
      <div class="toolbar-left">
        <span class="toolbar-label">时间范围：</span>
        <div class="date-range">
          <input v-model="searchForm.startDate" type="date" class="date-input" />
          <span class="date-sep">-</span>
          <input v-model="searchForm.endDate" type="date" class="date-input" />
          <Calendar class="date-icon" :size="16" />
        </div>
      </div>
      <div class="toolbar-right">
        <button class="toolbar-btn primary" @click="onSearch">
          <Search :size="14" />
          <span>查询</span>
        </button>
        <button class="toolbar-btn" @click="onReset">
          <RotateCcw :size="14" />
          <span>重置</span>
        </button>
        <button class="toolbar-btn success" @click="onExport">
          <Download :size="14" />
          <span>导出</span>
        </button>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>储能柜名称</th>
            <th>正向有功电能(kWh)</th>
            <th>尖峰时段正向有功电能(kWh)</th>
            <th>高峰时段正向有功电能(kWh)</th>
            <th>平时段正向有功电能(kvarh)</th>
            <th>低谷时段正向有功电能(kWh)</th>
            <th>反向有功电能(kWh)</th>
            <th>尖峰时段反向有功电能(kWh)</th>
            <th>高峰时段反向有功电能(kWh)</th>
            <th>平时段反向有功电能(kWh)</th>
            <th>低谷时段反向有功电能(kWh)</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in tableData" :key="idx">
            <td>{{ row.name }}</td>
            <td>{{ row.forwardActive }}</td>
            <td>{{ row.forwardSharp }}</td>
            <td>{{ row.forwardPeak }}</td>
            <td>{{ row.forwardFlat }}</td>
            <td>{{ row.forwardValley }}</td>
            <td>{{ row.reverseActive }}</td>
            <td>{{ row.reverseSharp }}</td>
            <td>{{ row.reversePeak }}</td>
            <td>{{ row.reverseFlat }}</td>
            <td>{{ row.reverseValley }}</td>
            <td><a class="action-link" @click="viewMeterBase(row)">电表底数&gt;&gt;</a></td>
          </tr>
          <tr class="total-row">
            <td><strong>合计</strong></td>
            <td><strong>{{ totals.forwardActive }}</strong></td>
            <td><strong>{{ totals.forwardSharp }}</strong></td>
            <td><strong>{{ totals.forwardPeak }}</strong></td>
            <td><strong>{{ totals.forwardFlat }}</strong></td>
            <td><strong>{{ totals.forwardValley }}</strong></td>
            <td><strong>{{ totals.reverseActive }}</strong></td>
            <td><strong>{{ totals.reverseSharp }}</strong></td>
            <td><strong>{{ totals.reversePeak }}</strong></td>
            <td><strong>{{ totals.reverseFlat }}</strong></td>
            <td><strong>{{ totals.reverseValley }}</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-bar">
      <span class="page-total">共 {{ tableData.length }} 条</span>
      <select v-model="pageSize" class="page-size-select">
        <option :value="10">10条每页</option>
        <option :value="20">20条每页</option>
        <option :value="50">50条每页</option>
      </select>
      <div class="page-nav">
        <button class="page-arrow" :disabled="page === 1" @click="page--"><ChevronLeft :size="14" /></button>
        <button v-for="p in pageList" :key="p" class="page-num" :class="{ active: p === page }" @click="page = p">{{ p }}</button>
        <button class="page-arrow" :disabled="page === totalPages" @click="page++"><ChevronRight :size="14" /></button>
      </div>
    </div>
    <MeterBaseDialog v-model:visible="baseDialogVisible" :device-name="baseDialogDevice" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Calendar, Search, RotateCcw, Download, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import MeterBaseDialog from './MeterBaseDialog.vue'

const searchForm = ref({ startDate: '2025-03-12', endDate: '2025-03-18' })
function onSearch() { console.log('search', searchForm.value) }
function onReset() { searchForm.value = { startDate: '', endDate: '' } }
function onExport() { console.log('export') }

interface MeterRow {
  name: string
  forwardActive: string
  forwardSharp: string
  forwardPeak: string
  forwardFlat: string
  forwardValley: string
  reverseActive: string
  reverseSharp: string
  reversePeak: string
  reverseFlat: string
  reverseValley: string
}

const tableData = ref<MeterRow[]>([
  { name: 'G5', forwardActive: '9.6015625', forwardSharp: '9.6015625', forwardPeak: '170371.2', forwardFlat: '624', forwardValley: '9.6015625', reverseActive: '170371.2', reverseSharp: '624', reversePeak: '9.6015625', reverseFlat: '170371.2', reverseValley: '624' },
  { name: 'G8', forwardActive: '14.40625', forwardSharp: '14.40625', forwardPeak: '163495.19', forwardFlat: '468', forwardValley: '14.40625', reverseActive: '163495.19', reverseSharp: '468', reversePeak: '14.40625', reverseFlat: '163495.19', reverseValley: '468' },
  { name: 'G12', forwardActive: '11.9921875', forwardSharp: '11.9921875', forwardPeak: '140212.8', forwardFlat: '300', forwardValley: '11.9921875', reverseActive: '140212.8', reverseSharp: '300', reversePeak: '11.9921875', reverseFlat: '140212.8', reverseValley: '300' }
])

const totals = computed(() => {
  const s = (k: keyof MeterRow) => tableData.value.reduce((a, r) => a + parseFloat(r[k] as string || '0'), 0).toFixed(2)
  return {
    forwardActive: s('forwardActive'), forwardSharp: s('forwardSharp'), forwardPeak: s('forwardPeak'),
    forwardFlat: s('forwardFlat'), forwardValley: s('forwardValley'),
    reverseActive: s('reverseActive'), reverseSharp: s('reverseSharp'), reversePeak: s('reversePeak'),
    reverseFlat: s('reverseFlat'), reverseValley: s('reverseValley')
  }
})

const baseDialogVisible = ref(false)
const baseDialogDevice = ref('')

function viewMeterBase(row: MeterRow) {
  baseDialogDevice.value = row.name
  baseDialogVisible.value = true
}

const page = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.ceil(tableData.value.length / pageSize.value) || 1)
const pageList = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

// WebSocket 实时数据订阅（5s）
useRealtimeChannel('settlement', (payload) => {
  if (payload.meterReadings) {
    // 电表读数微小增长
    tableData.value.forEach((row) => {
      row.forwardActive = (parseFloat(row.forwardActive) + Math.random() * 0.01).toFixed(2)
      row.reverseActive = (parseFloat(row.reverseActive) + Math.random() * 0.01).toFixed(2)
    })
  }
})
</script>

<style scoped>
.meter-section {
  padding: 16px 20px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.08) 0%, rgba(85, 85, 85, 0.05) 100%);
  border: 1px solid rgba(129, 211, 248, 0.15);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.title-icon {
  color: #02A7F0;
}

.section-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #02A7F0;
}

/* 搜索栏 */
.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.date-input {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  outline: none;
  width: 120px;
}

.date-input:focus {
  border-color: #02A7F0;
}

.date-sep {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.date-icon {
  color: rgba(255, 255, 255, 0.3);
  position: absolute;
  right: 8px;
  pointer-events: none;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(2, 167, 240, 0.15);
}

.toolbar-btn.primary {
  background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%);
  color: #fff;
  border: none;
}

.toolbar-btn.primary:hover {
  opacity: 0.9;
}

.toolbar-btn.success {
  background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
  color: #fff;
  border: none;
}

.toolbar-btn.success:hover {
  opacity: 0.9;
}

/* 表格 */
.table-wrapper {
  overflow-x: auto;
  margin-bottom: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.data-table th {
  padding: 8px 6px;
  text-align: center;
  font-weight: 600;
  color: #02A7F0;
  background: rgba(2, 167, 240, 0.1);
  border: 1px solid rgba(129, 211, 248, 0.12);
  white-space: normal;
  line-height: 1.4;
  word-break: break-word;
  font-size: 12px;
}

.data-table td {
  padding: 10px 6px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(129, 211, 248, 0.06);
  font-size: 12px;
}

/* 操作列不换行 */
.data-table th:last-child,
.data-table td:last-child {
  white-space: nowrap;
  width: 90px;
  min-width: 90px;
}

.data-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.04);
}

.total-row {
  background: rgba(2, 167, 240, 0.06);
}

.total-row td {
  color: #fff;
  font-weight: 600;
}

.action-link {
  color: #02A7F0;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s;
}

.action-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* 分页 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}

.page-total {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.page-size-select {
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
}

.page-size-select option {
  background: #1a2a3e;
  color: #fff;
}

.page-nav {
  display: flex;
  gap: 4px;
}

.page-arrow, .page-num {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(129, 211, 248, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-arrow:hover:not(:disabled), .page-num:hover:not(.active) {
  background: rgba(2, 167, 240, 0.15);
  color: #02A7F0;
}

.page-num.active {
  background: #02A7F0;
  color: #fff;
  border-color: #02A7F0;
}

.page-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
