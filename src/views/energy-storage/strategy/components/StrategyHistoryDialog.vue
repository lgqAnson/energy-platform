<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click.self="close">
        <div class="history-modal">
          <!-- 头部 -->
          <div class="history-modal-header">
            <div class="history-modal-title">
              <History class="history-title-icon" />
              <span>历史策略执行明细</span>
            </div>
            <button class="history-modal-close" @click="close">
              <X class="history-close-icon" />
            </button>
          </div>

          <!-- 工具栏 -->
          <div class="history-modal-toolbar">
            <span class="toolbar-label">时间范围：</span>
            <input v-model="dateRange.start" type="date" class="toolbar-date-input" />
            <span class="toolbar-separator"> - </span>
            <input v-model="dateRange.end" type="date" class="toolbar-date-input" />
            <button class="toolbar-btn btn-query">
              <Search class="toolbar-btn-icon" />
              <span>查询</span>
            </button>
            <button class="toolbar-btn btn-reset">
              <RotateCcw class="toolbar-btn-icon" />
              <span>重置</span>
            </button>
            <button class="toolbar-btn btn-export" :disabled="exporting" @click="handleExport">
              <FileSpreadsheet class="toolbar-btn-icon" />
              <span>{{ exporting ? '导出中...' : '导出' }}</span>
            </button>
          </div>

          <!-- 表格区域 -->
          <div class="history-table-wrap">
            <table class="history-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>时间</th>
                  <th>计划放电量</th>
                  <th>实际放电量</th>
                  <th>偏差率</th>
                  <th>优化建议</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in historyData" :key="idx" :class="{ even: idx % 2 === 1 }">
                  <td>{{ row.date }}</td>
                  <td>{{ row.time }}</td>
                  <td>{{ row.plan }}</td>
                  <td>{{ row.actual }}</td>
                  <td>
                    <span class="deviation-text" :style="{ color: getDeviationColor(row.deviation) }">{{ row.deviation }}</span>
                  </td>
                  <td>{{ row.suggestion }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页栏 -->
          <div class="history-pagination">
            <div class="pagination-total">共3条</div>
            <div class="pagination-size">
              <select v-model="pageSize" class="page-size-select">
                <option :value="10">10条/页</option>
                <option :value="20">20条/页</option>
                <option :value="50">50条/页</option>
              </select>
            </div>
            <div class="pagination-pages">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
              <button class="page-btn" :class="{ active: currentPage === 1 }" @click="currentPage = 1">1</button>
              <button class="page-btn" :class="{ active: currentPage === 2 }" @click="currentPage = 2">2</button>
              <button class="page-btn" :disabled="currentPage === 2" @click="currentPage++">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X, History, Search, RotateCcw, FileSpreadsheet } from 'lucide-vue-next'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', value: boolean): void }>()

/** 关闭历史明细弹窗 */
function close() {
  emit('update:visible', false)
}

const dateRange = ref({ start: '2026-03-12', end: '2026-03-18' })
const pageSize = ref(10)
const currentPage = ref(1)
const exporting = ref(false)

const exportColumns: ExportColumn[] = [
  { header: '日期', key: 'date' },
  { header: '时间', key: 'time' },
  { header: '计划放电量', key: 'plan' },
  { header: '实际放电量', key: 'actual' },
  { header: '偏差率', key: 'deviation' },
  { header: '优化建议', key: 'suggestion' }
]

function handleExport() {
  if (exporting.value) return
  exporting.value = true
  exportToExcel(historyData, exportColumns, filenameWithDate('策略执行明细'))
  exporting.value = false
}

const historyData = [
  { date: '2026/3/26', time: '00:00 - 08:00', plan: '1,000 kWh', actual: '985 kWh', deviation: '-1.5%', suggestion: '放电时段可提前30分钟' },
  { date: '2026/3/26', time: '08:00 - 10:00', plan: '950 kWh', actual: '912 kWh', deviation: '-4.0%', suggestion: '需调整SOC下限设置' },
  { date: '2026/3/26', time: '10:00 - 11:00', plan: '1,100 kWh', actual: '1,089 kWh', deviation: '-1.0%', suggestion: '策略执行优秀' },
  { date: '2026/3/26', time: '11:00 - 12:00', plan: '800 kWh', actual: '752 kWh', deviation: '-6.0%', suggestion: '检查设备可用容量' },
  { date: '2026/3/26', time: '12:00 - 14:00', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
  { date: '2026/3/26', time: '14:00 - 19:00', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
  { date: '2026/3/26', time: '19:00 - 23:59', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
]

/**
 * 根据偏差率字符串返回对应的颜色值
 * 偏差 ≤ -4% → 红色(#ef4444)，否则 → 绿色(#52C41A)
 * @param val 偏差率字符串（如 "-1.5%"）
 * @returns 颜色值
 */
function getDeviationColor(val: string): string {
  const num = parseFloat(val)
  if (num <= -4) return '#ef4444'
  return '#52C41A'
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.history-modal {
  width: 80vw;
  max-width: 900px;
  max-height: 85vh;
  background: linear-gradient(180deg, #1a2a3e 0%, #132233 100%);
  border: 1px solid rgba(2, 167, 240, 0.25);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.history-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(2, 167, 240, 0.2);
  flex-shrink: 0;
}

.history-modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #02A7F0;
}

.history-title-icon {
  width: 18px;
  height: 18px;
  color: #02A7F0;
}

.history-modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s;
}

.history-modal-close:hover {
  color: #fff;
}

.history-close-icon {
  width: 18px;
  height: 18px;
}

.history-modal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(2, 167, 240, 0.15);
  flex-shrink: 0;
}

.toolbar-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

.toolbar-date-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 5px 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  outline: none;
}

.toolbar-date-input:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.toolbar-separator {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.toolbar-btn-icon {
  width: 13px;
  height: 13px;
}

.btn-query {
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.8) 0%, rgba(2, 167, 240, 0.5) 100%);
  color: #fff;
  border: 1px solid rgba(2, 167, 240, 0.5);
}

.btn-query:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.7) 100%);
  box-shadow: 0 0 8px rgba(2, 167, 240, 0.3);
}

.btn-reset {
  background: #fff;
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-reset:hover {
  background: #f0f0f0;
}

.btn-export {
  background: linear-gradient(90deg, rgba(82, 196, 26, 0.8) 0%, rgba(82, 196, 26, 0.5) 100%);
  color: #fff;
  border: 1px solid rgba(82, 196, 26, 0.5);
}

.btn-export:hover {
  background: linear-gradient(90deg, rgba(82, 196, 26, 1) 0%, rgba(82, 196, 26, 0.7) 100%);
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.3);
}

.history-table-wrap {
  flex: 1;
  overflow: auto;
  padding: 0 20px;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.history-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.history-table th {
  background: rgba(2, 167, 240, 0.12);
  color: #02A7F0;
  font-weight: 600;
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid rgba(2, 167, 240, 0.2);
  white-space: nowrap;
}

.history-table td {
  padding: 9px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.history-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.06);
}

.history-table tbody tr.even {
  background: rgba(255, 255, 255, 0.02);
}

.deviation-text {
  font-weight: 500;
}

.history-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid rgba(2, 167, 240, 0.15);
  flex-shrink: 0;
}

.pagination-total {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.pagination-size {
  display: flex;
  align-items: center;
}

.page-size-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 4px 8px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.page-size-select:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.page-size-select option {
  background: #1a2a3e;
  color: #fff;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(2, 167, 240, 0.15);
  border-color: rgba(2, 167, 240, 0.4);
  color: #02A7F0;
}

.page-btn.active {
  background: rgba(2, 167, 240, 0.2);
  border-color: rgba(2, 167, 240, 0.5);
  color: #02A7F0;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .history-modal,
.modal-leave-active .history-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .history-modal,
.modal-leave-to .history-modal {
  transform: scale(0.96);
}
</style>
