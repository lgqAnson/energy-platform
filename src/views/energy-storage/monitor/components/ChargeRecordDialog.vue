<template>
  <ModalDialog
    v-model:visible="visible"
    title="充放电记录明细"
    width="90vw"
    :show-close="true"
  >
    <!-- 搜索栏 -->
    <div class="dialog-toolbar">
      <div class="toolbar-label">时间范围：</div>
      <div class="date-range">
        <input v-model="searchForm.startDate" type="date" class="date-input" />
        <span class="date-sep">-</span>
        <input v-model="searchForm.endDate" type="date" class="date-input" />
      </div>
      <button class="toolbar-btn btn-primary" @click="handleSearch">
        <Search class="btn-icon" />
        <span>查询</span>
      </button>
      <button class="toolbar-btn btn-default" @click="handleReset">
        <RotateCcw class="btn-icon" />
        <span>重置</span>
      </button>
      <button class="toolbar-btn btn-success" @click="handleExport">
        <Download class="btn-icon" />
        <span>导出</span>
      </button>
    </div>

    <!-- 表格 -->
    <div class="dialog-table-wrap">
      <table class="dialog-table">
        <thead>
          <tr>
            <th>储能柜名称</th>
            <th>柜号</th>
            <th>充放电类型</th>
            <th>平均功率(kW)</th>
            <th>累计电量(kWh)</th>
            <th>起始时间</th>
            <th>结束时间</th>
            <th>起始SOC(%)</th>
            <th>结束SOC(%)</th>
            <th>充放电时长</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in paginatedData" :key="idx" :class="{ even: idx % 2 === 1 }">
            <td>{{ row.cabinetName }}</td>
            <td>{{ row.cabinetNo }}</td>
            <td>
              <span class="type-tag" :class="row.type === '充电' ? 'charge' : 'discharge'">{{ row.type }}</span>
            </td>
            <td>{{ row.avgPower }}</td>
            <td>{{ row.totalEnergy }}</td>
            <td>{{ row.startTime }}</td>
            <td>{{ row.endTime }}</td>
            <td>{{ row.startSoc }}</td>
            <td>{{ row.endSoc }}</td>
            <td>{{ row.duration }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="dialog-pagination">
      <span class="page-total">共 {{ tableData.length }} 条</span>
      <select v-model="pageSize" class="page-size-select">
        <option :value="10">10条/页</option>
        <option :value="20">20条/页</option>
        <option :value="50">50条/页</option>
      </select>
      <button class="page-btn" :disabled="currentPage <= 1" @click="currentPage--">&lt;</button>
      <button v-for="p in visiblePages" :key="p" class="page-btn" :class="{ active: p === currentPage }"
        @click="currentPage = p">
        {{ p }}
      </button>
      <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">&gt;</button>
    </div>
  </ModalDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, RotateCcw, Download } from 'lucide-vue-next'
import ModalDialog from '@/components/business/ModalDialog.vue'

const visible = defineModel<boolean>('visible', { default: false })

// 搜索表单
const today = new Date().toISOString().split('T')[0]
const searchForm = ref({
  startDate: today,
  endDate: today
})
function handleSearch() {
  currentPage.value = 1
}
function handleReset() {
  searchForm.value.startDate = today
  searchForm.value.endDate = today
  currentPage.value = 1
}
function handleExport() {
  alert('导出功能开发中...')
}

// 模拟表格数据
const cabinetNames = ['R251205J0055', 'R251205J0057', 'R251205J0054', 'R251205J0056', 'R251205J0058']
const tableData = ref(Array.from({ length: 23 }, (_, i) => {
  const cabinetIdx = i % cabinetNames.length
  const isCharge = i % 3 !== 0
  const start = new Date('2026-03-25T00:00:00')
  start.setMinutes(start.getMinutes() + i * 7 + Math.floor(Math.random() * 30))
  const end = new Date(start)
  end.setMinutes(end.getMinutes() + 60 + Math.floor(Math.random() * 10))
  const durationMin = (end.getTime() - start.getTime()) / 60000
  const hours = Math.floor(durationMin / 60)
  const mins = Math.floor(durationMin % 60)
  return {
    cabinetName: cabinetNames[cabinetIdx],
    cabinetNo: (i % 5),
    type: isCharge ? '充电' : '放电',
    avgPower: ((isCharge ? -1 : 1) * (58 + Math.random() * 2)).toFixed(2),
    totalEnergy: (61 + Math.random() * 2).toFixed(1),
    startTime: start.toISOString().replace('T', ' ').slice(0, 19),
    endTime: end.toISOString().replace('T', ' ').slice(0, 19),
    startSoc: 1,
    endSoc: 23 + Math.floor(Math.random() * 3),
    duration: `${hours}.${(mins / 60 * 100).toFixed(0).padStart(2, '0')}`
  }
}))

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = computed(() => Math.ceil(tableData.value.length / pageSize.value))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return tableData.value.slice(start, start + pageSize.value)
})
const visiblePages = computed(() => {
  const pages: number[] = []
  for (let i = 1; i <= totalPages.value; i++) pages.push(i)
  return pages
})
</script>

<style scoped>
.dialog-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.toolbar-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.date-range {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-input {
  padding: 5px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: #fff;
  font-size: 12px;
  outline: none;
  width: 120px;
}

.date-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.6;
  cursor: pointer;
}

.date-sep {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
  color: #fff;
}

.toolbar-btn:hover {
  opacity: 0.9;
}

.btn-primary {
  background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%);
}

.btn-default {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-success {
  background: linear-gradient(135deg, #52C41A 0%, #389E0D 100%);
}

.btn-icon {
  width: 13px;
  height: 13px;
}

.dialog-table-wrap {
  overflow-x: auto;
  margin-bottom: 12px;
}

.dialog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 800px;
}

.dialog-table th {
  padding: 10px 8px;
  text-align: center;
  font-weight: 600;
  color: #02A7F0;
  background: rgba(2, 167, 240, 0.08);
  border-bottom: 1px solid rgba(129, 211, 248, 0.15);
  white-space: nowrap;
}

.dialog-table td {
  padding: 9px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(129, 211, 248, 0.06);
}

.dialog-table tbody tr.even {
  background: rgba(2, 167, 240, 0.03);
}

.type-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.type-tag.charge {
  background: rgba(82, 196, 26, 0.15);
  color: #52C41A;
}

.type-tag.discharge {
  background: rgba(250, 173, 20, 0.15);
  color: #FAAD14;
}

.dialog-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.page-total {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 8px;
}

.page-size-select {
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: #fff;
  font-size: 12px;
  outline: none;
  margin-right: 8px;
}

.page-btn {
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.page-btn:hover:not(:disabled) {
  background: rgba(2, 167, 240, 0.15);
  border-color: rgba(2, 167, 240, 0.4);
  color: #02A7F0;
}

.page-btn.active {
  background: rgba(2, 167, 240, 0.25);
  border-color: rgba(2, 167, 240, 0.5);
  color: #02A7F0;
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
</style>
