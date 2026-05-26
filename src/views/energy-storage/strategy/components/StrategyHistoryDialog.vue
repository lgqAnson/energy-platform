<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay">
        <div class="history-modal">
          <!-- 头部 -->
          <div class="modal-header">
            <div class="modal-title">
              <span class="title-bar-icon"></span>
              <span>历史策略执行明细</span>
            </div>
            <button class="modal-close" @click="close">
              <img src="/icons/close.png" alt="关闭" class="modal-close-icon" />
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
            <table class="data-table">
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
                <tr v-for="(row, idx) in historyData" :key="idx">
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
import { Search, RotateCcw, FileSpreadsheet } from 'lucide-vue-next'
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
/* ==================== Modal Base（与 StrategyManageDialog 一致） ==================== */
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

.history-modal {
  width: 800px;
  /* max-width: 1200px; */
  max-height: 88vh;
  padding: 16px;
  background: rgba(21, 20, 20, 0.4);
  border: 1px solid rgba(2, 167, 240, 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* ==================== Header（标题栏，与 StrategyManageDialog 一致） ==================== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  flex-shrink: 0;
  background-image: url('/images/popUpsTitleBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  font-style: italic;
}

.title-bar-icon {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #FAAD14 0%, #F59E0B 100%);
  border-radius: 1px;
  flex-shrink: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.modal-close:hover {
  opacity: 0.7;
}

.modal-close-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
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

/* data-table 基础样式已提取至全局 src/assets/index.css */

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

/* Transition（与 StrategyManageDialog 一致） */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
