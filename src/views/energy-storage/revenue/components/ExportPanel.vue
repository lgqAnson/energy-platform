<template>
  <div class="export-panel">
    <div class="panel-header">
      <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
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
      <div class="export-format">
        <button
          class="format-btn"
          :class="{ active: exportFormat === 'excel' }"
          :disabled="exporting"
          @click="exportFormat = 'excel'"
        >
          <FileSpreadsheet class="w-4 h-4" />
          Excel
        </button>
        <button
          class="format-btn"
          :class="{ active: exportFormat === 'pdf' }"
          :disabled="exporting"
          @click="exportFormat = 'pdf'"
        >
          <FileText class="w-4 h-4" />
          PDF
        </button>
      </div>
      <button class="export-btn" :disabled="exporting" @click="handleExport">
        <Download class="w-4 h-4" />
        {{ exporting ? '导出中...' : '导出数据' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FileSpreadsheet, FileText, Download } from 'lucide-vue-next'
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
  background: linear-gradient(180deg, rgba(129,211,248,0.08) 0%, rgba(85,85,85,0.05) 100%);
  border: 1px solid rgba(129,211,248,0.15);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  position: relative;
  margin-bottom: 8px;
}

.panel-header-bg {
  width: 100%;
  height: 30px;
  object-fit: fill;
  border-radius: 4px;
}

.panel-header-text {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.export-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
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
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.format-btn:hover {
  border-color: rgba(2, 167, 240, 0.4);
  color: rgba(255, 255, 255, 0.8);
}

.format-btn.active {
  background: rgba(2, 167, 240, 0.15);
  border-color: #02A7F0;
  color: #02A7F0;
}

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
</style>
