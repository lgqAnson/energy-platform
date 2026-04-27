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
            <button class="toolbar-btn btn-export-sm">
              <FileSpreadsheet class="btn-icon-sm" />
              <span>导出数据</span>
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
              <div class="trace-current">
                <div class="trace-current-name">{{ trace.name }}</div>
                <div class="trace-current-version">当前版本: {{ trace.currentVersion }}</div>
              </div>
              <div class="trace-timeline">
                <div v-for="(ver, vidx) in trace.versions" :key="vidx" class="trace-version">
                  <div class="version-header">
                    <span class="version-label" :class="{ current: ver.isCurrent }">{{ ver.label }}</span>
                    <span v-if="ver.time" class="version-time">修改时间: {{ ver.time }}</span>
                    <span v-if="ver.operator" class="version-operator">修改人: {{ ver.operator }}</span>
                  </div>
                  <ul class="version-changes">
                    <li v-for="(change, cidx) in ver.changes" :key="cidx">{{ change }}</li>
                  </ul>
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
import { ref } from 'vue'
import { X, Zap, RotateCcw, Plus, Pencil, Trash2, Eye, Search, FileSpreadsheet } from 'lucide-vue-next'
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
  time?: string
  operator?: string
  changes: string[]
}

interface TraceData {
  name: string
  currentVersion: string
  versions: TraceVersion[]
}

defineProps<{
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

function resetSearch() {
  search.value.keyword = ''
  search.value.status = ''
}

// 策略表单弹窗
const formVisible = ref(false)
const formMode = ref<'add' | 'edit' | 'view'>('add')

function openForm(mode: 'add' | 'edit' | 'view', index?: number) {
  formMode.value = mode
  formVisible.value = true
}

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

.trace-section {
  padding: 12px 20px 16px;
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
  margin-bottom: 10px;
  flex-shrink: 0;
}

.trace-title-icon {
  width: 16px;
  height: 16px;
  color: #FAAD14;
}

.trace-content {
  background: rgba(10, 22, 40, 0.5);
  border: 1px solid rgba(2, 167, 240, 0.15);
  border-radius: 6px;
  padding: 12px 16px;
  overflow: auto;
  flex: 1;
}

.trace-current {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 10px;
}

.trace-current-name {
  font-size: 14px;
  font-weight: 600;
  color: #02A7F0;
  margin-bottom: 4px;
}

.trace-current-version {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.trace-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-version {
  position: relative;
  padding-left: 14px;
}

.trace-version::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(2, 167, 240, 0.5);
}

.trace-version:first-child::before {
  background: #52C41A;
}

.version-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.version-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.version-label.current {
  color: #52C41A;
}

.version-time,
.version-operator {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.version-changes {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.version-changes li {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  padding: 2px 0;
  position: relative;
  padding-left: 12px;
}

.version-changes li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}
</style>
