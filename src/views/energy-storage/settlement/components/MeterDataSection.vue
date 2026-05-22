<template>
  <div class="meter-section">
    <div class="section-title-row">
      <!-- <FileText class="title-icon" :size="20" /> -->
      <img src="/icons/Subheading.png" class="detail-title-icon" />
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
        <button class="toolbar-btn success" :disabled="exporting" @click="onExport">
          <Download :size="14" />
          <span>{{ exporting ? '导出中...' : '导出' }}</span>
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
          <tr v-for="(row, idx) in tableData || []" :key="idx">
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
            <td><a class="action-link" @click="viewMeterBase(row)">电表底数</a></td>
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
      <span class="page-total">共 {{ tableData?.length ?? 0 }} 条</span>
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
import { serverExport, type ExportColumn } from '@/composables/useExport'
import { useApiData } from '@/composables/useApiData'
import { getMockMeterReadingList } from '@/mocks/providers/energyStorage'
import { energyStorageApi } from '@/api/api'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import MeterBaseDialog from './MeterBaseDialog.vue'

const searchForm = ref({ startDate: '2025-03-12', endDate: '2025-03-18' })
const exporting = ref(false)

function onSearch() { console.log('search', searchForm.value) }

function onReset() { searchForm.value = { startDate: '', endDate: '' } }

const meterColumns: ExportColumn[] = [
  { header: '储能柜名称', key: 'name' },
  { header: '正向有功电能', key: 'forwardActive' },
  { header: '正向尖峰时段', key: 'forwardSharp' },
  { header: '正向高峰时段', key: 'forwardPeak' },
  { header: '正向平时段', key: 'forwardFlat' },
  { header: '正向低谷时段', key: 'forwardValley' },
  { header: '反向有功电能', key: 'reverseActive' },
  { header: '反向尖峰时段', key: 'reverseSharp' },
  { header: '反向高峰时段', key: 'reversePeak' },
  { header: '反向平时段', key: 'reverseFlat' },
  { header: '反向低谷时段', key: 'reverseValley' }
]

async function onExport() {
  if (exporting.value) return
  exporting.value = true

  await serverExport({
    apiCall: (p) => energyStorageApi.exportSettlement(p),
    filename: '计量电表数据',
    columns: meterColumns,
    data: ((tableData.value ?? []) as unknown) as Record<string, unknown>[],
    sheetName: '计量电表',
    apiParams: {
      startDate: searchForm.value.startDate,
      endDate: searchForm.value.endDate
    }
  })

  exporting.value = false
}

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

const { data: tableData } = useApiData<MeterRow[]>(
  getMockMeterReadingList,
  () => energyStorageApi.getMeterReadingList().then(r => r.data as unknown as MeterRow[])
)

/** 汇总各电表列的数据（将字符串转为数字累加） */
const totals = computed(() => {
  if (!tableData.value || tableData.value.length === 0) {
    return {
      forwardActive: '0.00', forwardSharp: '0.00', forwardPeak: '0.00',
      forwardFlat: '0.00', forwardValley: '0.00',
      reverseActive: '0.00', reverseSharp: '0.00', reversePeak: '0.00',
      reverseFlat: '0.00', reverseValley: '0.00'
    }
  }
  const s = (k: keyof MeterRow) => (tableData.value ?? []).reduce((a, r) => a + parseFloat(r[k] as string || '0'), 0).toFixed(2)
  return {
    forwardActive: s('forwardActive'), forwardSharp: s('forwardSharp'), forwardPeak: s('forwardPeak'),
    forwardFlat: s('forwardFlat'), forwardValley: s('forwardValley'),
    reverseActive: s('reverseActive'), reverseSharp: s('reverseSharp'), reversePeak: s('reversePeak'),
    reverseFlat: s('reverseFlat'), reverseValley: s('reverseValley')
  }
})

const baseDialogVisible = ref(false)
const baseDialogDevice = ref('')

/**
 * 打开指定储能柜的电表底数弹窗
 * @param row 电表行数据
 */
function viewMeterBase(row: MeterRow) {
  baseDialogDevice.value = row.name
  baseDialogVisible.value = true
}

const page = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.ceil((tableData.value?.length ?? 0) / pageSize.value) || 1)
/** 生成分页页码数组 */
const pageList = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

// WebSocket 实时数据订阅（5s）
useRealtimeChannel('settlement', (payload: unknown) => {
  const p = payload as { meterReadings?: boolean }
  if (p.meterReadings && tableData.value) {
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
  position: relative;
}

.meter-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.meter-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid;
border-image: linear-gradient(90deg, rgba(0, 246, 255, 1), rgba(0, 246, 255, 0)) 1 1;
}

.title-icon {
  color: #02A7F0;
}

.section-title-text {
  font-size: 16px;
  font-weight: 500;
  color: #fff;
      font-style: italic;
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
  background: #1F5EFF;
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
 background: #30B0C7;
 color: #091E42;
  border: none;
}

.toolbar-btn.primary:hover {
  opacity: 0.9;
}

.toolbar-btn.success {
  background: #F7AE34;
 color: #091E42;
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

/* data-table 基础样式已提取至全局 src/assets/index.css，此处仅保留组件特有覆盖 */
.data-table {
  table-layout: auto;
}

/** 表头文字过长时自动换行 */
.data-table th {
  white-space: normal;
  word-break: break-word;
  vertical-align: middle;
}

/* 操作列不换行 */
.data-table th:last-child,
.data-table td:last-child {
  white-space: nowrap;
  width: 90px;
  min-width: 90px;
}

.total-row {
  background: rgba(2, 167, 240, 0.06);
}

.total-row td {
color: #fff;
  font-weight: 600;
}

.action-link {
  color: #4479FF;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 4px;
  transition: opacity 0.2s;
  
}

.action-link:hover {
  opacity: 0.8;
  text-decoration: underline;
  text-underline-offset: 4px;
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
.detail-title-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
</style>
