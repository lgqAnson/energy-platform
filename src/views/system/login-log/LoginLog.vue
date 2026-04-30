<template>
  <div class="space-y-5">
    <CardPanel title="登录日志">
      <div class="p-4">
        <div class="flex items-center gap-4 mb-4 flex-wrap">
          <el-input v-model="search" placeholder="搜索用户名..." clearable class="!w-48" />
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="!w-64" />
          <el-button type="primary" plain>导出</el-button>
        </div>
        <el-table :data="filteredList" style="width: 100%" class="dark-table">
          <el-table-column prop="time" label="登录时间" width="170" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="ip" label="IP地址" width="150" />
          <el-table-column prop="device" label="设备" min-width="200" />
          <el-table-column prop="result" label="结果" width="80">
            <template #default="{ row }">
              <el-tag :type="row.result === '成功' ? 'success' : 'danger'" size="small">{{ row.result }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="flex justify-end mt-4">
          <el-pagination layout="prev, pager, next" :total="filteredList.length" :page-size="10" small />
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CardPanel from '@/components/common/CardPanel.vue'

const search = ref('')
const dateRange = ref<[Date, Date] | null>(null)

interface LogItem {
  time: string; username: string; ip: string; device: string; result: string
}

const list = ref<LogItem[]>([
  { time: '2026-04-30 10:35:22', username: 'admin', ip: '192.168.1.100', device: 'Chrome / Windows 10', result: '成功' },
  { time: '2026-04-30 09:12:08', username: 'zhangsan', ip: '192.168.1.101', device: 'Firefox / macOS', result: '成功' },
  { time: '2026-04-30 08:05:43', username: 'lisi', ip: '192.168.1.102', device: 'Safari / iOS', result: '失败' },
  { time: '2026-04-29 18:22:15', username: 'admin', ip: '10.0.0.55', device: 'Edge / Windows 11', result: '成功' },
  { time: '2026-04-29 14:48:30', username: 'wangwu', ip: '192.168.1.105', device: 'Chrome / Android', result: '成功' }
])

const filteredList = computed(() => {
  return list.value.filter(item => {
    return !search.value || item.username.includes(search.value)
  })
})
</script>

<style scoped>
.dark-table :deep(.el-table__header th) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
.dark-table :deep(.el-table__body tr) { background: rgba(255,255,255,0.03) !important; color: rgba(255,255,255,0.85); }
</style>
