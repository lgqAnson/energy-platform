<template>
  <div class="space-y-5">
    <CardPanel title="光伏-设备管理">
      <div class="p-4">
        <div class="flex items-center gap-4 mb-4">
          <el-input v-model="search" placeholder="搜索设备..." clearable class="!w-64" />
          <el-select v-model="typeFilter" placeholder="设备类型" clearable class="!w-36">
            <el-option label="逆变器" value="inverter" />
            <el-option label="光伏组件" value="module" />
            <el-option label="光伏站点" value="station" />
          </el-select>
        </div>
        <el-table :data="filteredList" style="width: 100%" class="dark-table">
          <el-table-column prop="name" label="设备名称" min-width="150" />
          <el-table-column prop="type" label="类型" width="110" />
          <el-table-column prop="station" label="所属站点" min-width="150" />
          <el-table-column prop="ratedPower" label="额定功率" width="110" />
          <el-table-column prop="status" label="运行状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '运行' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="installDate" label="投运日期" width="120" />
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

interface DeviceItem {
  name: string; type: string; station: string; ratedPower: string; status: string; installDate: string
}

const list = ref<DeviceItem[]>([
  { name: '逆变器 INV-01', type: '逆变器', station: '光伏站A', ratedPower: '500kW', status: '运行', installDate: '2024-03-15' },
  { name: '逆变器 INV-02', type: '逆变器', station: '光伏站A', ratedPower: '500kW', status: '运行', installDate: '2024-03-15' },
  { name: '组件 MOD-001~050', type: '光伏组件', station: '光伏站A', ratedPower: '550W×50', status: '运行', installDate: '2024-03-20' },
  { name: '逆变器 INV-03', type: '逆变器', station: '光伏站B', ratedPower: '350kW', status: '维护', installDate: '2024-06-01' },
  { name: '组件 MOD-051~100', type: '光伏组件', station: '光伏站B', ratedPower: '550W×50', status: '运行', installDate: '2024-06-05' }
])

const filteredList = computed(() => {
  return list.value.filter(item => {
    const m = !search.value || item.name.includes(search.value) || item.station.includes(search.value)
    const t = !typeFilter.value || (typeFilter.value === 'inverter' ? item.type === '逆变器' : typeFilter.value === 'module' ? item.type === '光伏组件' : item.type === '光伏站点')
    return m && t
  })
})
</script>

<style scoped>
.dark-table :deep(.el-table__header th) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
.dark-table :deep(.el-table__body tr) { background: rgba(255,255,255,0.03) !important; color: rgba(255,255,255,0.85); }
</style>
