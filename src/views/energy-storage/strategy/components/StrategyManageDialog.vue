<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" >
        <div class="strategy-modal" @click.stop>
          <!-- 弹窗标题 -->
          <div class="modal-header">
            <div class="modal-title">
              <span class="title-bar-icon"></span>
              <span>充放电策略管理</span>
            </div>
            <button class="modal-close" @click="$emit('update:visible', false)">
              <img src="/icons/close.png" alt="关闭" class="modal-close-icon" />
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
            <table class="data-table">
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
                <tr v-for="(row, idx) in list" :key="idx" :class="{ active: selected === idx }" @click="selected = idx">
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
              <span class="title-bar-icon"></span>
              <span>策略变更追溯</span>
            </div>
            <div class="trace-content" ref="traceContentRef">
              <!-- 双区布局：区域1(最新版本固定) + 区域2(历史版本横向滚动) -->
              <div class="trace-timeline-h">
                <!-- ====== 区域1：最新版本（始终固定显示） ====== -->
                <div class="zone-fixed">
                  <div v-if="latestVersion" class="version-col">
                    <div class="version-badge" :class="{ 'is-current': latestVersion.isCurrent, 'is-initial': latestVersion.isInitial }">
                      <!-- <span class="badge-dot"></span> -->
                      {{ latestVersion.label }}
                    </div>
                    <div class="version-vline"></div>
                    <div class="version-body">
                       <div class="version-body-line"></div>
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
                  <div class="conn-arrow">
                    <img src="/icons/timeLine.png" alt="" class="timeline-icon" />
                  </div>
                </div>

                <!-- ====== 区域2：历史版本列表（横向滚动） ====== -->
                <div v-if="historyVersions.length > 0" class="zone-scrollable-wrap">
                  <div ref="scrollZoneRef" class="zone-scrollable" @mousedown="onScrollDragStart">
                    <template v-for="(ver, hidx) in historyVersions" :key="'h-' + hidx">
                      <div class="version-col">
                        <div class="version-badge" :class="{ 'is-current': ver.isCurrent, 'is-initial': ver.isInitial }">
                          <!-- <span class="badge-dot"></span> -->
                          {{ ver.label }}
                        </div>
                        <div class="version-vline"></div>
                        <div class="version-body">
                           <div class="version-body-line"></div>
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
                        <div class="conn-arrow">
                          <img src="/icons/timeLine.png" alt="" class="timeline-icon" />
                        </div>
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
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { RotateCcw, Plus, Pencil, Trash2, Eye, Search, FileSpreadsheet } from 'lucide-vue-next'
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

/* ====== vline 像素级精确对齐 ====== */

/** trace-content 容器模板引用 */
const traceContentRef = ref<HTMLElement | null>(null)
/** 区域2 横向滚动容器模板引用（支持鼠标拖动滚动） */
const scrollZoneRef = ref<HTMLElement | null>(null)
/** ResizeObserver 实例，监听容器尺寸变化自动重新对齐 */
let resizeObserver: ResizeObserver | null = null

/* ====== 鼠标拖动滚动 ====== */

/** 拖动是否激活中 */
let isDragging = false
/** 拖动起始 X 坐标（屏幕坐标） */
let dragStartX = 0
/** 拖动起始时的 scrollLeft 值 */
let dragStartScrollLeft = 0

/**
 * 鼠标按下：开始拖动滚动
 * @param e 鼠标事件
 */
function onScrollDragStart(e: MouseEvent) {
  const el = scrollZoneRef.value
  if (!el || e.button !== 0) return // 仅响应左键
  isDragging = true
  dragStartX = e.pageX
  dragStartScrollLeft = el.scrollLeft
  document.addEventListener('mousemove', onScrollDragMove)
  document.addEventListener('mouseup', onScrollDragEnd)
  /** 阻止默认选中文本行为 */
  e.preventDefault()
}

/**
 * 鼠标移动：根据拖动距离更新 scrollLeft
 * @param e 鼠标事件
 */
function onScrollDragMove(e: MouseEvent) {
  if (!isDragging || !scrollZoneRef.value) return
  const dx = e.pageX - dragStartX
  scrollZoneRef.value.scrollLeft = dragStartScrollLeft - dx
}

/**
 * 鼠标松开：结束拖动，清理事件监听
 */
function onScrollDragEnd() {
  isDragging = false
  document.removeEventListener('mousemove', onScrollDragMove)
  document.removeEventListener('mouseup', onScrollDragEnd)
}

/**
 * 遍历所有版本列，测量 DOM 位置后为每个 .version-vline 设置精确 top 和 height，
 * 使 vline 起点与 badge::after 圆心像素级对齐，末端与 body-line 垂直中心像素级对齐
 */
function alignVlines() {
  const container = traceContentRef.value
  if (!container) return
  const cols = container.querySelectorAll('.version-col')
  cols.forEach((col) => {
    const badge = col.querySelector('.version-badge') as HTMLElement | null
    const vline = col.querySelector('.version-vline') as HTMLElement | null
    const body = col.querySelector('.version-body') as HTMLElement | null
    if (!badge || !vline || !body) return
    /** badge::after { bottom: 10px; } → 圆心距 badge 底部 = 10 + 半径(4) = 14px */
    /** 圆心相对于 version-col 的 Y 坐标 = badge顶部偏移 + badge高度 - 14 */
    const dotCenterY = (badge as unknown as { offsetTop: number }).offsetTop + badge.offsetHeight - 14
    /** body 相对于 version-col 的顶部偏移（含 margin-top） */
    const bodyTop = (body as unknown as { offsetTop: number }).offsetTop
    /** body 高度的一半（body-line 垂直居中位置） */
    const bodyLineCenterY = body.offsetHeight / 2
    /** vline 需要的精确高度：从圆心延伸至 body-line 中心 */
    const preciseHeight = Math.max(bodyTop + bodyLineCenterY - dotCenterY, 20)
    vline.style.top = `${dotCenterY}px`
    vline.style.height = `${preciseHeight}px`
  })
}

/** 弹窗可见时，等待 DOM 渲染完成后执行对齐并启动 ResizeObserver 监听 */
watch(
  () => props.visible,
  async (val) => {
    if (val) {
      await nextTick()
      alignVlines()
      // 使用 ResizeObserver 监听容器/内容尺寸变化（如字体加载、动态数据更新等）
      if (!resizeObserver && traceContentRef.value) {
        resizeObserver = new ResizeObserver(() => alignVlines())
        resizeObserver.observe(traceContentRef.value)
      }
    } else {
      // 弹窗关闭时释放 observer
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
    }
  }
)

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})
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
  width: 1160px;
  max-width: 900px;
  max-height: 88vh;
  padding:16px;
  background: rgba(21,20,20,0.4) ;
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
  padding: 10px 16px;
  flex-shrink: 0;
  background-image: url('/images/popUpsTitleBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  font-style: italic;
}

.title-bar-icon {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #FAAD14 0%, #F59E0B 100%);
  border-radius: 1px;
  flex-shrink: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.modal-close:hover {
  opacity: 0.7;
}

.modal-close-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
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
  padding: 12px 0;
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

/* data-table 基础样式已提取至全局 src/assets/index.css，此处仅保留组件特有覆盖 */
.strategy-list-wrap {
  max-height: 220px;
  overflow: auto;
  padding: 0;
  flex-shrink: 0;
}

.data-table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}

.data-table tbody tr.active {
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
  margin-top:12px;
  padding: 12px 0 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.trace-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  padding: 10px 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
  background-image: url('/images/popUpsTitleBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  font-style: italic;
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
  width: 190px;
  display: flex;
  align-items: stretch;
}
.zone-fixed .version-col { max-width: none; }

/* ====== 区域间连接器（区域1 → 区域2） ====== */
.zone-connector {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100px;
  flex-shrink: 0;
  position: relative;
}

/* ====== 区域2：历史版本（横向滚动，占满剩余空间） ====== */
.zone-scrollable-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

.zone-scrollable {
  display: flex;
  align-items: stretch;
  padding-left: 2px;
  gap: 0;
  min-width: 0;
  overflow-x: auto;
  overflow-y: visible; /* 允许垂直方向溢出，避免裁剪端点圆点 */
  /** 隐藏滚动条（保持可滚动手势） */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  /** 拖动滚动光标：grab 抓手 → grabbing 抓取中 */
  cursor: grab;
  user-select: none; /* 拖动时禁止选中文本 */
}
.zone-scrollable:active { cursor: grabbing; }
.zone-scrollable::-webkit-scrollbar { display: none; }

/* ---- 单个版本列 ---- */
.version-col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 190px;
  overflow: visible; /* 确保 badge::after 端点圆点不被裁剪 */
}

/* ---- 版本标签（顶部徽章） ---- */
.version-badge {
  position: relative;
  display: inline-flex;
  font-style: italic;
  align-items: center;
  width: 190px;
  gap: 6px;
  padding: 5px 14px 5px 18px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(230, 235, 245, 0.9);
  background-image: url('/images/versionOld.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  white-space: nowrap;
  z-index: 2;
  overflow: visible; /* 确保 ::after 端点圆点不被裁剪 */
}

/** 当前版本：使用最新版本背景图 */
.version-badge.is-current {
  color: #FFD666;
  background-image: url('/images/versionNew.png');
}

/** 标签左侧圆点（带深色边框的白色填充） */
.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #1e293b;
  flex-shrink: 0;
}
.version-badge.is-current .badge-dot { border-color: #FAAD14; }
.version-badge.is-initial .badge-dot { border-color: #2563EB; }

/** 标签底部端点圆点（::after，连接到内容区） */
.version-badge::after {
  content: '';
  position: absolute;
  left: -4px;
  bottom: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #1e293b;
  z-index: 3;
}
.version-badge.is-current::after {
  border-color: #FAAD14;
}

/* ---- 垂直连接线（top/height 由 JS 动态计算） ---- */
.version-vline {
  position: absolute;
  left: -1px; /* 对齐 badge-dot 水平中心 */
  /* top 由 alignVlines() 设置为 badge::after 圆心精确 Y */
  /* height 由 alignVlines() 设置为圆心→body-line中心的精确距离 */
  width: 1px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.15) 100%);
}
/* 当前版本使用金黄色渐变 */
.version-col:has(.version-badge.is-current) .version-vline {
  background: linear-gradient(180deg, rgba(250, 173, 20, 0.7) 0%, rgba(250, 173, 20, 0.15) 100%);
}

/* ---- 版本内容体 ---- */
.version-body {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
  margin-left: 12px;
  padding: 12px 14px 12px 20px;
  box-shadow:inset 20px 0px 20px 0px rgba(53, 71, 100, 0.3), inset 1px 1px 4px rgba(53, 71, 100, 0.66);
border-radius: 0px 0px 0px 0px;
border-left: 2px solid;
border-image: linear-gradient(270deg, rgba(53, 71, 100, 0), rgba(53, 71, 100, 0.66)) 2 2;
}

.version-body-line{
 position: absolute;
    left: -14px;
    top: calc(50% - 1px); /* 垂直居中于容器，减去线条半高(1px)使中心对齐 */
  width: 12px;
  height: 2px;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.7) 0%, rgba(59, 130, 246, 0.2) 100%);
}
.version-col:has(.version-badge.is-current) .version-body-line{
   background: linear-gradient(90deg, rgba(250, 173, 20, 0.8) 0%, rgba(250, 173, 20, 0.2) 100%);
}
.version-body::after {
  content: '';
  position: absolute;
  left: -5px;
  top: 50%;
  transform: translateY(-50%); /* 垂直居中，与 body-line 同一水平线 */
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #1e293b;
  z-index: 3;
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

/* ---- 版本间连接器（水平虚线 + 中间时间线图标） ---- */
.version-connector {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100px;
  flex-shrink: 0;
  position: relative;
}

.zone-connector {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100px;
  flex-shrink: 0;
  position: relative;
}

.conn-line {
  position: absolute;
  top: 13px; /* 对齐到版本标签的圆点垂直中心 */
  left: 0;
  right: 0;
  height: 1px;
  background: repeating-linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.5) 0,
    rgba(59, 130, 246, 0.5) 3px,
    transparent 3px,
    transparent 6px
  );
  z-index: 1;
}

/** 连接线中间的时间线图标 */
.conn-arrow {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}

.timeline-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
</style>
