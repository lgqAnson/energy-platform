<template>
  <div class="space-y-5">
    <CardPanel title="工商业负荷">
      <div class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div v-for="stat in stats" :key="stat.label" class="glass-card p-4 rounded-lg">
            <div class="text-xs text-white/50 mb-1">{{ stat.label }}</div>
            <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
            <div class="text-xs text-white/40 mt-1">{{ stat.desc }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4 mb-4">
          <el-input v-model="search" placeholder="搜索负荷设备..." clearable class="!w-64" />
          <el-select v-model="typeFilter" placeholder="类型筛选" clearable class="!w-32">
            <el-option label="工业" value="industrial" />
            <el-option label="商业" value="commercial" />
            <el-option label="公共" value="public" />
          </el-select>
        </div>
        <el-table :data="filteredList" style="width: 100%" class="dark-table">
          <el-table-column prop="name" label="负荷名称" min-width="150" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="currentLoad" label="当前负荷(kW)" width="130" />
          <el-table-column prop="ratedLoad" label="额定负荷(kW)" width="130" />
          <el-table-column prop="loadRate" label="负载率" width="100">
            <template #default="{ row }">{{ row.loadRate }}%</template>
          </el-table-column>
          <el-table-column prop="trend" label="趋势" width="80">
            <template #default="{ row }">
              <span :class="row.trend === '上升' ? 'text-orange-400' : 'text-green-400'">{{ row.trend }}</span>
            </template>
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
const typeFilter = ref('')

const stats = [
  { label: '总负荷设备', value: 56, desc: '监测点数量' },
  { label: '当前总负荷', value: '8,520 kW', desc: '实时数据' },
  { label: '今日峰值', value: '12,340 kW', desc: '14:32 记录' }
]

interface LoadItem {
  name: string; type: string; currentLoad: number; ratedLoad: number; loadRate: number; trend: string
}

const list = ref<LoadItem[]>([
  { name: 'A区生产线', type: '工业', currentLoad: 2450, ratedLoad: 3000, loadRate: 82, trend: '上升' },
  { name: 'B区生产线', type: '工业', currentLoad: 1820, ratedLoad: 2500, loadRate: 73, trend: '平稳' },
  { name: '办公楼中央空调', type: '商业', currentLoad: 680, ratedLoad: 800, loadRate: 85, trend: '平稳' },
  { name: '数据中心', type: '公共', currentLoad: 1200, ratedLoad: 1500, loadRate: 80, trend: '上升' },
  { name: '照明系统', type: '公共', currentLoad: 320, ratedLoad: 500, loadRate: 64, trend: '下降' }
])

const filteredList = computed(() => {
  return list.value.filter(item => {
    const m = !search.value || item.name.includes(search.value)
    const t = !typeFilter.value || (typeFilter.value === 'industrial' ? item.type === '工业' : typeFilter.value === 'commercial' ? item.type === '商业' : item.type === '公共')
    return m && t
  })
})
</script>

<style scoped>
.dark-table :deep(.el-table__header th) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
.dark-table :deep(.el-table__body tr) { background: rgba(255,255,255,0.03) !important; color: rgba(255,255,255,0.85); }
</style>
