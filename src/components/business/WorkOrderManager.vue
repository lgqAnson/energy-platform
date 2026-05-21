<template>
  <div class="work-order-manager">
       <div class="panel-header">
        <h3 class="panel-title">运维工单列表</h3>
      </div>
    <div class="maintenance-main">
      <!-- 左侧：运维工单列表 -->
   
      <div class="left-panel">

        <!-- 搜索筛选栏 -->
        <div class="search-bar">
          <input ref="searchInputRef" v-model="searchForm.keyword" type="text" placeholder="搜索工单编号/设备名称"
            class="search-input" />
          <select v-model="searchForm.status" class="filter-select">
            <option value="">全部状态</option>
            <option value="processing">处理中</option>
            <option value="dispatched">已派发</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
            <option value="pending">待派发</option>
          </select>
          <select v-model="searchForm.level" class="filter-select">
            <option value="">全部级别</option>
            <option value="urgent">紧急</option>
            <option value="important">重要</option>
            <option value="normal">一般</option>
          </select>
          <el-date-picker ref="datePickerRef" v-model="searchForm.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD"
            class="date-range-picker" popper-class="work-order-date-popper"  teleported="true" />
          <button class="btn-search" @click="handleSearch">
            <Search :size="14" />
            <span>查询</span>
          </button>
          <button class="btn-export" :disabled="exporting" @click="handleExport">
            <Download :size="14" />
            <span>{{ exporting ? '导出中...' : '导出数据' }}</span>
          </button>
        </div>

        <!-- 工单表格 -->
        <div class="table-wrapper">
          <table class="work-order-table">
            <thead>
              <tr>
                <th>工单编号</th>
                <th>告警设备</th>
                <th>告警级别</th>
                <th>创建时间</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id"
                :class="{ 'row-active': selectedOrder?.id === order.id }"
                @click="selectOrder(order)">
                <td>{{ order.id }}</td>
                <td>{{ order.device }}</td>
                <td>
                  <span class="level-tag" :class="order.level">{{ levelText(order.level) }}</span>
                </td>
                <td>{{ order.createTime }}</td>
                <td>
                  <span class="status-tag" :class="order.status">{{ statusText(order.status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredOrders.length === 0" class="empty-tip">
            暂无匹配工单
          </div>
        </div>
      </div>

      <!-- 右侧：工单详情 -->
      <div class="right-panel">
        <template v-if="selectedOrder">
          <!-- 标题区 -->
          <div class="detail-header">
            
            <h3 class="detail-title"><img src="/icons/Subheading.png" class="detail-title-icon" />{{ selectedOrder.title }}</h3>
            <div class="detail-subtitle">工单编号: {{ selectedOrder.id }}</div>
          </div>

          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-title">
              <span>基本信息</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">告警设备</div>
                <div class="info-value">{{ selectedOrder.device }} (SN: {{ selectedOrder.deviceSN }})</div>
              </div>
              <div class="info-item">
                <div class="info-label">告警级别</div>
                <div class="info-value">
                  <span class="level-tag" :class="selectedOrder.level">{{ levelText(selectedOrder.level) }}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">创建时间</div>
                <div class="info-value">{{ selectedOrder.createTime }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">创建人</div>
                <div class="info-value">{{ selectedOrder.creator }} (告警ID: {{ selectedOrder.alertId }})</div>
              </div>
              <div class="info-item">
                <div class="info-label">处理人员</div>
                <div class="info-value">{{ selectedOrder.handler }} ({{ selectedOrder.handlerTeam }})</div>
              </div>
              <!-- 储能字段 -->
              <div v-if="selectedOrder.estimatedCompleteTime" class="info-item">
                <div class="info-label">预计完成时间</div>
                <div class="info-value">{{ selectedOrder.estimatedCompleteTime }}</div>
              </div>
              <!-- 光伏字段 -->
              <div v-if="selectedOrder.recoveryTime" class="info-item">
                <div class="info-label">恢复时间</div>
                <div class="info-value">{{ selectedOrder.recoveryTime }}</div>
              </div>
            </div>
          </div>

          <!-- 告警详情 -->
          <div class="detail-section">
            <div class="section-title warning">
              <span>告警详情</span>
              <!-- <span class="detail-status-tag" :class="selectedOrder.status">{{ statusText(selectedOrder.status) }}</span> -->
            </div>
            <div style="display: flex;align-items: center;">
               <span class="info-label">告警内容</span>
               <span class="detail-status-tag" :class="selectedOrder.status" style="margin-right: 12px;color: #32ADE6;background: rgba(50,173,230,0.2);border-radius: 4px">{{ statusText(selectedOrder.status) }}</span>
            </div>
            <div class="alert-content-box">
              {{ selectedOrder.alertContent }}
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">告警时间</div>
                <div class="info-value">{{ selectedOrder.alertTime }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">持续时间</div>
                <div class="info-value">{{ selectedOrder.duration }}</div>
              </div>
              <!-- 储能字段 -->
              <div v-if="selectedOrder.monitorPoint" class="info-item">
                <div class="info-label">监测点位</div>
                <div class="info-value">{{ selectedOrder.monitorPoint }}</div>
              </div>
              <div v-if="selectedOrder.currentStatus" class="info-item">
                <div class="info-label">当前状态</div>
                <div class="info-value" :class="getCurrentStatusColor(selectedOrder.currentStatus)">
                  {{ selectedOrder.currentStatus }}
                </div>
              </div>
              <!-- 光伏字段 -->
              <div v-if="selectedOrder.rootCause" class="info-item">
                <div class="info-label">故障根因</div>
                <div class="info-value">{{ selectedOrder.rootCause }}</div>
              </div>
              <div v-if="selectedOrder.solution" class="info-item">
                <div class="info-label">处理措施</div>
                <div class="info-value">{{ selectedOrder.solution }}</div>
              </div>
            </div>
          </div>

          <!-- 处理流程 -->
          <div class="detail-section">
            <div class="section-title">
              <span>处理流程</span>
            </div>
            <div class="timeline">
              <div v-for="(step, idx) in selectedOrder.timeline" :key="idx" class="timeline-item"
                :class="step.status">
                <div class="timeline-dot" />
                <div class="timeline-body">
                  <div class="timeline-header">
                    <span class="timeline-name" :class="'name-' + step.status">{{ step.name }}</span>
                    <span class="timeline-time" :class="'time-' + step.status">{{ step.time || '--:--:--' }}</span>
                  </div>
                  <div class="timeline-desc">
                    <span v-for="(part, pidx) in parseDescription(step)" :key="pidx"
                      :class="part.type">{{ part.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 工单操作 -->
          <div class="detail-section">
            <div class="section-title">
              <span>工单操作</span>
            </div>
            <div class="action-buttons">
              <button class="action-btn re-dispatch" @click="handleAction('重新派发')">
               
                <span>重新派发</span>
              </button>
              <button class="action-btn update-progress" @click="handleAction('更新进度')">
               
                <span>更新进度</span>
              </button>
              <button class="action-btn submit-check" @click="handleAction('提交验收')">
                
                <span>提交验收</span>
              </button>
              <button class="action-btn archive" @click="handleAction('归档工单')">
               
                <span>归档工单</span>
              </button>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="empty-detail">
          <Wrench class="w-16 h-16 opacity-30" />
          <p>请在左侧选择工单查看详情</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Search, Download, ClipboardList, AlertTriangle, Info, Settings,
  RefreshCw, Pencil, CheckCircle, Archive, Wrench
} from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'

// 类型定义
/** 工单时间线步骤 */
export interface TimelineStep {
  name: string
  description: string
  time: string
  status: 'done' | 'active' | 'pending'
}

/** 描述文本片段 */
interface DescPart {
  text: string
  type: '' | 'highlight'
}

/** 运维工单 */
export interface WorkOrder {
  id: string
  title: string
  device: string
  deviceSN: string
  level: 'urgent' | 'important' | 'normal'
  createTime: string
  status: 'processing' | 'dispatched' | 'completed' | 'archived' | 'pending'
  creator: string
  alertId: string
  handler: string
  handlerTeam: string
  alertContent: string
  alertTime: string
  duration: string
  timeline: TimelineStep[]
  // 储能模块扩展字段
  estimatedCompleteTime?: string
  monitorPoint?: string
  currentStatus?: string
  // 光伏模块扩展字段
  recoveryTime?: string
  rootCause?: string
  solution?: string
}

const props = defineProps<{
  orders: WorkOrder[]
}>()

	const emit = defineEmits<{
		action: [action: string, order: WorkOrder]
	}>()

	// 搜索表单
const searchForm = ref({
  keyword: '',
  status: '',
  level: '',
  dateRange: ['2026-03-12', '2026-03-18'] as [string, string]
})

// 工单列表
const allOrders = ref<WorkOrder[]>(props.orders)
/** 当前选中的工单，默认选中列表第一条 */
const selectedOrder = ref<WorkOrder | null>(props.orders[0] || null)
const exporting = ref(false)

/** 监听 props.orders 变化，当有新数据且当前未选中任何工单时，自动选中第一条 */
watch(() => props.orders, (v) => {
  allOrders.value = v ?? []
  if (!selectedOrder.value && allOrders.value.length > 0) {
    selectedOrder.value = allOrders.value[0]
  }
})


/**
 * 根据搜索条件筛选工单
 * 支持关键词（ID/设备名）、状态、等级三个维度的组合过滤
 */
const filteredOrders = computed(() => {
  return allOrders.value.filter(order => {
    const matchKeyword = !searchForm.value.keyword ||
      order.id.includes(searchForm.value.keyword) ||
      order.device.includes(searchForm.value.keyword)
    const matchStatus = !searchForm.value.status || order.status === searchForm.value.status
    const matchLevel = !searchForm.value.level || order.level === searchForm.value.level
    return matchKeyword && matchStatus && matchLevel
  })
})

/**
 * 将告警级别编码映射为中文展示文本
 * @param level 告警级别编码（urgent/important/normal）
 * @returns 对应的中文文本
 */
const levelText = (level: string) => ({ urgent: '紧急', important: '重要', normal: '一般' })[level] || level

/**
 * 将工单状态编码映射为中文展示文本
 * @param status 工单状态编码（processing/dispatched/completed/archived/pending）
 * @returns 对应的中文文本
 */
const statusText = (status: string) => ({
  processing: '处理中', dispatched: '已派发', completed: '已完成', archived: '已归档', pending: '待派发'
})[status] || status

/**
 * 根据设备当前状态文本返回对应的 CSS 颜色类名
 * 正常/恢复/消除 → 绿色，高于/低于/异常 → 橙色，待处理 → 灰色
 * @param status 设备当前状态描述文本
 * @returns CSS 类名（text-green / text-orange / text-gray / ''）
 */
const getCurrentStatusColor = (status: string) => {
  if (status.includes('正常') || status.includes('恢复') || status.includes('消除')) return 'text-green'
  if (status.includes('高于') || status.includes('低于') || status.includes('异常')) return 'text-orange'
  if (status.includes('待处理')) return 'text-gray'
  return ''
}

/**
 * 选中指定工单，在右侧面板展示其详情
 * @param order 要查看的工单对象
 */
const selectOrder = (order: WorkOrder) => {
  selectedOrder.value = order
}

/** 执行工单搜索（将查询条件输出到控制台，实际项目替换为 API 调用） */
const handleSearch = () => {
  console.log('查询条件:', searchForm.value)
}

/** 导出工单数据 */
const handleExport = () => {
  if (exporting.value) return
  if (filteredOrders.value.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }
  exporting.value = true
  const columns: ExportColumn[] = [
    { header: '工单编号', key: 'id' },
    { header: '工单标题', key: 'title' },
    { header: '告警设备', key: 'device' },
    { header: '告警级别', key: 'level' },
    { header: '创建时间', key: 'createTime' },
    { header: '状态', key: 'status' },
    { header: '创建人', key: 'creator' },
    { header: '处理人员', key: 'handler' },
    { header: '告警时间', key: 'alertTime' },
    { header: '持续时间', key: 'duration' }
  ]
  const data = filteredOrders.value.map(order => ({
    ...order,
    level: levelText(order.level),
    status: statusText(order.status)
  }))
  exportToExcel(data, columns, filenameWithDate('运维工单'))
  ElMessage.success('工单数据导出成功')
  exporting.value = false
}

/**
 * 处理工单操作按钮点击（重新派发 / 更新进度 / 提交验收 / 归档）
 * @param action 操作名称
 */
const handleAction = (action: string) => {
  if (selectedOrder.value) {
    emit('action', action, selectedOrder.value)
  } else {
    ElMessage.info(`执行操作: ${action}`)
  }
}

/**
 * 解析时间线步骤描述文本中的高亮标记 [xxx]
 * 将文本按高亮区域拆分为 DescPart 数组，标记为 'highlight' 类型的部分使用高亮样式渲染
 * @param step 时间线步骤对象
 * @returns 拆分后的文本片段数组，每项包含 text 和 type（'' | 'highlight'）
 */
const parseDescription = (step: TimelineStep): DescPart[] => {
  const parts: DescPart[] = []
  const text = step.description
  // 匹配 [xxx] 格式的高亮文本
  const regex = /\[([^\]]+)\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), type: '' })
    }
    parts.push({ text: match[1], type: 'highlight' })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), type: '' })
  }

  if (parts.length === 0) {
    parts.push({ text, type: '' })
  }

  return parts
}
</script>

<style scoped>
.work-order-manager {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.maintenance-main {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* 左侧面板 */
.left-panel {
  position: relative;
  width: 50%;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

}

.left-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.left-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.panel-header {
  margin-bottom: 4px;
  width: 50%;
  background-image: url('/images/title@2x.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: left center;
  padding-left: 36px;
  height: 49px;
  display: flex;
  align-items: center;
}

.panel-title {
  font-size: 24px;
  font-weight: 500;
    font-style: italic;
  color: #D5F2FF;
}

/* 搜索栏 */
.search-bar {
  padding: 12px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-bottom: 1px solid rgba(129, 211, 248, 0.1);
}

.search-input {
  flex: 1;
  min-width: 160px;
  padding: 6px 10px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: #fff;
  font-size: 13px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.filter-select {
  min-width: 230px;
  padding: 6px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: #fff;
  font-size: 13px;
  outline: none;
  cursor: pointer;
}

.filter-select option {
  background: #0a1628;
  color: #fff;
}

/* 日期范围选择器 - 宽度由 JS 动态同步搜索框实际渲染宽度 */
/* （深色主题样式已移至 src/assets/index.css 全局 CSS） */

.btn-search {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 4px;
  background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%);
  color: #fff;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-search:hover {
  opacity: 0.9;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 4px;
  background: linear-gradient(135deg, #FF9F43 0%, #E67E22 100%);
  color: #fff;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-export:hover {
  opacity: 0.9;
}

/* 表格 */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 12px;
}

.work-order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

.work-order-table th {
  padding: 10px 5px;
  text-align: center;
  font-weight: 600;
  color: #02A7F0;
  background: rgba(2, 167, 240, 0.08);
  border-bottom: 1px solid rgba(129, 211, 248, 0.15);
  white-space: nowrap;
}

.work-order-table th:nth-child(1) { width: 130px; }
.work-order-table th:nth-child(2) { width: 120px; }
.work-order-table th:nth-child(3) { width: 72px; }
.work-order-table th:nth-child(4) { width: 130px; }
.work-order-table th:nth-child(5) { width: 72px; }

.work-order-table td {
  padding: 10px 5px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(129, 211, 248, 0.06);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-order-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}

.work-order-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.05);
}

.work-order-table tbody tr.row-active {
  background: rgba(2, 167, 240, 0.1);
  border: 1px solid rgba(2, 167, 240, 0.4);
  border-radius: 6px;
}

/* 标签 */
.level-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.level-tag.urgent {
  background: rgba(255, 77, 77, 0.2);
  color: #FF4D4D;
}

.level-tag.important {
  background: rgba(255, 159, 67, 0.2);
  color: #FF9F43;
}

.level-tag.normal {
  background: rgba(74, 158, 255, 0.2);
  color: #4A9EFF;
}

.status-tag.processing {
  background: rgba(123, 104, 238, 0.15);
  color: #7B68EE;
}

.status-tag.dispatched {
  background: rgba(74, 158, 255, 0.15);
  color: #4A9EFF;
}

.status-tag.completed {
  background: rgba(76, 175, 80, 0.15);
  color: #4CAF50;
}

.status-tag.archived {
  background: rgba(136, 136, 136, 0.15);
  color: #888;
}

.status-tag.pending {
  background: rgba(255, 159, 67, 0.15);
  color: #FF9F43;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  border-radius: 12px;
  overflow-y: auto;
  display: flex;
  position: relative;
  flex-direction: column;
  padding: 18px 20px;
  gap: 16px;
}
.right-panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.right-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.detail-header {
  display: flex;
      justify-content: space-between;
    align-items: center;
  border-bottom: 1px solid ;
  border-image: linear-gradient(90deg, rgba(0, 246, 255, 1), rgba(0, 246, 255, 0)) 1 1;
  padding-bottom: 12px;
}

.detail-title {
  font-size: 16px;
  font-weight: 500;
      font-style: italic;
  color: #fff;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-title-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.detail-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
    background: rgba(255,255,255,0.1);
border-radius: 4px ;
padding: 2px;
}

/* 详情区块 */
.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 500;
  color: #A0B1CC;
  padding: 4px 6px;
  box-shadow:inset 1px 7px 12px 2px rgba(127, 178, 241, 0.1);
border-radius: 0px 0px 0px 0px;
border-top: 1px solid;
border-left: 1px solid;
border-right: 1px solid;
border-image: linear-gradient(360deg, rgba(121, 138, 176, 0), rgba(121, 138, 176, 1)) 1 1;
}



.section-icon {
  color: #02A7F0;
  flex-shrink: 0;
}



.detail-status-tag {
  margin-left: auto;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 3px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.info-value {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.text-green {
  color: #4CAF50;
}

.text-orange {
  color: #FF9F43;
}

.text-gray {
  color: rgba(255, 255, 255, 0.4);
}

/* 告警内容框 */
.alert-content-box {
  /* padding: 12px 14px; */
  border-radius: 6px;
  /* background: rgba(26, 43, 69, 0.6);
  border: 1px solid rgba(129, 211, 248, 0.08); */
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.6;
}

/* 时间线 */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-left: 8px;
}

.timeline-item {
  display: flex;
  gap: 0;
  padding-bottom: 16px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 5.5px;
  top: 20px;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.2) 0,
    rgba(255, 255, 255, 0.2) 3px,
    transparent 3px,
    transparent 6px
  );
}

.timeline-item:last-child::before {
  display: none;
}

/* 连接线颜色跟随圆点状态 */
.timeline-item.done::before {
  background: repeating-linear-gradient(
    to bottom,
    rgba(76, 175, 80, 0.45) 0,
    rgba(76, 175, 80, 0.45) 3px,
    transparent 3px,
    transparent 6px
  );
}

.timeline-item.active::before {
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 159, 67, 0.45) 0,
    rgba(255, 159, 67, 0.45) 3px,
    transparent 3px,
    transparent 6px
  );
}

.timeline-item.pending::before {
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.2) 0,
    rgba(255, 255, 255, 0.2) 3px,
    transparent 3px,
    transparent 6px
  );
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 10px;
  position: relative;
  z-index: 1;
  background: #0a1628;
}

/* 圆点中心小白点 */
.timeline-dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff;
}

.timeline-item.done .timeline-dot {
  border: 2px solid #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.15);
}

.timeline-item.active .timeline-dot {
  border: 2px solid #FF9F43;
  box-shadow: 0 0 0 2px rgba(255, 159, 67, 0.15);
}

.timeline-item.pending .timeline-dot {
  border: 2px solid rgba(255, 255, 255, 0.25);
}

.timeline-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-name {
  width:290px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  display: inline-block;
  padding: 8px 13px 8px 19px;
  position: relative;
  border-radius: 2px;
}

/* 已完成 - 绿色背景图 */
.timeline-name.name-done {
  background: url('/images/Completed.png') no-repeat left center / 100% 100%;
}

/* 进行中 - 橙色背景图 */
.timeline-name.name-active {
  background: url('/images/inProgress.png') no-repeat left center / 100% 100%;
}

/* 待处理 - 蓝色背景图 */
.timeline-name.name-pending {
  background: url('/images/Pending.png') no-repeat left center / 100% 100%;
}

.timeline-time {
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  padding: 2px 8px;
  border-radius: 2px;
}

/* 已完成 - 绿色背景 */
.timeline-time.time-done {
color: #34C759;
  background-color: rgba(76, 175, 80, 0.25);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

/* 进行中 - 橙色背景 */
.timeline-time.time-active {
  color: #FF9500;
  background-color: rgba(255, 159, 67, 0.25);
  border: 1px solid rgba(255, 159, 67, 0.5);
}

/* 待处理 - 蓝色背景 */
.timeline-time.time-pending {
  color: #02A7F0;
  background-color: rgba(2, 167, 240, 0.12);
  border: 1px solid rgba(2, 167, 240, 0.3);
}

.timeline-desc {
  font-size: 12px;
  color: rgb(255, 255, 255);
  line-height: 1.5;
  padding: 12px;
  background: rgba(0,0,0,0.2);
border: 1px solid rgba(61,115,255,0.3);
margin: 8px 0 0 12px;
}

.timeline-desc .highlight {
  color: #02A7F0;
  font-weight: 500;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  min-width: 100px;
  padding: 12px 12px 12px 32px;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  color: #fff;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn.re-dispatch {
  background: url('/images/redispatch.png') no-repeat center / 100% 100%;
}

.action-btn.update-progress {
  background: url('/images/UpdateProgress.png') no-repeat center / 100% 100%;
}

.action-btn.submit-check {
  background: url('/images/SubmitAcceptance.png') no-repeat center / 100% 100%;
}

.action-btn.archive {
  background: url('/images/ArchivedTicket.png') no-repeat center / 100% 100%;
}

/* 空状态 */
.empty-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.empty-detail p {
  font-size: 14px;
}
</style>


