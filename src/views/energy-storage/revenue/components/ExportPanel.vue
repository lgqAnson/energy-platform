<template>
  <div class="export-panel">
    <div class="panel-title">数据导出</div>
    <div class="panel-body">
      <div class="export-range">
        <div class="range-label">选择导出数据范围：</div>
        <div class="range-options">
          <label class="checkbox-item">
            <input v-model="exportOptions.detail" type="checkbox" />
            <span>收益明细</span>
          </label>
          <label class="checkbox-item">
            <input v-model="exportOptions.efficiency" type="checkbox" />
            <span>效率分析</span>
          </label>
        </div>
      </div>
      <div class="format-btns">
        <button class="format-btn excel" @click="exportExcel">
          <FileSpreadsheet :size="16" />
          <span>Excel</span>
        </button>
        <button class="format-btn pdf" @click="exportPdf">
          <FileText :size="16" />
          <span>PDF</span>
        </button>
      </div>
      <button class="export-main-btn" @click="exportData">
        <Download :size="16" />
        <span>导出数据</span>
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { FileSpreadsheet, FileText, Download } from 'lucide-vue-next'

const exportOptions = ref({ detail: false, efficiency: false })
function exportExcel() { console.log('export excel') }
function exportPdf() { console.log('export pdf') }
function exportData() { console.log('export data', exportOptions.value) }
</script>
<style scoped>
.export-panel {
  background: linear-gradient(180deg, rgba(129,211,248,0.08) 0%, rgba(85,85,85,0.05) 100%);
  border: 1px solid rgba(129,211,248,0.15);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: #02A7F0;
}
.panel-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.export-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.range-label {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}
.range-options {
  display: flex;
  gap: 16px;
}
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(255,255,255,0.7);
}
.checkbox-item input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: #02A7F0;
}
.format-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.format-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 0;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(129,211,248,0.12);
  color: rgba(255,255,255,0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.format-btn:hover {
  background: rgba(2,167,240,0.15);
  border-color: rgba(2,167,240,0.3);
}
.format-btn.excel:hover { color: #4CAF50; }
.format-btn.pdf:hover { color: #FF6B6B; }
.export-main-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #FF8C42 0%, #E67300 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.export-main-btn:hover {
  opacity: 0.9;
}
</style>
