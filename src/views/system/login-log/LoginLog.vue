<template>
  <div class="login-log-page">
    <!-- 页面标题区 -->
    <div class="page-title">
      <h2>登录日志</h2>
      <div class="title-underline"></div>
    </div>

    <!-- 筛选条件栏 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY/MM/DD"
        class="filter-date"
      />
      <el-input v-model="filterAccount" placeholder="请输入" clearable class="filter-input">
        <template #prefix>
          <span class="filter-label">用户账号</span>
        </template>
      </el-input>
      <el-input v-model="filterIp" placeholder="请输入" clearable class="filter-input">
        <template #prefix>
          <span class="filter-label">IP地址</span>
        </template>
      </el-input>
      <el-select v-model="filterResult" placeholder="全部" clearable class="filter-select">
        <el-option label="全部" value="" />
        <el-option label="成功" value="成功" />
        <el-option label="失效" value="失效" />
      </el-select>
      <el-button link class="btn-reset" @click="handleReset">重置</el-button>
      <el-button type="primary" class="btn-search" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table :data="paginatedList" style="width: 100%" class="dark-table" row-class-name="dark-row">
      <el-table-column label="#" width="60" align="center">
        <template #default="{ $index }">
          {{ (currentPage - 1) * pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="用户账号" min-width="130">
        <template #default="{ row }">
          <div class="user-cell">
            <span class="avatar" :style="{ backgroundColor: getAvatarColor(row.account) }">
              {{ row.name.charAt(0) }}
            </span>
            <span>{{ row.account }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="用户姓名" min-width="100" />
      <el-table-column prop="time" label="登录时间" min-width="170" />
      <el-table-column prop="ip" label="IP地址" min-width="140" />
      <el-table-column prop="device" label="设备信息" min-width="220" />
      <el-table-column label="登录结果" width="90" align="center">
        <template #default="{ row }">
          <span :class="row.result === '成功' ? 'tag-success' : 'tag-fail'">{{ row.result }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="failReason" label="失败原因" min-width="120">
        <template #default="{ row }">
          <span :class="row.failReason === '-' ? 'text-muted' : 'text-fail'">{{ row.failReason }}</span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <span class="total-text">共 {{ filteredList.length }} 条记录</span>
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredList.length"
        layout="prev, pager, next"
        small
        background
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { useApiData } from '@/composables/useApiData'
import { getMockLoginLogList, type LoginLogItem } from '@/mocks/providers/energyStorage'
import { systemApi } from '@/api/api'

/** 日期范围 */
const dateRange = ref<[string, string] | null>(null)
/** 用户账号筛选 */
const filterAccount = ref('')
/** IP地址筛选 */
const filterIp = ref('')
/** 登录结果筛选 */
const filterResult = ref('')
/** 当前页码 */
const currentPage = ref(1)
/** 每页条数 */
const pageSize = 10

/** 加载日志数据 */
const { data: list } = useApiData<LoginLogItem[]>(
  getMockLoginLogList,
  () => systemApi.getLoginLogList().then((r) => (r.data as any)?.list ?? [])
)

/** 根据筛选条件过滤后的列表 */
const filteredList = computed(() => {
  return (list.value ?? []).filter((item) => {
    // 用户账号模糊匹配
    if (filterAccount.value && !item.account.includes(filterAccount.value)) return false
    // IP地址模糊匹配
    if (filterIp.value && !item.ip.includes(filterIp.value)) return false
    // 登录结果精确匹配
    if (filterResult.value && item.result !== filterResult.value) return false
    // 日期范围筛选
    if (dateRange.value) {
      const [start, end] = dateRange.value
      const itemDate = dayjs(item.time).format('YYYY/MM/DD')
      if (start && itemDate < start) return false
      if (end && itemDate > end) return false
    }
    return true
  })
})

/** 当前页数据切片 */
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

/**
 * 根据账号生成头像背景色
 * @param account 用户账号
 * @returns 十六进制颜色值
 */
function getAvatarColor(account: string): string {
  const colors = ['#02A7F0', '#70B603', '#F59A23', '#E34D59', '#7B61FF', '#1A9DFF', '#17A2B8', '#6F42C1']
  let hash = 0
  for (let i = 0; i < account.length; i++) {
    hash = account.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/** 搜索：重置到第1页 */
function handleSearch() {
  currentPage.value = 1
}

/** 重置所有筛选条件 */
function handleReset() {
  filterAccount.value = ''
  filterIp.value = ''
  filterResult.value = ''
  dateRange.value = null
  currentPage.value = 1
}
</script>

<style scoped>
.login-log-page {
  padding: 24px;
  min-height: 100%;
}

/* 页面标题 */
.page-title {
  margin-bottom: 20px;
}

.page-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.title-underline {
  width: 40px;
  height: 3px;
  margin-top: 8px;
  background: #02A7F0;
  border-radius: 2px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-date {
  width: 260px;
}

.filter-input {
  width: 180px;
}

.filter-select {
  width: 120px;
}

.filter-label {
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  white-space: nowrap;
}

.btn-reset {
  color: rgba(255, 255, 255, 0.6) !important;
  font-size: 13px;
}

.btn-reset:hover {
  color: #02A7F0 !important;
}

.btn-search {
  background: #02A7F0 !important;
  border-color: #02A7F0 !important;
  font-size: 13px;
}

/* 用户账号列 - 头像 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

/* 登录结果标签 */
.tag-success {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 12px;
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  line-height: 20px;
}

.tag-fail {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 12px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  line-height: 20px;
}

.text-muted {
  color: rgba(255, 255, 255, 0.3);
}

.text-fail {
  color: rgba(255, 255, 255, 0.65);
}

/* 深色表格样式 */
.dark-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
  --el-table-row-hover-bg-color: rgba(2, 167, 240, 0.08);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  background: transparent !important;
}

.dark-table :deep(.el-table__inner-wrapper) {
  background: linear-gradient(180deg, rgba(10, 22, 40, 0.95) 0%, rgba(15, 29, 50, 0.9) 100%);
}

.dark-table :deep(.el-table__header-wrapper),
.dark-table :deep(.el-table__footer-wrapper) {
  background: transparent;
}

.dark-table :deep(.el-table__header th) {
  background: rgba(255, 255, 255, 0.06) !important;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.dark-table :deep(.el-table__body tr.el-table__row) {
  background: rgba(255, 255, 255, 0.02) !important;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  transition: background-color 0.2s ease;
}

.dark-table :deep(.el-table__body tr.el-table__row:hover > td) {
  background: rgba(2, 167, 240, 0.1) !important;
}

.dark-table :deep(.el-table__body td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.dark-table :deep(.el-table__empty-block) {
  background: transparent;
}

.dark-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* 分页栏 */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 0 4px;
}

.total-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

/* Element Plus 深色主题覆盖 */
:deep(.el-date-editor) {
  --el-fill-color-blank: rgba(255, 255, 255, 0.06);
  --el-text-color-regular: rgba(255, 255, 255, 0.85);
  --el-border-color: rgba(255, 255, 255, 0.12);
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset !important;
}

:deep(.el-input__inner) {
  color: rgba(255, 255, 255, 0.85);
}

:deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06) !important;
}

:deep(.el-pagination) {
  --el-pagination-bg-color: rgba(255, 255, 255, 0.06);
  --el-pagination-text-color: rgba(255, 255, 255, 0.6);
  --el-pagination-button-disabled-color: rgba(255, 255, 255, 0.25);
  --el-pagination-hover-color: #02A7F0;
}

:deep(.el-pagination .is-active) {
  background: #02A7F0 !important;
  color: #fff !important;
}
</style>
