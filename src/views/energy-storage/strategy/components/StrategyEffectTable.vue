<template>
  <div class="panel strategy-table-panel">
    <!-- 面板标题栏（看板统一风格） -->
    <div class="panel-header-bar">
      <img src="/public/images/title@2x.png" class="header-bg" alt="" />
      <span class="header-title">策略效果对比</span>
    </div>

    <!-- 操作按钮栏（左导出 / 右历史） -->
    <div class="table-action-bar">
      <button class="action-btn btn-export" @click="handleExport()">
        导出数据
      </button>
      <button class="action-btn btn-history" @click="historyVisible = true">
        历史记录
      </button>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>时段</th>
            <th>计划充电量</th>
            <th>实际充电量</th>
            <th>计划放电量</th>
            <th>实际放电量</th>
            <th>偏差率</th>
            <th>优化建议</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in data" :key="idx" :class="{ even: idx % 2 === 1 }">
            <td class="cell-time">{{ row.time }}</td>
            <td>{{ row.planCharge }}</td>
            <td>{{ row.actualCharge }}</td>
            <td>{{ row.planDischarge }}</td>
            <td>{{ row.actualDischarge }}</td>
            <td>
              <span class="deviation-badge" :class="getDeviationClass(row.deviation)">
                {{ row.deviation }}
              </span>
            </td>
            <td class="cell-suggestion">{{ row.suggestion }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <StrategyHistoryDialog v-model:visible="historyVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'
import StrategyHistoryDialog from './StrategyHistoryDialog.vue'

/**
 * 策略效果表格行数据接口（7 列完整字段）
 */
export interface EffectRow {
  [key: string]: string
  /** 时段，如 "00:00 ~ 06:00" */
  time: string
  /** 计划充电量，如 "1,000 kWh" */
  planCharge: string
  /** 实际充电量，如 "1,000 kWh" */
  actualCharge: string
  /** 计划放电量，如 "1,000 kWh" */
  planDischarge: string
  /** 实际放电量，如 "985 kWh" */
  actualDischarge: string
  /** 偏差率百分比，如 "-11.5%" */
  deviation: string
  /** 优化建议文字 */
  suggestion: string
}

const props = defineProps<{ data: EffectRow[] }>()

/** 历史弹窗可见状态 */
const historyVisible = ref(false)
/** 是否正在导出 */
const exporting = ref(false)

/** Excel 导出的列配置 */
const exportColumns: ExportColumn[] = [
  { header: '时段', key: 'time' },
  { header: '计划充电量', key: 'planCharge' },
  { header: '实际充电量', key: 'actualCharge' },
  { header: '计划放电量', key: 'planDischarge' },
  { header: '实际放电量', key: 'actualDischarge' },
  { header: '偏差率', key: 'deviation' },
  { header: '优化建议', key: 'suggestion' }
]

/**
 * 处理数据导出为 Excel 文件
 */
function handleExport() {
  if (exporting.value) return
  exporting.value = true
  exportToExcel(props.data, exportColumns, filenameWithDate('策略效果对比'))
  setTimeout(() => { exporting.value = false }, 800)
}

/**
 * 根据偏差率数值返回对应的 CSS 类名（三级颜色逻辑）
 * - 负值偏差 → red（如 -11.5%）
 * - 正值小幅偏差 (0~5%) → orange（如 -4.0%、-2.0%）
 * - 正常小偏差 → green（如 -1.5%）
 * @param val 偏差率字符串（如 "-11.5%"）
 * @returns CSS 类名（'danger' | 'warning' | 'success'）
 */
function getDeviationClass(val: string): string {
  const num = parseFloat(val)
  if (num <= -6) return 'danger'
  if (num <= -2) return 'warning'
  return 'success'
}
</script>

<style scoped>
/* ====== 面板容器（看板统一风格） ====== */
.panel {
  background: linear-gradient(180deg, rgba(22, 43, 131, 0) 0%, rgba(22, 43, 131, 0.15) 100%);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.panel::after {
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

.panel::before {
  content: '';
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.strategy-table-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: 4px;
}

/* ====== 标题栏（与看板统一） ====== */
.panel-header-bar {
  position: relative;
  height: 49px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 560px;
  object-fit: fill;
}

.header-title {
  position: relative;
  z-index: 10;
  font-size: 24px;
  font-style: italic;
  padding-left: 28px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #D5F2FF;
  line-height: 23px;
}

/* ====== 操作按钮栏（左导出 / 右历史） ====== */
.table-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 8px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.action-btn {
  padding: 5px 18px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.22s ease;
  white-space: nowrap;
  border: none;
  color: #fff;
}

.btn-export {
  background: #F5A623;
}

.btn-export:hover {
  background: #FFB930;
  box-shadow: 0 2px 10px rgba(245, 166, 35, 0.38);
}

.btn-history {
  background: #02A7F0;
}

.btn-history:hover {
  background: #3BB8FA;
  box-shadow: 0 2px 10px rgba(2, 167, 240, 0.38);
}

/* ====== 表格区域 ====== */
.table-wrapper {
  flex: 1;
  overflow: auto;
  min-height: 0;
  position: relative;
  z-index: 1;
  padding: 0 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.data-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.data-table th {
  background: rgba(2, 167, 240, 0.10);
  color: #02A7F0;
  font-weight: 600;
  padding: 9px 8px;
  text-align: center;
  border-bottom: 1px solid rgba(2, 167, 240, 0.18);
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.data-table td {
  padding: 8px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.05);
}

.data-table tbody tr.even {
  background: rgba(255, 255, 255, 0.015);
}

.cell-time {
  color: #D5F2FF;
  font-weight: 500;
}

.cell-suggestion {
  text-align: left !important;
  padding-left: 12px !important;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====== 偏差率徽章（三级颜色） ====== */
.deviation-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 500;
  font-size: 11px;
}

.deviation-badge.success {
  color: #52C41A;
  background: rgba(82, 196, 26, 0.08);
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.deviation-badge.warning {
  color: #FAAD14;
  background: rgba(250, 173, 20, 0.08);
  border: 1px solid rgba(250, 173, 20, 0.2);
}

.deviation-badge.danger {
  color: #FF4D4F;
  background: rgba(255, 77, 79, 0.08);
  border: 1px solid rgba(255, 77, 79, 0.2);
}
</style>
