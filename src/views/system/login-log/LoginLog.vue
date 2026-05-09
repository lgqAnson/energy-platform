<template>
  <div class="space-y-5">
    <CardPanel title="登录日志">
      <div class="p-4">
        <div class="flex items-center gap-4 mb-4 flex-wrap">
          <el-input v-model="search" placeholder="搜索用户名..." clearable class="!w-48" />
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="!w-64" />
          <el-button type="primary" plain :loading="exporting" @click="handleExport">导出</el-button>
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
import dayjs from 'dayjs'
import CardPanel from '@/components/common/CardPanel.vue'
import { useApiData } from '@/composables/useApiData'
import { getMockLoginLogList } from '@/mocks/providers/energyStorage'
import { systemApi } from '@/api/api'
import { serverExport, type ExportColumn } from '@/composables/useExport'

const search = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const exporting = ref(false)

const loginLogColumns: ExportColumn[] = [
  { header: '登录时间', key: 'time' },
  { header: '用户名', key: 'username' },
  { header: 'IP地址', key: 'ip' },
  { header: '设备', key: 'device' },
  { header: '结果', key: 'result' }
]

async function handleExport() {
  if (exporting.value) return
  exporting.value = true

  const apiParams: Record<string, unknown> = {}
  if (search.value) apiParams.keyword = search.value
  if (dateRange.value) {
    apiParams.startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
    apiParams.endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD')
  }

  await serverExport({
    apiCall: (p) => systemApi.exportLoginLog(p),
    filename: '登录日志',
    columns: loginLogColumns,
    data: filteredList.value as Record<string, unknown>[],
    sheetName: '登录日志',
    apiParams
  })

  exporting.value = false
}

interface LogItem {
  time: string; username: string; ip: string; device: string; result: string
}

const { data: list } = useApiData<LogItem[]>(
  getMockLoginLogList,
  () => systemApi.getLoginLogList().then(r => (r.data as any)?.list ?? [])
)

const filteredList = computed(() => {
  return (list.value ?? []).filter(item => {
    return !search.value || item.username.includes(search.value)
  })
})
</script>

<style scoped>
.dark-table :deep(.el-table__header th) { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); }
.dark-table :deep(.el-table__body tr) { background: rgba(255,255,255,0.03) !important; color: rgba(255,255,255,0.85); }
</style>
