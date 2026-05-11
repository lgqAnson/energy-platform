<template>
  <teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog-container">
        <div class="dialog-header">
          <h3 class="dialog-title">历史电价</h3>
          <button class="dialog-close" @click="close">
            <X :size="20" />
          </button>
        </div>
        <div class="dialog-toolbar">
          <div class="toolbar-item">
            <span class="toolbar-label">时间范围</span>
            <input v-model="searchForm.startDate" type="date" class="toolbar-input" />
            <span class="toolbar-sep">至</span>
            <input v-model="searchForm.endDate" type="date" class="toolbar-input" />
          </div>
          <div class="toolbar-actions">
            <button class="toolbar-btn primary" @click="onSearch">
              <Search :size="14" />
              <span>查询</span>
            </button>
            <button class="toolbar-btn" @click="onReset">
              <RotateCcw :size="14" />
              <span>重置</span>
            </button>
            <button class="toolbar-btn" :disabled="exporting" @click="onExport">
              <Download :size="14" />
              <span>{{ exporting ? '导出中...' : '导出' }}</span>
            </button>
          </div>
        </div>
        <div class="dialog-table-wrapper">
          <table class="dialog-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>尖时段电价</th>
                <th>峰时段电价</th>
                <th>平时段电价</th>
                <th>谷时段电价</th>
                <th>更新时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in paginatedData" :key="idx">
                <td>{{ row.date }}</td>
                <td>{{ row.sharp }}</td>
                <td>{{ row.peak }}</td>
                <td>{{ row.flat }}</td>
                <td>{{ row.valley }}</td>
                <td>{{ row.updateTime }}</td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="6" class="empty-cell">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="dialog-pagination">
          <span class="page-info">共 {{ historyData.length }} 条</span>
          <div class="page-btns">
            <button class="page-btn" :disabled="page === 1" @click="page--">上一页</button>
            <button v-for="p in pageList" :key="p" class="page-btn" :class="{ active: p === page }" @click="page = p">{{ p }}</button>
            <button class="page-btn" :disabled="page === totalPages" @click="page++">下一页</button>
          </div>
          <select v-model="pageSize" class="page-size-select">
            <option :value="10">10条每页</option>
            <option :value="20">20条每页</option>
            <option :value="50">50条每页</option>
          </select>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Search, RotateCcw, Download } from 'lucide-vue-next'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', val: boolean): void }>()

/** 关闭弹窗 */
function close() { emit('update:visible', false) }

const searchForm = ref({ startDate: '2025-01-01', endDate: '2025-03-31' })
/** 执行查询并将分页重置到第一页 */
function onSearch() { page.value = 1 }
/** 重置搜索时间范围并回到第一页 */
function onReset() { searchForm.value = { startDate: '2025-01-01', endDate: '2025-03-31' }; page.value = 1 }
/** 导出历史电价数据 */
function onExport() {
  if (exporting.value) return
  exporting.value = true
  const columns: ExportColumn[] = [
    { header: '日期', key: 'date' },
    { header: '尖时段电价', key: 'sharp' },
    { header: '峰时段电价', key: 'peak' },
    { header: '平时段电价', key: 'flat' },
    { header: '谷时段电价', key: 'valley' },
    { header: '更新时间', key: 'updateTime' }
  ]
  exportToExcel(historyData.value, columns, filenameWithDate('历史电价'))
  exporting.value = false
}

interface HistoryRow { [key: string]: string; date: string; sharp: string; peak: string; flat: string; valley: string; updateTime: string }
const historyData = ref<HistoryRow[]>([
  { date: '2025-03-01', sharp: '1.43', peak: '1.15', flat: '0.68', valley: '0.27', updateTime: '2025-03-01 00:00' },
  { date: '2025-02-01', sharp: '1.43', peak: '1.15', flat: '0.68', valley: '0.27', updateTime: '2025-02-01 00:00' },
  { date: '2025-01-01', sharp: '1.38', peak: '1.10', flat: '0.65', valley: '0.25', updateTime: '2025-01-01 00:00' },
  { date: '2024-12-01', sharp: '1.38', peak: '1.10', flat: '0.65', valley: '0.25', updateTime: '2024-12-01 00:00' },
  { date: '2024-11-01', sharp: '1.38', peak: '1.10', flat: '0.65', valley: '0.25', updateTime: '2024-11-01 00:00' },
  { date: '2024-10-01', sharp: '1.35', peak: '1.08', flat: '0.63', valley: '0.24', updateTime: '2024-10-01 00:00' },
  { date: '2024-09-01', sharp: '1.35', peak: '1.08', flat: '0.63', valley: '0.24', updateTime: '2024-09-01 00:00' },
  { date: '2024-08-01', sharp: '1.35', peak: '1.08', flat: '0.63', valley: '0.24', updateTime: '2024-08-01 00:00' },
  { date: '2024-07-01', sharp: '1.40', peak: '1.12', flat: '0.66', valley: '0.26', updateTime: '2024-07-01 00:00' },
  { date: '2024-06-01', sharp: '1.40', peak: '1.12', flat: '0.66', valley: '0.26', updateTime: '2024-06-01 00:00' },
  { date: '2024-05-01', sharp: '1.40', peak: '1.12', flat: '0.66', valley: '0.26', updateTime: '2024-05-01 00:00' },
  { date: '2024-04-01', sharp: '1.37', peak: '1.09', flat: '0.64', valley: '0.25', updateTime: '2024-04-01 00:00' }
])

const page = ref(1)
const pageSize = ref(10)
const exporting = ref(false)
const totalPages = computed(() => Math.ceil(historyData.value.length / pageSize.value) || 1)
/** 当前分页对应的历史数据切片 */
const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return historyData.value.slice(start, start + pageSize.value)
})
/** 生成可见的分页页码数组 */
const pageList = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})

/** 弹窗打开时自动重置分页到第一页 */
watch(() => props.visible, (val) => { if (val) page.value = 1 })
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
  width: 95vw;
  max-width: 900px;
  max-height: 85vh;
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

.dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.toolbar-input {
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.toolbar-input:focus {
  border-color: #02A7F0;
}

.toolbar-sep {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  background: rgba(2, 167, 240, 0.15);
  color: #02A7F0;
}

.toolbar-btn.primary {
  background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%);
  color: #fff;
  border: none;
}

.toolbar-btn.primary:hover {
  opacity: 0.9;
}

.dialog-table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

.dialog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.dialog-table th {
  text-align: left;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  background: rgba(2, 167, 240, 0.08);
  border-bottom: 1px solid rgba(129, 211, 248, 0.12);
  white-space: nowrap;
}

.dialog-table td {
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(129, 211, 248, 0.06);
}

.dialog-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.05);
}

.empty-cell {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 40px 0;
}

.dialog-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid rgba(129, 211, 248, 0.12);
}

.page-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.page-btns {
  display: flex;
  gap: 4px;
}

.page-btn {
  padding: 5px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(129, 211, 248, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(2, 167, 240, 0.15);
  color: #02A7F0;
}

.page-btn.active {
  background: #02A7F0;
  color: #fff;
  border-color: #02A7F0;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
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
</style>
