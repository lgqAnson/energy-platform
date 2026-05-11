<template>
  <div class="strategy-table-panel">
    <div class="table-panel-header">
      <div class="table-panel-title">
        <Target class="table-title-icon" />
        <span>策略效果对比</span>
      </div>
      <div class="table-panel-actions">
        <button class="action-btn btn-export" :disabled="exporting" @click="handleExport">
          <FileSpreadsheet class="action-btn-icon" />
          <span>{{ exporting ? '导出中...' : '导出数据' }}</span>
        </button>
        <button class="action-btn btn-history" @click="historyVisible = true">
          <History class="action-btn-icon" />
          <span>历史明细</span>
        </button>
      </div>
    </div>
    <div class="strategy-table-wrap">
      <table class="strategy-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>计划放电量</th>
            <th>实际放电量</th>
            <th>偏差率</th>
            <th>优化建议</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in data" :key="idx" :class="{ even: idx % 2 === 1 }">
            <td>{{ row.time }}</td>
            <td>{{ row.plan }}</td>
            <td>{{ row.actual }}</td>
            <td>
              <span class="deviation-tag" :class="getDeviationClass(row.deviation)">{{ row.deviation }}</span>
            </td>
            <td>{{ row.suggestion }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <StrategyHistoryDialog v-model:visible="historyVisible" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Target, FileSpreadsheet, History } from 'lucide-vue-next'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'
import StrategyHistoryDialog from './StrategyHistoryDialog.vue'

export interface EffectRow {
  [key: string]: string
  time: string
  plan: string
  actual: string
  deviation: string
  suggestion: string
}

const props = defineProps<{ data: EffectRow[] }>()

const historyVisible = ref(false)
const exporting = ref(false)

const exportColumns: ExportColumn[] = [
  { header: '时间', key: 'time' },
  { header: '计划放电量', key: 'plan' },
  { header: '实际放电量', key: 'actual' },
  { header: '偏差率', key: 'deviation' },
  { header: '优化建议', key: 'suggestion' }
]

function handleExport() {
  if (exporting.value) return
  exporting.value = true
  exportToExcel(props.data, exportColumns, filenameWithDate('策略效果对比'))
  exporting.value = false
}

/**
 * 根据偏差率字符串返回对应的 CSS 类名
 * 偏差 ≤ -4% → warning，否则 → normal
 * @param val 偏差率字符串（如 "-1.5%"）
 * @returns CSS 类名（'warning' | 'normal'）
 */
function getDeviationClass(val: string): string {
  const num = parseFloat(val)
  if (num <= -4) return 'warning'
  return 'normal'
}
</script>

<style scoped>
.strategy-table-panel {
  flex: 1;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.table-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.table-panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #02A7F0;
}

.table-title-icon {
  width: 18px;
  height: 18px;
  color: #FAAD14;
}

.table-panel-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 11px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.action-btn-icon {
  width: 13px;
  height: 13px;
}

.btn-export {
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.8) 0%, rgba(2, 167, 240, 0.5) 100%);
  color: #fff;
  border: 1px solid rgba(2, 167, 240, 0.5);
}

.btn-export:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.7) 100%);
  box-shadow: 0 0 8px rgba(2, 167, 240, 0.3);
}

.btn-history {
  background: linear-gradient(90deg, rgba(82, 196, 26, 0.8) 0%, rgba(82, 196, 26, 0.5) 100%);
  color: #fff;
  border: 1px solid rgba(82, 196, 26, 0.5);
}

.btn-history:hover {
  background: linear-gradient(90deg, rgba(82, 196, 26, 1) 0%, rgba(82, 196, 26, 0.7) 100%);
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.3);
}

.strategy-table-wrap {
  flex: 1;
  overflow: auto;
}

.strategy-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.strategy-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.strategy-table th {
  background: rgba(2, 167, 240, 0.12);
  color: #02A7F0;
  font-weight: 600;
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid rgba(2, 167, 240, 0.2);
  white-space: nowrap;
}

.strategy-table td {
  padding: 9px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.strategy-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.06);
}

.strategy-table tbody tr.even {
  background: rgba(255, 255, 255, 0.02);
}

.deviation-tag {
  font-weight: 500;
}

.deviation-tag.normal {
  color: #52C41A;
}

.deviation-tag.warning {
  color: #FAAD14;
}
</style>
