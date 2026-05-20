<template>
  <div class="export-panel">
    <div class="panel-header">
      <span class="panel-header-text">数据导出</span>
    </div>
    <div class="export-body">
      <div class="export-label">选择导出数据范围：</div>
      <div class="export-checkboxes">
        <label v-for="item in exportOptions" :key="item" class="cb-label">
          <input type="checkbox" v-model="selectedExports" :value="item" />
          <span class="cb-box"></span>
          <span class="cb-text">{{ item }}</span>
        </label>
      </div>
    </div>
    <div class="export-format">
      <button
        class="format-btn excel-btn"
        :class="{ active: exportFormat === 'excel' }"
        :disabled="exporting"
        @click="handleExportClick('excel')"
      >
        <span class="btn-left">
          <FileSpreadsheet class="w-4 h-4" />
          Excel
        </span>
        <span class="btn-right">
          <img src="/public/icons/down@2x.png" alt="" class="w-3 h-3" style="margin-right: 8px;" >
          导出数据
        </span>
      </button>
      <button
        class="format-btn pdf-btn"
        :class="{ active: exportFormat === 'pdf' }"
        :disabled="exporting"
        @click="handleExportClick('pdf')"
      >
        <span class="btn-left">
          <FileText class="w-4 h-4" />
          PDF
        </span>
        <span class="btn-right">
          <img src="/public/icons/down@2x.png" alt="" class="w-3 h-3" style="margin-right: 8px;">
          导出数据
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Download, FileSpreadsheet, FileText, ChevronDown } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { serverExport, type ExportColumn } from '@/composables/useExport'
import { energyStorageApi } from '@/api/api'

export interface RevenueExportRow {
  tag: string
  time: string
  chargePrice: string
  chargeQty: string
  chargeCost: string
  dischargePrice: string
  dischargeQty: string
  dischargeIncome: string
  netProfit: string
}

const props = defineProps<{
  revenueData?: RevenueExportRow[]
}>()

const exportOptions = ['收益明细', '效率分析']
const selectedExports = ref<string[]>(['收益明细', '效率分析'])
const exportFormat = ref<'excel' | 'pdf'>('excel')
const exporting = ref(false)

/** 切换导出格式并触发导出 */
function handleExportClick(format: 'excel' | 'pdf') {
  exportFormat.value = format
  handleExport()
}

const revenueColumns: ExportColumn[] = [
  { header: '时段', key: 'tag' },
  { header: '时间段', key: 'time' },
  { header: '充电电价(元/kWh)', key: 'chargePrice' },
  { header: '充电电量(kWh)', key: 'chargeQty' },
  { header: '充电成本(元)', key: 'chargeCost' },
  { header: '放电电价(元/kWh)', key: 'dischargePrice' },
  { header: '放电电量(kWh)', key: 'dischargeQty' },
  { header: '放电收益(元)', key: 'dischargeIncome' },
  { header: '净收益(元)', key: 'netProfit' }
]

async function handleExport() {
  if (selectedExports.value.length === 0) {
    ElMessage.warning('请至少选择一项导出内容')
    return
  }

  if (exportFormat.value === 'pdf') {
    ElMessage.info('PDF导出功能即将上线')
    return
  }

  if (exporting.value) return
  exporting.value = true

  if (selectedExports.value.includes('效率分析') && !selectedExports.value.includes('收益明细')) {
    ElMessage.info('效率分析数据即将支持')
    exporting.value = false
    return
  }

  const apiParams: Record<string, unknown> = {
    detail: selectedExports.value.includes('收益明细'),
    efficiency: selectedExports.value.includes('效率分析'),
    format: 'excel'
  }

  await serverExport({
    apiCall: (p) => energyStorageApi.exportRevenue(p),
    filename: '收益数据',
    columns: revenueColumns,
    data: (props.revenueData as Record<string, unknown>[]) ?? [],
    sheetName: '收益明细',
    apiParams
  })

  exporting.value = false
}
</script>

<style scoped>
.export-panel {
 
  padding: 0 16px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  position: relative;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid;
border-image: linear-gradient(90deg, rgba(0, 246, 255, 1), rgba(0, 246, 255, 0)) 1 1;
}

.panel-header-bg {
  width: 100%;
  height: 30px;
  object-fit: fill;
  border-radius: 4px;
}

.panel-header-text {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
        font-style: italic;
}

.export-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 4px 4px 4px 4px;
border: 1px solid #354764;
}

.export-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  padding: 6px 12px;
border-radius: 0px 0px 0px 0px;
border: 1px solid;
border-image: linear-gradient(180deg, rgba(121, 138, 176, 0), rgba(121, 138, 176, 1)) 1 1;
}

.export-checkboxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.cb-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.cb-label input {
  display: none;
}

.cb-box {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.cb-label input:checked + .cb-box {
  background: #02A7F0;
  border-color: #02A7F0;
}

.cb-label input:checked + .cb-box::after {
  content: '';
  width: 7px;
  height: 4px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg) translate(0.5px, -1px);
}

.cb-text {
  white-space: nowrap;
}

.export-format {
  display: flex;
  gap: 10px;
}

.format-btn {
  flex: 1;
  height: 38px;
  border-radius: 6px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  padding: 0;
}

.excel-btn { background-image: url('/images/excelExport.png'); }
.pdf-btn { background-image: url('/images/PDFexport.png'); }

.btn-left {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-left: 12px;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.excel-btn .btn-left { color: #4CAF50; }
.pdf-btn .btn-left { color: #FF6B6B; }

.btn-right {
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
  padding-right: 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.format-btn:hover { opacity: 0.9; }
.format-btn:active { transform: scale(0.98); }
.format-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.export-btn {
  width: 100%;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #FF8C42 0%, #E67300 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.export-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.w-4 { width: 16px; }
.h-4 { height: 16px; }
.w-3 { width: 12px; }
.h-3 { height: 12px; }
</style>
