<template>
  <teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog-container">
        <!-- 标题栏 -->
        <div class="dialog-header">
          <div class="dialog-title-row">
            <Gauge class="title-icon" :size="20" />
            <h3 class="dialog-title">电表底数-{{ deviceName }}</h3>
          </div>
          <button class="dialog-close" @click="close">
            <X :size="20" />
          </button>
        </div>

        <!-- 搜索栏 -->
        <div class="dialog-toolbar">
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

        <!-- 表格 -->
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>数值</th>
                <th>正向尖峰时段(kWh)</th>
                <th>正向高峰时段(kWh)</th>
                <th>正向平时时段(kWh)</th>
                <th>正向低谷时段(kWh)</th>
                <th>反向尖峰时段(kWh)</th>
                <th>反向高峰时段(kWh)</th>
                <th>反向平时时段(kWh)</th>
                <th>反向低谷时段(kWh)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in tableData" :key="idx" :class="{ 'diff-row': row.isDiff }">
                <td class="row-label">{{ row.label }}</td>
                <td>{{ row.fSharp }}</td>
                <td>{{ row.fPeak }}</td>
                <td>{{ row.fFlat }}</td>
                <td>{{ row.fValley }}</td>
                <td>{{ row.rSharp }}</td>
                <td>{{ row.rPeak }}</td>
                <td>{{ row.rFlat }}</td>
                <td>{{ row.rValley }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 底部提示 -->
        <div class="dialog-footer">
          <p class="footer-hint">*电表底数值=电表底*倍率</p>
          <p class="footer-hint">*差值=电表底数值-计量电表值</p>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Gauge, X, Calendar, Search, RotateCcw, Download } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  deviceName: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

function close() {
  emit('update:visible', false)
}

watch(() => props.visible, (val) => {
  if (val) {
    searchForm.value = { startDate: '2026-03-12', endDate: '2026-03-18' }
  }
})

/* ---------- 搜索 ---------- */
const searchForm = ref({ startDate: '2026-03-12', endDate: '2026-03-18' })
function onSearch() { console.log('search', searchForm.value) }
function onReset() { searchForm.value = { startDate: '2026-03-12', endDate: '2026-03-18' } }
function onExport() { console.log('export') }

/* ---------- 表格数据 ---------- */
interface BaseRow {
  label: string
  isDiff?: boolean
  fSharp: string
  fPeak: string
  fFlat: string
  fValley: string
  rSharp: string
  rPeak: string
  rFlat: string
  rValley: string
}

const tableData = ref<BaseRow[]>([
  {
    label: '电表底数',
    fSharp: '2.3984375', fPeak: '2.3984375', fFlat: '2.3984375', fValley: '2.3984375',
    rSharp: '2.3984375', rPeak: '2.3984375', rFlat: '2.3984375', rValley: '2.3984375'
  },
  {
    label: '倍率',
    fSharp: '240', fPeak: '240', fFlat: '240', fValley: '240',
    rSharp: '240', rPeak: '240', rFlat: '240', rValley: '240'
  },
  {
    label: '电表底数值',
    fSharp: '2.3984375', fPeak: '2.4023438', fFlat: '2.4023438', fValley: '2.3984375',
    rSharp: '2.3984375', rPeak: '2.4023438', rFlat: '2.4023438', rValley: '2.3984375'
  },
  {
    label: '计量电表值',
    fSharp: '2.3984375', fPeak: '2.4023438', fFlat: '2.4023438', fValley: '2.3984375',
    rSharp: '2.3984375', rPeak: '2.4023438', rFlat: '2.4023438', rValley: '2.3984375'
  },
  {
    label: '差值',
    isDiff: true,
    fSharp: '0', fPeak: '0', fFlat: '0', fValley: '0',
    rSharp: '0', rPeak: '0', rFlat: '0', rValley: '0'
  }
])
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-container {
  width: 1100px;
  max-width: 95vw;
  max-height: 90vh;
  background: #0f1f35;
  border: 1px solid rgba(129, 211, 248, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(129, 211, 248, 0.12);
}

.dialog-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #02A7F0;
}

.dialog-title {
  font-size: 16px;
  font-weight: 700;
  color: #02A7F0;
}

.dialog-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}

.dialog-close:hover {
  color: #FF4D4D;
}

/* 搜索栏 */
.dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  gap: 12px;
  flex-wrap: wrap;
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
  padding: 0 20px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.data-table th {
  padding: 10px 6px;
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

.data-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.04);
}

.row-label {
  font-weight: 600;
  color: #fff;
}

.diff-row {
  background: rgba(2, 167, 240, 0.12) !important;
}

.diff-row .row-label {
  color: #02A7F0;
}

.diff-row td {
  color: #02A7F0;
  font-weight: 600;
}

/* 底部提示 */
.dialog-footer {
  padding: 12px 20px 16px;
}

.footer-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.6;
}
</style>
