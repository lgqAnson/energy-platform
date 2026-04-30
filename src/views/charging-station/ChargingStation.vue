<template>
  <div class="space-y-5">
    <CardPanel title="充电桩">
      <div class="p-4">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div v-for="stat in stats" :key="stat.label" class="glass-card p-4 rounded-lg">
              <div class="text-xs text-white/50 mb-1">{{ stat.label }}</div>
              <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
              <div class="text-xs mt-1" :class="stat.trend > 0 ? 'text-green-400' : 'text-red-400'">
                {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
              </div>
            </div>
          </div>
          <!-- 搜索与表格 -->
          <div class="flex items-center gap-4 mb-4">
            <el-input v-model="search" placeholder="搜索充电桩..." clearable class="!w-64" />
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable class="!w-32">
              <el-option label="运行中" value="online" />
              <el-option label="离线" value="offline" />
              <el-option label="充电中" value="charging" />
            </el-select>
          </div>
          <el-table :data="filteredList" style="width: 100%" row-class-name="dark-table-row" class="dark-table">
            <el-table-column prop="name" label="站点名称" min-width="150" />
            <el-table-column prop="code" label="编号" width="120" />
            <el-table-column prop="location" label="位置" min-width="150" />
            <el-table-column prop="power" label="额定功率(kW)" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="utilization" label="利用率" width="100">
              <template #default="{ row }">{{ row.utilization }}%</template>
            </el-table-column>
          </el-table>
        </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CardPanel from '@/components/common/CardPanel.vue'

const search = ref('')
const statusFilter = ref('')

const stats = [
  { label: '充电桩总数', value: 128, trend: 5.2 },
  { label: '运行中', value: 112, trend: 3.1 },
  { label: '今日充电量', value: '15,680 kWh', trend: 8.5 },
  { label: '今日收益', value: '¥12,350', trend: -2.3 }
]

interface Station {
  name: string; code: string; location: string; power: number; status: string; utilization: number
}

const list = ref<Station[]>([
  { name: '园区A充电站', code: 'CS-A01', location: '1号停车场', power: 120, status: '充电中', utilization: 85 },
  { name: '园区B充电站', code: 'CS-B01', location: '2号停车场', power: 60, status: '运行中', utilization: 45 },
  { name: '园区C充电站', code: 'CS-C01', location: '办公楼东侧', power: 180, status: '运行中', utilization: 72 },
  { name: '园区D充电站', code: 'CS-D01', location: '物流中心', power: 90, status: '离线', utilization: 0 },
  { name: '园区E充电站', code: 'CS-E01', location: '员工宿舍区', power: 60, status: '充电中', utilization: 91 }
])

const filteredList = computed(() => {
  return list.value.filter(item => {
    const matchSearch = !search.value || item.name.includes(search.value) || item.code.includes(search.value)
    const matchStatus = !statusFilter.value || (statusFilter.value === 'charging' ? item.status === '充电中' : item.status === (statusFilter.value === 'online' ? '运行中' : '离线'))
    return matchSearch && matchStatus
  })
})

const statusType = (status: string) => {
  if (status === '充电中') return 'warning'
  if (status === '运行中') return 'success'
  return 'info'
}
</script>

<style scoped>
.dark-table :deep(.dark-table-row) { background: rgba(255,255,255,0.03) !important; }
.dark-table :deep(.el-table__header th) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
.dark-table :deep(.el-table__body tr) { color: rgba(255,255,255,0.85); }
</style>
