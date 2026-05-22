<template>
  <teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="dialog-container">
        <div class="modal-header">
          <div class="modal-title">
            <span class="title-bar-icon"></span>
            <span>历史电价记录</span>
          </div>
          <button class="modal-close" @click="close">
            <img src="/icons/close.png" alt="关闭" class="modal-close-icon" />
          </button>
        </div>

        <!-- 工具栏 -->
        <div class="dialog-toolbar">
          <div class="toolbar-left">
            <div class="toolbar-item">
              <span class="toolbar-label">时间范围</span>
              <el-date-picker
                v-model="dateRangeValue"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY/M/D"
                :clearable="false"
                class="history-date-range"
              />
            </div>
            <div class="toolbar-item">
              <span class="toolbar-label">时间范围</span>
              <select v-model="searchForm.periodType" class="toolbar-select">
                <option value="">全部时间</option>
                <option value="sharp">尖</option>
                <option value="peak">峰</option>
                <option value="flat">平</option>
                <option value="valley">谷</option>
              </select>
            </div>
          </div>
          <div class="toolbar-actions">
            <button class="toolbar-btn query-btn" @click="onSearch">查询</button>
            <button class="toolbar-btn reset-btn" @click="onReset">重置</button>
            <button class="toolbar-btn export-btn" :disabled="exporting" @click="onExport">{{ exporting ? '导出中...' : '导出' }}</button>
          </div>
        </div>

        <!-- 表格 -->
        <div class="dialog-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-month">月份</th>
                <th class="col-period">时段</th>
                <th class="col-price">充电单价(元/KWh)</th>
                <th class="col-price">放电单价（元/KWh）</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(group, gIdx) in groupedData" :key="group.month">
                <tr v-for="(row, rIdx) in group.rows" :key="`${gIdx}-${rIdx}`">
                  <!-- 月份单元格，仅首行显示并合并 -->
                  <td v-if="rIdx === 0" :rowspan="group.rows.length" class="cell-month">{{ group.month }}</td>
                  <td class="cell-period">
                    <span :class="['period-badge', `period-${row.period}`]">{{ getPeriodLabel(row.period) }}</span>
                  </td>
                  <td class="cell-price">{{ row.chargePrice }}</td>
                  <td class="cell-price">{{ row.dischargePrice }}</td>
                </tr>
              </template>
              <tr v-if="groupedData.length === 0 || totalRecords === 0">
                <td colspan="4" class="empty-cell">暂无数据</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="dialog-pagination">
          <span class="page-info">共{{ totalRecords }}条记录</span>
          <div class="page-center">
            <button class="page-btn" :disabled="page === 1" @click="page--">&lt;</button>
            <button v-for="p in displayPages" :key="p" class="page-btn" :class="{ active: p === page, ellipsis: p === -1 }" :disabled="p === -1" @click="p !== -1 && (page = p)">{{ p === -1 ? '...' : p }}</button>
            <button class="page-btn" :disabled="page === totalPages" @click="page++">&gt;</button>
          </div>
          <div class="page-right">
            <select v-model="pageSize" class="page-size-select">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
            <span class="jump-label">跳至</span>
            <input v-model.number="jumpPage" type="text" class="jump-input" @keyup.enter="goToPage" />
            <span class="jump-label">页</span>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ (e: 'update:visible', val: boolean): void }>()

/** 关闭弹窗 */
function close() { emit('update:visible', false) }

/** 时段类型 */
type PeriodType = 'sharp' | 'peak' | 'flat' | 'valley'

/** 时段中文标签映射 */
function getPeriodLabel(type: PeriodType): string {
  const map: Record<PeriodType, string> = { sharp: '尖', peak: '峰', flat: '平', valley: '谷' }
  return map[type] || type
}

/** 原始历史电价行数据 */
interface HistoryRow {
  month: string
  period: PeriodType
  chargePrice: string
  dischargePrice: string
}

/** el-date-picker 绑定值（daterange 模式为 [start, end] 数组） */
const dateRangeValue = ref<string[]>(['2026/3/12', '2026/3/18'])

/** 搜索表单（dateRange 由 dateRangeValue 计算派生） */
const searchForm = ref({ periodType: '' })

/** 日期范围显示文本（YYYY/M/D-YYYY/M/D） */
const dateRangeText = computed(() => {
  if (dateRangeValue.value?.length === 2) {
    return `${dateRangeValue.value[0]}-${dateRangeValue.value[1]}`
  }
  return ''
})

/** 模拟历史电价数据（按月份分组，每月份含尖峰平谷四条记录） */
const historyData = ref<HistoryRow[]>([
  // 2026/3
  { month: '2026/3', period: 'sharp', chargePrice: '1.15', dischargePrice: '1.15' },
  { month: '2026/3', period: 'peak', chargePrice: '1.15', dischargePrice: '1.15' },
  { month: '2026/3', period: 'flat', chargePrice: '1.15', dischargePrice: '1.15' },
  { month: '2026/3', period: 'valley', chargePrice: '1.15', dischargePrice: '1.15' },
  // 2026/4
  { month: '2026/4', period: 'sharp', chargePrice: '1.15', dischargePrice: '1.15' },
  { month: '2026/4', period: 'peak', chargePrice: '1.15', dischargePrice: '1.15' },
  { month: '2026/4', period: 'flat', chargePrice: '1.15', dischargePrice: '1.15' },
  { month: '2026/4', period: 'valley', chargePrice: '1.15', dischargePrice: '1.15' },
  // 2026/5
  { month: '2026/5', period: 'sharp', chargePrice: '1.20', dischargePrice: '1.10' },
  { month: '2026/5', period: 'peak', chargePrice: '1.18', dischargePrice: '1.08' },
  { month: '2026/5', period: 'flat', chargePrice: '0.70', dischargePrice: '0.65' },
  { month: '2026/5', period: 'valley', chargePrice: '0.28', dischargePrice: '0.25' },
  // 2026/2
  { month: '2026/2', period: 'sharp', chargePrice: '1.12', dischargePrice: '1.10' },
  { month: '2026/2', period: 'peak', chargePrice: '1.10', dischargePrice: '1.08' },
  { month: '2026/2', period: 'flat', chargePrice: '0.68', dischargePrice: '0.64' },
  { month: '2026/2', period: 'valley', chargePrice: '0.26', dischargePrice: '0.24' },
])

// ===== 分页逻辑 =====
const page = ref(1)
const pageSize = ref(10)
const exporting = ref(false)
const jumpPage = ref<number | null>(null)

/** 总记录数 */
const totalRecords = computed(() => historyData.value.length)

/** 总页数 */
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value) || 1)

/** 当前分页切片后的数据（仍保持分组结构） */
const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const slice = historyData.value.slice(start, start + pageSize.value)
  return groupByMonth(slice)
})

/** 将行数据按月份分组，用于表格渲染合并单元格 */
function groupByMonth(rows: HistoryRow[]): GroupedMonth[] {
  const map = new Map<string, HistoryRow[]>()
  for (const row of rows) {
    const existing = map.get(row.month) || []
    existing.push(row)
    map.set(row.month, existing)
  }
  return Array.from(map.entries()).map(([month, rows]) => ({ month, rows }))
}

/** 月份分组类型 */
interface GroupedMonth { month: string; rows: HistoryRow[] }

/** 全量分组（用于导出等场景） */
const groupedData = computed(() => groupByMonth(historyData.value))

/** 执行查询并将分页重置到第一页 */
function onSearch() { page.value = 1 }
/** 重置搜索表单并回到第一页 */
function onReset() { searchForm.value = { periodType: '' }; dateRangeValue.value = []; page.value = 1 }
/** 导出历史电价数据 */
function onExport() {
  if (exporting.value) return
  exporting.value = true
  const columns: ExportColumn[] = [
    { header: '月份', key: 'month' },
    { header: '时段', key: 'period' },
    { header: '充电单价(元/KWh)', key: 'chargePrice' },
    { header: '放电单价(元/KWh)', key: 'dischargePrice' }
  ]
  exportToExcel(
    historyData.value.map(r => ({ ...r, period: getPeriodLabel(r.period) })),
    columns,
    filenameWithDate('历史电价')
  )
  exporting.value = false
}

/** 跳转到指定页 */
function goToPage() {
  if (jumpPage.value && jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    page.value = jumpPage.value
    jumpPage.value = null
  }
}

/** 生成分页显示页码（带省略号） */
const displayPages = computed(() => {
  const total = totalPages.value
  const current = page.value
  const pages: number[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (current > 3) pages.push(-1)

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push(-1)
  pages.push(total)
  return pages
})

/** 弹窗打开时自动重置分页到第一页 */
watch(() => props.visible, (val) => { if (val) page.value = 1 })
</script>

<style scoped>
/* ===== 弹窗基础样式（与 StrategyManageDialog 一致） ===== */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog-container {
  width: 95vw;
  max-width: 1000px;
  max-height: 88vh;
  background: rgba(21, 20, 20, 0.4);
  border: 1px solid rgba(2, 167, 240, 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

/* ===== 标题栏（与 StrategyManageDialog 一致） ===== */
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
  transition: all 0.2s;
}

.modal-close:hover { opacity: 0.7; }

.modal-close-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* ===== 工具栏（按图示还原） ===== */
.dialog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(129, 211, 248, 0.08);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

/* ===== el-date-picker 深色主题适配 ===== */
.history-date-range {
  --el-input-bg-color: transparent;
  --el-input-border-color: rgba(129, 211, 248, 0.35);
  --el-input-text-color: #fff;
  --el-input-hover-border-color: rgba(2, 167, 240, 0.6);
  --el-input-focus-border-color: #02A7F0;
}

/* 覆盖 el-date-picker 内部输入框样式 */
.history-date-range :deep(.el-input__wrapper) {
  background: transparent !important;
  box-shadow: 0 1px 0 0 rgba(129, 211, 248, 0.35) !important;
  border-radius: 0;
  padding: 4px 12px;
}

.history-date-range :deep(.el-input__wrapper:hover) {
  box-shadow: 0 1px 0 0 rgba(2, 167, 240, 0.6) !important;
}

.history-date-range :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 1px 0 0 #02A7F0 !important;
}

.history-date-range :deep(.el-input__inner) {
  color: #fff !important;
  font-size: 13px;
}

.history-date-range :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.3);
}

.history-date-range :deep(.el-range-separator) {
  color: rgba(255, 255, 255, 0.55) !important;
}

.toolbar-select {
  padding: 5px 10px;
  padding-right: 24px;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(129, 211, 248, 0.35);
  color: #fff;
  font-size: 13px;
  outline: none;
  cursor: pointer;
  appearance: auto;
}

.toolbar-select option {
  background: #1a2332;
  color: #fff;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.toolbar-btn {
  padding: 6px 18px;
  border-radius: 4px;
  border: none;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 1px;
}

.query-btn {
  background: linear-gradient(135deg, #00D9C5 0%, #00B8A0 100%);
}
.query-btn:hover { opacity: 0.85; }

.reset-btn {
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%);
}
.reset-btn:hover { opacity: 0.85; }

.export-btn {
  background: linear-gradient(135deg, #FAAD14 0%, #E89C0A 100%);
}
.export-btn:hover { opacity: 0.85; }
.export-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ===== 表格区域 ===== */
.dialog-table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  margin: 0 16px;
}

/* data-table 基础样式已提取至全局 src/assets/index.css，此处仅保留弹窗特有覆盖 */
.dialog-table-wrapper { /* keep */ }

.data-table {
  table-layout: fixed;
  font-size: 13px;
}

/* 表头 - 左对齐 + 深色背景 */
.data-table thead th {
  text-align: left;
  padding: 11px 12px;
  font-weight: 500;
  background: rgba(30, 42, 56, 0.9);
  border: 1px solid rgba(129, 211, 248, 0.12);
}

.col-month { width: 120px; }
.col-period { width: 80px; }
.col-price { width: 1fr; }

/* 表体单元格 */
.data-table td {
  padding: 10px 12px;
  vertical-align: middle;
}

/* 月份列 - 居中 */
.cell-month {
  text-align: center;
  color: rgba(255, 255, 255, 0.75);
}

/* 时段标签 */
.cell-period {
  text-align: center;
}

.period-badge {
  display: inline-block;
  min-width: 26px;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  text-align: center;
  line-height: 1.6;
}

/* 尖 - 红色 */
.period-sharp {
  color: #FF4D4F;
  background: rgba(255, 77, 79, 0.12);
  border: 1px solid rgba(255, 77, 79, 0.3);
}

/* 峰 - 橙色 */
.period-peak {
  color: #FAAD14;
  background: rgba(250, 173, 20, 0.12);
  border: 1px solid rgba(250, 173, 20, 0.3);
}

/* 平 - 青色 */
.period-flat {
  color: #00D9C5;
  background: rgba(0, 217, 197, 0.12);
  border: 1px solid rgba(0, 217, 197, 0.3);
}

/* 谷 - 深绿 */
.period-valley {
  color: #52C41A;
  background: rgba(82, 196, 26, 0.12);
  border: 1px solid rgba(82, 196, 26, 0.3);
}

/* 价格单元格 */
.cell-price {
  text-align: center;
  color: rgba(255, 255, 255, 0.88);
}

/* 行悬停 */

.empty-cell {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  padding: 50px 0;
  font-size: 13px;
}

/* ===== 分页（按图示还原） ===== */
.dialog-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  flex-shrink: 0;
  border-top: 1px solid rgba(129, 211, 248, 0.08);
}

.page-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
}

.page-center {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  background: transparent;
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled):not(.ellipsis) {
  background: rgba(2, 167, 240, 0.12);
  color: #02A7F0;
  border-color: rgba(2, 167, 240, 0.3);
}

.page-btn.active {
  background: #02A7F0;
  color: #fff;
  border-color: #02A7F0;
}

.page-btn.ellipsis {
  border: none;
  cursor: default;
  color: rgba(255, 255, 255, 0.4);
}

.page-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.page-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-size-select {
  padding: 3px 6px;
  background: transparent;
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

.page-size-select option {
  background: #1a2332;
  color: #fff;
}

.jump-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

.jump-input {
  width: 40px;
  height: 26px;
  padding: 0 4px;
  text-align: center;
  background: transparent;
  border: 1px solid rgba(129, 211, 248, 0.2);
  border-radius: 3px;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.jump-input:focus {
  border-color: #02A7F0;
}
</style>

<!-- 全局样式：覆盖 Teleport 到 body 的 el-date-picker 面板 -->
<style>
/* ===== el-date-picker 弹出面板深色主题（全局） ===== */

/* ===== 输入框区域深色主题（内联部分） ===== */
/* 主容器 */
.el-date-editor--daterange {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

/* 输入框包装器 */
.el-date-editor .el-input__wrapper {
  background: transparent !important;
  box-shadow: 0 1px 0 0 rgba(129, 211, 248, 0.35) !important;
  border-radius: 0 !important;
  padding: 4px 12px;
}

.el-date-editor .el-input__wrapper:hover {
  box-shadow: 0 1px 0 0 rgba(2, 167, 240, 0.6) !important;
}

.el-date-editor .el-input__wrapper.is-focus {
  box-shadow: 0 1px 0 0 #02A7F0 !important;
}

/* 输入文字 */
.el-date-editor .el-input__inner {
  color: #fff !important;
  font-size: 13px;
  background: transparent !important;
}

.el-date-editor .el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* 范围分隔符 */
.el-date-editor .el-range-separator {
  color: rgba(255, 255, 255, 0.55) !important;
}

/* 图标颜色 */
.el-date-editor .el-input__icon,
.el-date-editor .el-range__icon {
  color: rgba(180, 195, 220, 0.5) !important;
}
.el-date-editor .el-input__icon:hover,
.el-date-editor .el-range__icon:hover {
  color: #02A7F0 !important;
}

/* 清除图标 */
.el-date-editor .el-input__clear {
  color: rgba(180, 195, 220, 0.5) !important;
}

/* ===== 弹出面板深色主题 ===== */

/* 主面板容器 */
.el-date-range-picker {
  background: rgba(15, 22, 36, 0.97) !important;
  border: 1px solid rgba(60, 80, 120, 0.35) !important;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6) !important;
}

/* 头部区域 */
.el-date-range-picker .el-picker-panel__body {
  color: rgba(255, 255, 255, 0.75);
}

.el-date-range-picker .el-picker-panel__sidebar {
  background: rgba(20, 30, 50, 0.6) !important;
  border-right: 1px solid rgba(60, 80, 120, 0.2) !important;
}

.el-date-range-picker .el-picker-panel__shortcut {
  color: rgba(200, 215, 240, 0.7) !important;
}
.el-date-range-picker .el-picker-panel__shortcut:hover {
  color: #02A7F0 !important;
  background: rgba(2, 167, 240, 0.1) !important;
}

/* 左右面板头部（年月导航） */
.el-date-table th {
  color: rgba(180, 195, 220, 0.6) !important;
  font-weight: 500;
  border-bottom-color: rgba(60, 80, 120, 0.3) !important;
}

/* 日历面板标题 */
.el-date-range-picker .el-date-header {
  border-bottom-color: rgba(60, 80, 120, 0.25) !important;
}

.el-date-range-picker .el-date-header button {
  color: rgba(200, 215, 240, 0.7) !important;
}
.el-date-range-picker .el-date-header button:hover {
  color: #02A7F0 !important;
}

/* 日期单元格 */
.el-date-range-picker .el-date-table td {
  color: rgba(225, 230, 245, 0.82) !important;
}

.el-date-range-picker .el-date-table td.available:hover {
  color: #fff !important;
}

.el-date-range-picker .el-date-table td.today span {
  color: #02A7F0 !important;
  font-weight: 600;
}

.el-date-range-picker .el-date-table td.current:not(.disabled) span,
.el-date-range-picker .el-date-table td.in-range span {
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%) !important;
  color: #fff !important;
  border-radius: 16px;
}

.el-date-range-picker .el-date-table td.start-date span,
.el-date-range-picker .el-date-table td.end-date span {
  border-radius: 16px !important;
}

/* 底部操作栏 */
.el-date-range-picker .el-picker-panel__footer {
  background: transparent !important;
  border-top-color: rgba(60, 80, 120, 0.2) !important;
}

/* 确认按钮 */
.el-date-range-picker .el-button--primary {
  background: linear-gradient(135deg, #1890FF 0%, #096DD9 100%) !important;
  border: none !important;
}
.el-date-range-picker .el-button--primary:hover {
  opacity: 0.9;
}
.el-date-range-picker .el-button--default {
  color: rgba(200, 210, 230, 0.7) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(129, 211, 248, 0.15) !important;
}

/* 禁用日期 */
.el-date-range-picker .el-date-table td.disabled span {
  color: rgba(130, 145, 175, 0.28) !important;
  background: transparent !important;
}

/* 范围中间的连接样式 */
.el-date-range-picker .el-date-table td.in-range div {
  background-color: rgba(24, 144, 255, 0.1) !important;
}

/* 下拉箭头图标颜色 */
.el-date-range-picker .el-input__icon {
  color: rgba(180, 195, 220, 0.5);
}

.el-date-range-picker .el-input__inner {
  color: #fff !important;
}
</style>
