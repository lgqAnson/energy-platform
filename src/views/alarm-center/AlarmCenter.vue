<template>
  <div class="space-y-5">
    <CardPanel title="告警中心">
      <div class="p-4">
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div v-for="stat in stats" :key="stat.label" class="glass-card p-4 rounded-lg">
            <div class="text-xs text-white/50 mb-1">{{ stat.label }}</div>
            <div class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</div>
          </div>
        </div>
        <div class="flex items-center gap-4 mb-4 flex-wrap">
          <el-input v-model="search" placeholder="搜索告警..." clearable class="!w-64" />
          <el-select v-model="levelFilter" placeholder="级别筛选" clearable class="!w-28">
            <el-option label="紧急" value="urgent" />
            <el-option label="重要" value="important" />
            <el-option label="一般" value="normal" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态筛选" clearable class="!w-28">
            <el-option label="待处理" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已清除" value="cleared" />
          </el-select>
        </div>
        <el-table :data="filteredList" style="width: 100%" class="dark-table">
          <el-table-column prop="time" label="时间" width="160" />
          <el-table-column prop="device" label="设备" min-width="150" />
          <el-table-column prop="content" label="告警内容" min-width="200" show-overflow-tooltip />
          <el-table-column prop="level" label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="levelType(row.level)" size="small">{{ row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="alarmStatusType(row.status)" size="small">{{ row.status }}</el-tag>
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
const levelFilter = ref('')
const statusFilter = ref('')

const stats = [
  { label: '未处理告警', value: 8, color: 'text-red-400' },
  { label: '今日告警', value: 23, color: 'text-orange-400' },
  { label: '已确认', value: 12, color: 'text-yellow-400' },
  { label: '已清除', value: 3, color: 'text-green-400' }
]

interface AlarmItem {
  time: string; device: string; content: string; level: string; status: string
}

const list = ref<AlarmItem[]>([
  { time: '2026-04-30 09:22', device: 'BESS-08-电池簇', content: '温度异常升高，当前48.5℃，超过安全阈值(45℃)', level: '紧急', status: '待处理' },
  { time: '2026-04-30 08:15', device: '光伏-逆变器#3', content: '逆变器效率下降至92%，低于正常值(97%)', level: '重要', status: '待处理' },
  { time: '2026-04-30 07:48', device: '充电桩-CS-A01', content: '充电功率异常波动，范围180-240kW', level: '一般', status: '已确认' },
  { time: '2026-04-29 22:10', device: 'BESS-05-储能柜', content: 'SOC下降速率异常，30分钟内下降15%', level: '重要', status: '已确认' },
  { time: '2026-04-29 16:35', device: '光伏-组件#12', content: '组件输出功率偏低，可能存在遮挡', level: '一般', status: '已清除' }
])

const filteredList = computed(() => {
  return list.value.filter(item => {
    const m = !search.value || item.device.includes(search.value) || item.content.includes(search.value)
    const l = !levelFilter.value || (levelFilter.value === 'urgent' ? item.level === '紧急' : levelFilter.value === 'important' ? item.level === '重要' : item.level === '一般')
    const s = !statusFilter.value || (statusFilter.value === 'pending' ? item.status === '待处理' : statusFilter.value === 'confirmed' ? item.status === '已确认' : item.status === '已清除')
    return m && l && s
  })
})

const levelType = (l: string) => l === '紧急' ? 'danger' : l === '重要' ? 'warning' : 'info'
const alarmStatusType = (s: string) => s === '待处理' ? 'danger' : s === '已确认' ? 'warning' : 'success'
</script>

<style scoped>
.dark-table :deep(.el-table__header th) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
.dark-table :deep(.el-table__body tr) { background: rgba(255,255,255,0.03) !important; color: rgba(255,255,255,0.85); }
</style>
