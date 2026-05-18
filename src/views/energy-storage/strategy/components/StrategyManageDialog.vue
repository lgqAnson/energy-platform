<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="$emit('update:visible', false)">
        <div class="strategy-modal" @click.stop>
          <!-- 弹窗标题 -->
          <div class="modal-header">
            <div class="modal-title">
              <Zap class="modal-title-icon" />
              <span>充放电策略管理</span>
            </div>
            <button class="modal-close" @click="$emit('update:visible', false)">
              <X />
            </button>
          </div>

          <!-- 搜索栏 -->
          <div class="strategy-modal-toolbar">
            <input v-model="search.keyword" type="text" placeholder="搜索策略名称/创建人" class="toolbar-input" />
            <select v-model="search.status" class="toolbar-select">
              <option value="">全部状态</option>
              <option value="enabled">启用</option>
              <option value="disabled">禁用</option>
            </select>
            <button class="toolbar-btn btn-reset" @click="resetSearch">
              <RotateCcw class="btn-icon-sm" />
              <span>重置</span>
            </button>
            <div class="toolbar-spacer"></div>
            <button class="toolbar-btn btn-primary" @click="openForm('add')">
              <Plus class="btn-icon-sm" />
              <span>新建策略</span>
            </button>
            <button class="toolbar-btn btn-export-sm" :disabled="exporting" @click="handleExport">
              <FileSpreadsheet class="btn-icon-sm" />
              <span>{{ exporting ? '导出中...' : '导出数据' }}</span>
            </button>
          </div>

          <!-- 策略列表 -->
          <div class="strategy-list-wrap">
            <table class="strategy-list-table">
              <thead>
                <tr>
                  <th>策略名称</th>
                  <th>类型</th>
                  <th>创建人</th>
                  <th>创建时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in list" :key="idx" :class="{ active: selected === idx, even: idx % 2 === 1 }" @click="selected = idx">
                  <td>{{ row.name }}</td>
                  <td>{{ row.type }}</td>
                  <td>{{ row.creator }}</td>
                  <td>{{ row.createTime }}</td>
                  <td><span class="status-tag" :class="row.status">{{ row.status === 'enabled' ? '启用' : '禁用' }}</span></td>
                  <td>
                    <div class="action-icons">
                      <button class="icon-btn" title="编辑" @click.stop="openForm('edit', idx)"><Pencil class="icon-sm" /></button>
                      <button class="icon-btn" title="删除" @click.stop="$emit('delete', idx)"><Trash2 class="icon-sm" /></button>
                      <button class="icon-btn" title="查看" @click.stop="openForm('view', idx)"><Eye class="icon-sm" /></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 策略变更追溯 -->
          <div class="trace-section">
            <div class="trace-title">
              <Search class="trace-title-icon" />
              <span>策略变更追溯</span>
            </div>
            <div class="trace-content">
              <!-- 双区布局：区域1(最新版本固定) + 区域2(历史版本横向滚动) -->
              <div class="trace-timeline-h">
                <!-- ====== 区域1：最新版本（始终固定显示） ====== -->
                <div class="zone-fixed">
                  <div v-if="latestVersion" class="version-col">
                    <div class="version-badge" :class="{ 'is-current': latestVersion.isCurrent, 'is-initial': latestVersion.isInitial }">
                      <span class="badge-dot"></span>
                      {{ latestVersion.label }}
                    </div>
                    <div class="version-vline"></div>
                    <div class="version-body">
                      <div v-if="latestVersion.time" class="version-meta">
                        <span class="meta-label">修改时间:</span><span class="meta-value meta-orange">{{ latestVersion.time }}</span>
                      </div>
                      <div v-if="latestVersion.createTime" class="version-meta">
                        <span class="meta-label">创建时间:</span><span class="meta-value meta-blue">{{ latestVersion.createTime }}</span>
                      </div>
                      <div v-if="latestVersion.operator" class="version-meta">
                        <span class="meta-label">修改人:</span><span class="meta-value meta-orange">{{ latestVersion.operator }}</span>
                      </div>
                      <div v-if="latestVersion.creator" class="version-meta">
                        <span class="meta-label">创建人:</span><span class="meta-value meta-blue">{{ latestVersion.creator }}</span>
                      </div>
                      <div class="change-items">
                        <div v-for="(item, cidx) in latestVersion.changeItems" :key="cidx" class="change-item-box">{{ item }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ====== 区域间连接器：仅当历史版本存在时显示 ====== -->
                <div v-if="historyVersions.length > 0" class="zone-connector">
                  <div class="conn-line"></div>
                  <div class="conn-arrow"><ChevronRight class="arrow-icon" /></div>
                </div>

                <!-- ====== 区域2：历史版本列表（横向滚动） ====== -->
                <div v-if="historyVersions.length > 0" class="zone-scrollable-wrap">
                  <div class="zone-scrollable">
                    <template v-for="(ver, hidx) in historyVersions" :key="'h-' + hidx">
                      <div class="version-col">
                        <div class="version-badge" :class="{ 'is-current': ver.isCurrent, 'is-initial': ver.isInitial }">
                          <span class="badge-dot"></span>
                          {{ ver.label }}
                        </div>
                        <div class="version-vline"></div>
                        <div class="version-body">
                          <div v-if="ver.time" class="version-meta">
                            <span class="meta-label">修改时间:</span><span class="meta-value meta-orange">{{ ver.time }}</span>
                          </div>
                          <div v-if="ver.createTime" class="version-meta">
                            <span class="meta-label">创建时间:</span><span class="meta-value meta-blue">{{ ver.createTime }}</span>
                          </div>
                          <div v-if="ver.operator" class="version-meta">
                            <span class="meta-label">修改人:</span><span class="meta-value meta-orange">{{ ver.operator }}</span>
                          </div>
                          <div v-if="ver.creator" class="version-meta">
                            <span class="meta-label">创建人:</span><span class="meta-value meta-blue">{{ ver.creator }}</span>
                          </div>
                          <div class="change-items">
                            <div v-for="(item, cidx) in ver.changeItems" :key="cidx" class="change-item-box">{{ item }}</div>
                          </div>
                        </div>
                      </div>
                      <!-- 历史版本内部连接器 -->
                      <div v-if="hidx < historyVersions.length - 1" class="version-connector">
                        <div class="conn-line"></div>
                        <div class="conn-arrow"><ChevronRight class="arrow-icon" /></div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 策略配置表单弹窗 -->
  <StrategyFormDialog
    v-model:visible="formVisible"
    :mode="formMode"
    @save="onSaveForm"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Zap, RotateCcw, Plus, Pencil, Trash2, Eye, Search, FileSpreadsheet, ChevronRight } from 'lucide-vue-next'
import { exportToExcel, filenameWithDate, type ExportColumn } from '@/composables/useExport'
import StrategyFormDialog from './StrategyFormDialog.vue'

interface StrategyItem {
  name: string
  type: string
  creator: string
  createTime: string
  status: 'enabled' | 'disabled'
}

interface TraceVersion {
  label: string
  isCurrent?: boolean
  isInitial?: boolean
  time?: string
  createTime?: string
  operator?: string
  creator?: string
  /** 变更项面板文字（每条独立显示在边框盒内） */
  changeItems: string[]
}

interface TraceData {
  name: string
  currentVersion: string
  versions: TraceVersion[]
}

const props = defineProps<{
  visible: boolean
  list: StrategyItem[]
  trace: TraceData
}>()

defineEmits<{
  'update:visible': [value: boolean]
  add: []
  edit: [index: number]
  delete: [index: number]
  view: [index: number]
}>()

const search = ref({ keyword: '', status: '' })
const selected = ref(0)
const exporting = ref(false)

/** 区域1：最新/当前版本（固定显示，不参与滚动） */
const latestVersion = computed(() => props.trace.versions[0] ?? null)
/** 区域2：历史版本列表（支持横向滚动） */
const historyVersions = computed(() => props.trace.versions.slice(1))

const exportColumns: ExportColumn[] = [
  { header: '策略名称', key: 'name' },
  { header: '类型', key: 'type' },
  { header: '创建人', key: 'creator' },
  { header: '创建时间', key: 'createTime' },
  { header: '状态', key: 'status' }
]

function handleExport() {
  if (exporting.value) return
  exporting.value = true
  const data = props.list.map(item => ({
    ...item,
    status: item.status === 'enabled' ? '启用' : '禁用'
  }))
  exportToExcel(data, exportColumns, filenameWithDate('充放电策略管理'))
  exporting.value = false
}

/** 重置搜索条件（关键词和状态筛选） */
function resetSearch() {
  search.value.keyword = ''
  search.value.status = ''
}

// 策略表单弹窗
const formVisible = ref(false)
const formMode = ref<'add' | 'edit' | 'view'>('add')

/**
 * 打开策略表单弹窗（新增 / 编辑 / 查看）
 * @param mode 表单模式
 * @param index 编辑或查看时对应的策略索引（可选）
 */
function openForm(mode: 'add' | 'edit' | 'view', index?: number) {
  formMode.value = mode
  formVisible.value = true
}

/**
 * 策略表单保存回调
 * @param data 表单提交的策略数据
 */
function onSaveForm(data: any) {
  // TODO: 实际保存逻辑
  console.log('save strategy:', data)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.strategy-modal {
  width: 85vw;
  max-width: 900px;
  max-height: 88vh;
  background: linear-gradient(180deg, #1a2a3e 0%, #132233 100%);
  border: 1px solid rgba(2, 167, 240, 0.25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(2, 167, 240, 0.15);
  flex-shrink: 0;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #02A7F0;
}

.modal-title-icon {
  width: 20px;
  height: 20px;
  color: #FAAD14;
}

.modal-close {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 4px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.strategy-modal-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.toolbar-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 12px;
  color: #fff;
  outline: none;
  width: 180px;
}

.toolbar-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.toolbar-input:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.toolbar-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
  color: #fff;
  outline: none;
}

.toolbar-select option {
  background: #1a2a3e;
  color: #fff;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 4px;
  padding: 5px 14px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-icon-sm {
  width: 13px;
  height: 13px;
}

.toolbar-spacer {
  flex: 1;
}

.btn-reset {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-primary {
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.85) 0%, rgba(2, 167, 240, 0.6) 100%);
  color: #fff;
  border: 1px solid rgba(2, 167, 240, 0.5);
}

.btn-primary:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.8) 100%);
  box-shadow: 0 0 10px rgba(2, 167, 240, 0.3);
}

.btn-export-sm {
  background: linear-gradient(90deg, rgba(250, 173, 20, 0.85) 0%, rgba(250, 173, 20, 0.6) 100%);
  color: #fff;
  border: 1px solid rgba(250, 173, 20, 0.5);
}

.btn-export-sm:hover {
  background: linear-gradient(90deg, rgba(250, 173, 20, 1) 0%, rgba(250, 173, 20, 0.8) 100%);
  box-shadow: 0 0 10px rgba(250, 173, 20, 0.3);
}

.strategy-list-wrap {
  max-height: 220px;
  overflow: auto;
  padding: 0 20px;
  flex-shrink: 0;
}

.strategy-list-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.strategy-list-table thead {
  position: sticky;
  top: 0;
  z-index: 5;
}

.strategy-list-table th {
  background: rgba(2, 167, 240, 0.12);
  color: #02A7F0;
  font-weight: 600;
  padding: 9px 8px;
  text-align: center;
  border-bottom: 1px solid rgba(2, 167, 240, 0.2);
  white-space: nowrap;
}

.strategy-list-table td {
  padding: 8px 8px;
  text-align: center;
  color: rgba(255, 255, 255, 0.85);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
  cursor: pointer;
}

.strategy-list-table tbody tr:hover {
  background: rgba(2, 167, 240, 0.08);
}

.strategy-list-table tbody tr.even {
  background: rgba(255, 255, 255, 0.02);
}

.strategy-list-table tbody tr.active {
  background: rgba(2, 167, 240, 0.15);
}

.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 3px;
  font-size: 11px;
}

.status-tag.enabled {
  background: rgba(82, 196, 26, 0.18);
  color: #52C41A;
}

.status-tag.disabled {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
}

.action-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  transition: color 0.15s;
}

.icon-btn:hover {
  color: #02A7F0;
}

.icon-sm {
  width: 14px;
  height: 14px;
}

/* ====== 策略变更追溯（水平时间线） ====== */
.trace-section {
  padding: 12px 20px 18px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.trace-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #02A7F0;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.trace-title-icon {
  width: 16px;
  height: 16px;
  color: #FAAD14;
}

.trace-content {
  background: rgba(10, 22, 40, 0.6);
  border: 1px solid rgba(2, 167, 240, 0.15);
  border-radius: 6px;
  padding: 16px 20px 20px;
  flex: 1;
  overflow: hidden; /* 外层不滚动，由内部 zone 控制 */
}

/** 水平时间线外容器（双区 flex 布局） */
.trace-timeline-h {
  display: flex;
  align-items: stretch;
  height: 100%;
  gap: 0;
}

/* ====== 区域1：最新版本（固定，不参与滚动） ====== */
.zone-fixed {
  flex-shrink: 0;
  width: 220px;
  display: flex;
  align-items: stretch;
}
.zone-fixed .version-col { max-width: none; }

/* ====== 区域间连接器（区域1 → 区域2） ====== */
.zone-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  flex-shrink: 0;
  padding-top: 10px;
  position: relative;
}

/* ====== 区域2：历史版本（横向滚动） ====== */
.zone-scrollable-wrap {
  flex: 1;
  min-width: 0; /* 允许 flex 子项收缩 */
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.zone-scrollable {
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow-x: auto;
  overflow-y: hidden;
  /** 隐藏滚动条（保持可滚动手势） */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}
.zone-scrollable::-webkit-scrollbar { display: none; }

/* ---- 单个版本列 ---- */
.version-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  min-width: 180px;
  max-width: 220px;
}

/* ---- 版本标签（顶部徽章） ---- */
.version-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px 5px 10px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(230, 235, 245, 0.9);
  background: linear-gradient(135deg, rgba(30, 55, 90, 0.9) 0%, rgba(20, 40, 70, 0.9) 100%);
  border: 1px solid rgba(59, 130, 246, 0.45);
  border-radius: 4px;
  white-space: nowrap;
  z-index: 2;
  clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
}

/** 当前版本：金色高亮 */
.version-badge.is-current {
  color: #FFD666;
  border-color: rgba(250, 173, 20, 0.6);
  background: linear-gradient(135deg, rgba(80, 60, 10, 0.85) 0%, rgba(50, 38, 8, 0.85) 100%);
  box-shadow: 0 0 10px rgba(250, 173, 20, 0.15);
}

/** 初始版本：蓝色高亮 */
.version-badge.is-initial {
  border-color: rgba(37, 99, 235, 0.55);
  background: linear-gradient(135deg, rgba(25, 50, 90, 0.9) 0%, rgba(15, 35, 65, 0.9) 100%);
}

/** 标签左侧圆点 */
.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #3B82F6;
  flex-shrink: 0;
}
.version-badge.is-current .badge-dot { background: #FAAD14; }
.version-badge.is-initial .badge-dot { background: #2563EB; }

/* ---- 垂直连接线（标签下方到内容区） ---- */
.version-vline {
  width: 2px;
  flex: 1;
  min-height: 16px;
  background: repeating-linear-gradient(
    180deg,
    rgba(59, 130, 246, 0.3) 0,
    rgba(59, 130, 246, 0.3) 4px,
    transparent 4px,
    transparent 8px
  );
  margin-top: 4px;
}

/* ---- 版本内容体 ---- */
.version-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

/** 元信息行（修改时间/人/创建时间/人） */
.version-meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11.5px;
  line-height: 1.5;
}

.meta-label {
  color: rgba(200, 210, 225, 0.7);
  white-space: nowrap;
  flex-shrink: 0;
}

.meta-value {
  font-weight: 500;
}
.meta-value.meta-orange { color: #F5A623; }
.meta-value.meta-blue   { color: #5B9BFF; }

/* ---- 变更项面板列表 ---- */
.change-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 4px;
}

.change-item-box {
  background: rgba(15, 28, 50, 0.75);
  border: 1px solid rgba(60, 90, 140, 0.25);
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 11.5px;
  color: rgba(220, 228, 240, 0.88);
  line-height: 1.5;
  transition: border-color 0.2s;
}
.change-item-box:hover {
  border-color: rgba(2, 167, 240, 0.35);
}

/* ---- 版本间连接器（水平线 + 箭头图标圆圈） ---- */
.version-connector {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  flex-shrink: 0;
  padding-top: 10px; /* 与 badge 高度对齐 */
  position: relative;
}

.conn-line {
  width: 100%;
  height: 1.5px;
  background: repeating-linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.35) 0,
    rgba(59, 130, 246, 0.35) 3px,
    transparent 3px,
    transparent 6px
  );
}

/** 箭头圆形按钮 */
.conn-arrow {
  position: absolute;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(15, 26, 48, 0.95);
  border: 1.5px solid rgba(59, 130, 246, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

.arrow-icon {
  width: 12px;
  height: 12px;
  color: #5B9BFF;
}
</style>
