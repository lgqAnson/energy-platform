<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="strategy-form-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <span class="title-bar-icon"></span>
              <span>充放电策略配置</span>
            </div>
            <button class="modal-close" @click="handleClose">
              <img src="/icons/close.png" alt="关闭" class="modal-close-icon" />
            </button>
          </div>

          <!-- 主体（左右非对称双栏布局） -->
          <div class="strategy-form-body">
            <!-- 左栏：基本信息 + 日期选择 -->
            <div class="form-left">
              <div class="form-item">
                <label class="form-label">策略名称</label>
                <input v-model="form.name" type="text" class="form-input" placeholder="请输入策略名称" :readonly="isViewMode" />
              </div>

              <div class="form-item">
                <label class="form-label">策略类型</label>
                <select v-model="form.type" class="form-select" :disabled="isViewMode">
                  <option value="日常策略">日常策略</option>
                  <option value="节假日策略">节假日策略</option>
                  <option value="特殊日策略">特殊日策略</option>
                </select>
              </div>

              <div class="form-item date-item">
                <label class="form-label">适用日期</label>
                <div class="date-tags">
                  <button v-for="tag in dateTags" :key="tag" type="button" class="date-tag" :class="{ active: form.dateTag === tag }" @click="!isViewMode && (form.dateTag = tag)">
                    {{ tag }}
                  </button>
                  <button type="button" class="date-action-btn" title="编辑">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button type="button" class="date-action-btn" title="删除">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                  <button type="button" class="date-action-btn date-add-btn" title="添加">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </button>
                </div>

                <CalendarPicker
                  ref="calendarRef"
                  v-model="form.selectedDates"
                  :disabled="isViewMode"
                />
              </div>
            </div>

            <!-- 右栏：高级控制 + 充放电SOC + 时段表格 + 图表预览 -->
            <div class="form-right">
              <!-- 高级控制区 -->
              <div class="advanced-control-row">
                <label class="section-label">高级控制</label>
                <div class="advanced-toggles">
                  <div class="adv-toggle-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#48CAE4" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    <span class="adv-name">防逆流控制</span>
                    <label class="toggle-switch">
                      <input v-model="form.antiRefluxEnabled" type="checkbox" :disabled="isViewMode" />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="adv-threshold">阈值: 5kW</span>
                  </div>
                  <div class="adv-toggle-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a93a5" stroke-width="2"><line x1="4" y1="6" x2="4" y2="18"/><line x1="9" y1="10" x2="9" y2="18"/><line x1="14" y1="4" x2="14" y2="18"/><line x1="19" y1="8" x2="19" y2="18"/></svg>
                    <span class="adv-name">需量管理</span>
                    <label class="toggle-switch">
                      <input v-model="form.demandEnabled" type="checkbox" :disabled="isViewMode" />
                      <span class="toggle-slider"></span>
                    </label>
                    <span class="adv-threshold">阈值: 800kW</span>
                  </div>
                </div>
              </div>

              <!-- 充电 / 放电 并排 SOC 控制面板 -->
              <div class="soc-panel-row">
                <div class="soc-card charge-card">
                  <div class="soc-card-header">充电</div>
                  <div class="soc-field">
                    <span class="soc-field-label">上限（%）</span>
                    <input v-model.number="form.socChargeLimit" type="number" min="0" max="100" class="soc-value-input charge-value" :disabled="isViewMode" />
                    <span class="soc-unit">%</span>
                  </div>
                  <div class="soc-progress-wrap">
                    <div class="soc-progress-bar charge-bar" :style="{ width: form.socChargeLimit + '%' }"></div>
                  </div>
                </div>
                <div class="soc-card discharge-card">
                  <div class="soc-card-header">放电</div>
                  <div class="soc-field">
                    <span class="soc-field-label">上限（%）</span>
                    <input v-model.number="form.socDischargeLimit" type="number" min="0" max="100" class="soc-value-input discharge-value" :disabled="isViewMode" />
                    <span class="soc-unit">%</span>
                  </div>
                  <div class="soc-progress-wrap">
                    <div class="soc-progress-bar discharge-bar" :style="{ width: form.socDischargeLimit + '%' }"></div>
                  </div>
                </div>
              </div>

              <!-- 充放电时段配置表格 -->
              <div class="period-table-section">
                <div class="table-header-row">
                  <label class="section-label">充放电时段配置</label>
                  <button class="add-period-btn" @click="addPeriodRow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    新增
                  </button>
                </div>
                <div class="period-table-wrap">
                  <table class="period-table">
                    <thead>
                      <tr>
                        <th>生效开始时间</th>
                        <th>生效结束时间</th>
                        <th>充放电类型</th>
                        <th>功率</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, idx) in periodRows" :key="idx">
                        <td>
                          <input v-model="row.startTime" type="time" class="table-time-input" :disabled="isViewMode" />
                          <button class="time-clock-btn" tabindex="-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          </button>
                        </td>
                        <td>
                          <input v-model="row.endTime" type="time" class="table-time-input" :disabled="isViewMode" />
                          <button class="time-clock-btn" tabindex="-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          </button>
                        </td>
                        <td>
                          <select v-model="row.type" class="table-select" :disabled="isViewMode">
                            <option value="充电">充电</option>
                            <option value="放电">放电</option>
                          </select>
                          <button class="type-check-btn" tabindex="-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                          </button>
                        </td>
                        <td>
                          <input v-model.number="row.power" type="number" class="table-power-input" placeholder="--" :disabled="isViewMode" />
                        </td>
                        <td>
                          <button class="del-row-btn" @click="removePeriodRow(idx)" :disabled="isViewMode || periodRows.length <= 1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 策略预览图表 -->
              <div class="chart-section">
                <label class="section-label">策略预览</label>
                <div class="chart-box">
                  <!-- 右上角图例 -->
                  <div class="preview-legend">
                    <span class="legend-item">
                      <span class="legend-pill" style="background: #00FF00" />
                      <span>充电策略配置</span>
                    </span>
                    <span class="legend-item">
                      <span class="legend-pill" style="background: #02A7F0" />
                      <span>放电策略配置</span>
                    </span>
                  </div>
                  <VChart :option="previewOption" autoresize style="width: 100%; flex: 1; min-height: 180px;" />
                </div>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="handleClose">取消</button>
            <button v-if="!isViewMode" type="button" class="btn-save" @click="handleSave">保存策略</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import CalendarPicker from '@/components/business/CalendarPicker.vue'

use([CanvasRenderer, CustomChart, GridComponent, TooltipComponent, LegendComponent])

/* ---------- Props & Emits ---------- */
const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'view'
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: typeof form]
}>()

const isViewMode = computed(() => props.mode === 'view')

/* ---------- Form ---------- */
const dateTags = ['平日', '节假日', '特殊日期']

/** 时段表格行数据结构 */
interface PeriodRow {
  startTime: string
  endTime: string
  type: '充电' | '放电'
  power: number | null
}

/** 表单响应式数据 */
const form = reactive({
  name: '',
  type: '日常策略',
  dateTag: '平日',
  selectedDates: [] as string[],
  chargePower: 150,
  dischargePower: 200,
  socChargeLimit: 95,
  socDischargeLimit: 20,
  antiRefluxEnabled: true,
  demandEnabled: false,
})

/** 充放电时段配置行列表 */
const periodRows = reactive<PeriodRow[]>([
  { startTime: '------', endTime: '------', type: '充电', power: null },
  { startTime: '------', endTime: '------', type: '充电', power: null }
])

const calendarRef = ref<InstanceType<typeof CalendarPicker> | null>(null)

/** 将表单数据重置为默认值，包括日历选择器的清空 */
function resetForm() {
  form.name = ''
  form.type = '日常策略'
  form.dateTag = '平日'
  form.selectedDates = []
  form.chargePower = 150
  form.dischargePower = 200
  form.socChargeLimit = 95
  form.socDischargeLimit = 20
  form.antiRefluxEnabled = true
  form.demandEnabled = true
  periodRows.splice(0, periodRows.length,
    { startTime: '------', endTime: '------', type: '充电', power: null },
    { startTime: '------', endTime: '------', type: '充电', power: null }
  )
  calendarRef.value?.reset()
}

watch(
  () => props.visible,
  (val) => {
    if (val && props.mode === 'add') {
      resetForm()
    }
  }
)

/* ---------- 时段配置操作 ---------- */

/**
 * 新增一行时段配置记录
 */
function addPeriodRow() {
  periodRows.push({ startTime: '00:00', endTime: '08:00', type: '充电', power: 150 })
}

/**
 * 删除指定索引的时段配置行
 * @param idx 要删除的行索引
 */
function removePeriodRow(idx: number) {
  if (periodRows.length > 1) {
    periodRows.splice(idx, 1)
  }
}

/* ---------- Chart Preview（胶囊甘特图，与 StrategyExecutionChart 一致） ---------- */

/**
 * ECharts custom renderItem：绘制胶囊形水平时间段条 + 端点圆点标记
 * 返回一个 group，包含圆角矩形主体 + 左右两端圆形端点（与执行图表风格一致）
 * @param hideRightDot 当与下一段紧密衔接时隐藏右端圆点
 */
function renderGanttItem(
  params: any,
  api: any,
  color: string,
  barHeight: number,
  hideRightDot: boolean
) {
  if (!params || !api) return undefined

  const startX = api.value(0)
  const startY = api.value(1)
  const endX = api.value(2)
  const endY = api.value(3)

  if (startX == null || endX == null || startY == null || endY == null) return undefined

  /** 胶囊半高 = barHeight / 2，用于圆角半径和端点圆点 */
  const halfH = barHeight / 2
  const r = Math.min(halfH, Math.max(halfH * 0.6, 4))
  /** 端点圆点半径：直径与胶囊高度一致 */
  const dotR = halfH

  const coordStart = api.coord([startX, startY])
  const coordEnd = api.coord([endX, endY])

  if (!coordStart || !coordEnd) return undefined

  /** 条形宽度 */
  const w = Math.max(coordEnd[0] - coordStart[0], 1)

  /** 构建子元素数组 */
  const children: any[] = [
    // 胶囊形主体（圆角矩形）
    {
      type: 'rect',
      shape: { x: coordStart[0], y: coordStart[1] - halfH, width: w, height: barHeight, r },
      style: api.style({ fill: color, opacity: 0.88, lineWidth: 0.5, stroke: 'rgba(255,255,255,0.12)' })
    },
    // 左端圆点标记（白底黑圈）
    {
      type: 'circle',
      shape: { cx: coordStart[0], cy: coordStart[1], r: dotR },
      style: { fill: '#fff', stroke: '#000', lineWidth: 2, opacity: 0.95 }
    }
  ]

  // 仅在非衔接状态下绘制右端圆点
  if (!hideRightDot) {
    children.push({
      type: 'circle',
      shape: { cx: coordEnd[0], cy: coordEnd[1], r: dotR },
      style: { fill: '#fff', stroke: '#000', lineWidth: 2, opacity: 0.95 }
    })
  }

  return { type: 'group', children }
}

/** 预览图表胶囊高度 */
const PREVIEW_BAR_H = 8

/**
 * 构建 custom series 配置（胶囊条形 + 端点圆点，与执行图表风格一致）
 */
function buildPreviewSeries(
  name: string,
  segments: [number, number, number, number][],
  color: string,
): any {
  return {
    name,
    type: 'custom',
    clip: false,
    renderItem: (params: any, api: any) => renderGanttItem(params, api, color, PREVIEW_BAR_H, false),
    encode: { x: [0, 2], y: [1, 3] },
    data: segments,
    z: name.includes('放电') ? 5 : 3,
    emphasis: { focus: 'series', itemStyle: { opacity: 1 } },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (p: any) => {
        const seg = segments[p.dataIndex]
        if (!seg) return ''
        const sh = String(Math.floor(seg[0])).padStart(2, '0')
        const sm = String(Math.round((seg[0] % 1) * 60)).padStart(2, '0')
        const eh = String(Math.floor(seg[2])).padStart(2, '0')
        const em = String(Math.round((seg[2] % 1) * 60)).padStart(2, '0')
        return `<span style="color:${color};font-weight:bold;">● ${name}</span><br/>`
          + `时段：${sh}:${sm} ~ ${eh}:${em}<br/>`
          + `功率：${seg[1]} kW`
      }
    }
  }
}

const previewOption = computed(() => {
  /** 根据时段行构建充电/放电时间段 */
  const chargeSegments: [number, number, number, number][] = []
  const dischargeSegments: [number, number, number, number][] = []

  for (const row of periodRows) {
    if (row.startTime === '------' || !row.power) continue
    const sh = parseInt(row.startTime.split(':')[0], 10) || 0
    const sm = parseInt(row.startTime.split(':')[1], 10) || 0
    const eh = parseInt(row.endTime.split(':')[0], 10) || 0
    const em = parseInt(row.endTime.split(':')[1], 10) || 0
    const startVal = sh + sm / 60
    const endVal = eh + em / 60
    const power = row.type === '充电' ? -row.power : row.power

    if (row.type === '充电') {
      chargeSegments.push([startVal, power, endVal, power])
    } else {
      dischargeSegments.push([startVal, power, endVal, power])
    }
  }

  // 若无时段数据则使用默认模拟段
  if (chargeSegments.length === 0 && dischargeSegments.length === 0) {
    chargeSegments.push([0, -150, 8, -150])
    dischargeSegments.push([8, 200, 22, 200])
  }


  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(2,167,240,0.4)', type: 'dashed' } },
      backgroundColor: 'rgba(10,22,40,0.94)',
      borderColor: 'rgba(2,167,240,0.35)',
      borderWidth: 1,
      textStyle: { color: '#D5F2FF', fontSize: 12 },
      extraCssText: 'border-radius:6px; padding:8px 14px;',
      confine: true
    },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '8%',
      top: '2%'
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 24,
      interval: 2,
      axisLine: { show:false },
      axisLabel: {
        color: '#8a93a5',
        fontSize: 11,
        formatter: (val: number) => `${String(val).padStart(2, '0')}:00`
      },
      axisTick: { show: false },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      min: -300,
      max: 400,
      interval: 50,
      axisLine: { lineStyle: { color: '#1a273f' }  },
      axisTick: { show: false },
      axisLabel: {
        color: '#8a93a5',
        fontSize: 11,
        formatter: (val: number) => `${val}`
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(61,70,77,0.4)',
          // width: (p: { value: number }) => (p.value === 0 ? 1.5 : 1)
        }
      }
    },
    series: [
      buildPreviewSeries('充电策略配置', chargeSegments, '#00FF00'),
      buildPreviewSeries('放电策略配置', dischargeSegments, '#02A7F0')
    ]
  }
})

/* ---------- Actions ---------- */

/** 关闭策略表单弹窗 */
function handleClose() {
  emit('update:visible', false)
}

/** 保存策略表单数据并关闭弹窗，通过 save 事件将表单副本传递给父组件 */
function handleSave() {
  emit('save', { ...form })
  emit('update:visible', false)
}
</script>

<style scoped>
/* ==================== Modal Base ==================== */
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

.strategy-form-modal {
  width: 85vw;
  max-width: 1200px;
  max-height: 88vh;
  padding: 16px;
  background: rgba(21, 20, 20, 0.4);
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

/* ==================== Header（标题栏，与 StrategyManageDialog 一致） ==================== */
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
  font-weight: 600;
  color: #02A7F0;
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

/* ==================== Body（非对称双栏布局） ==================== */
.strategy-form-body {
  display: flex;
  gap: 18px;
  padding: 16px 22px;
  overflow-y: auto;
  flex: 1;
}

/* ---- 左栏（约38%，固定宽度） ---- */
.form-left {
  width: 38%;
  min-width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---- 右栏（剩余空间，自适应填充） ---- */
.form-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ==================== 公共表单项样式 ==================== */
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

.section-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

.form-input,
.form-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.form-input:read-only,
.form-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.form-select option {
  background: #0d1b2e;
  color: #fff;
}

/* ==================== 日期标签行 ==================== */
.date-item {
  gap: 8px;
  /** 日历区域占据左栏剩余空间，撑满高度 */
  flex: 1;
  min-height: 0;
}

.date-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.date-tag {
  background-image: url('/images/tabDefaultBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border: none;
  padding: 4px 14px;
  font-size: 12px;
  color: #ffffff;
  cursor: pointer;
}

.date-tag.active {
  background-image: url('/images/tabSeletedBg.png');
}

.date-action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 4px 6px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.date-action-btn:hover {
  border-color: rgba(2, 167, 240, 0.4);
  color: rgba(255, 255, 255, 0.75);
}

.date-add-btn:hover {
  border-color: rgba(2, 167, 240, 0.5);
  color: #48CAE4;
  background: rgba(2, 167, 240, 0.08);
}

/* ==================== 高级控制区 ==================== */
.advanced-control-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: rgba(10, 22, 40, 0.3);
}

.advanced-toggles {
  display: flex;
  align-items: center;
  gap: 32px;
}

.adv-toggle-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.adv-icon svg {
  display: block;
}

.adv-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
}

.adv-threshold {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 18px;
  transition: 0.25s;
}

.toggle-slider::before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background: #e0e0e0;
  border-radius: 50%;
  transition: 0.25s;
}

.toggle-switch input:checked + .toggle-slider {
  background: #10B981;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
  background: #fff;
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ==================== 充电/放电 并排 SOC 面板 ==================== */
.soc-panel-row {
  display: flex;
  gap: 12px;
}

.soc-card {
  flex: 1;
  position: relative; /* 为标签绝对定位提供参考 */
  background: rgba(10, 22, 40, 0.5);
  border: 1px solid rgba(2, 167, 240, 0.15);
  border-radius: 8px;
  padding: 24px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.soc-card-header {
  position: absolute;
  left: -1px;
  top: -1px;
  padding: 4px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background-image: url('/images/zfdBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/** 上方行：标签 + 输入框 + 单位 */
.soc-field {
  display: flex;
  align-items: center;
  gap: 6px;
}

.soc-field-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
}

/** 可编辑数值输入框 */
.soc-value-input {
  width: 52px;
  height: 22px;
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(60, 90, 140, 0.35);
  border-radius: 3px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  outline: none;
}
.soc-value-input:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.soc-unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/** 下方进度条区域 */
.soc-progress-wrap {
  width: 100%;
  height: 6px;
  background: rgba(30, 45, 70, 0.7);
  border-radius: 3px;
  overflow: hidden;
}

.soc-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.25s ease;
}

/** 充电 - 绿色进度条 */
.charge-bar {
  background: linear-gradient(90deg, #00FF00, #48CAE4);
}

/** 放电 - 蓝色进度条 */
.discharge-bar {
  background: linear-gradient(90deg, #02A7F0, #48CAE4);
}

/* ==================== 充放电时段配置表格 ==================== */
.period-table-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.table-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-period-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 12px;
  background: transparent;
  border: 1px solid rgba(245, 166, 35, 0.5);
  border-radius: 4px;
  font-size: 11px;
  color: #F5A623;
  cursor: pointer;
  transition: all 0.2s;
}

.add-period-btn:hover {
  background: rgba(245, 166, 35, 0.1);
  border-color: #F5A623;
}

.period-table-wrap {
  overflow-x: auto;
}

.period-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.period-table th {
  background: rgba(2, 167, 240, 0.08);
  color: rgba(255, 255, 255, 0.65);
  font-weight: 500;
  padding: 7px 10px;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
}

.period-table td {
  padding: 4px 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  vertical-align: middle;
  position: relative;
}

.period-table tr:hover td {
  background: rgba(2, 167, 240, 0.04);
}

/* 表格内 input 样式 */
.table-time-input,
.table-select,
.table-power-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  padding: 3px 6px;
  font-size: 12px;
  color: #fff;
  outline: none;
  width: 90px;
  transition: border-color 0.2s;
}

.table-time-input:focus,
.table-select:focus,
.table-power-input:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.table-time-input:disabled,
.table-select:disabled,
.table-power-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-select {
  width: 70px;
}

.table-power-input {
  width: 70px;
}

.table-select option {
  background: #0d1b2e;
  color: #fff;
}

/* 表格内按钮 */
.time-clock-btn,
.type-check-btn {
  background: transparent;
  border: none;
  padding: 2px;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  margin-left: 2px;
}

.time-clock-btn:hover,
.type-check-btn:hover {
  color: rgba(2, 167, 240, 0.8);
}

.del-row-btn {
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 3px;
  padding: 3px;
  color: rgba(239, 68, 68, 0.5);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.del-row-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.5);
  color: #ef4444;
}

.del-row-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* ==================== 图表区域 ==================== */
.chart-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  /** 图表区自适应填充右栏剩余空间 */
  flex: 1;
  min-height: 200px;
}

.chart-box {
  background: rgba(10, 22, 40, 0.4);
  border: 1px solid rgba(2, 167, 240, 0.12);
  border-radius: 6px;
  padding: 8px 6px 4px;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/** 策略预览右上角图例 */
.preview-legend {
  position: absolute;
  top: -26px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

.preview-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}

/** 胶囊形图例标记（与图表条形风格一致：圆角矩形 + 两端白底黑圈圆点） */
.preview-legend .legend-pill {
  position: relative;
  width: 22px;
  height: 9px;
  border-radius: 5px;
  flex-shrink: 0;
}

/** 左端白底黑圈圆点 */
.preview-legend .legend-pill::before {
  content: '';
  position: absolute;
  left: -4.5px;
  top: 50%;
  transform: translateY(-50%);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #000;
}

/** 右端白底黑圈圆点 */
.preview-legend .legend-pill::after {
  content: '';
  position: absolute;
  right: -4.5px;
  top: 50%;
  transform: translateY(-50%);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #000;
}

/* ==================== Footer ==================== */
.modal-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid rgba(2, 167, 240, 0.12);
  flex-shrink: 0;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 7px 28px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-save {
  background: linear-gradient(90deg, #02A7F0 0%, #48CAE4 100%);
  border: 1px solid rgba(2, 167, 240, 0.5);
  border-radius: 4px;
  padding: 7px 28px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: linear-gradient(90deg, #3BB8FA 0%, #7DD9FA 100%);
  box-shadow: 0 0 12px rgba(2, 167, 240, 0.3);
}

/* ==================== Scrollbar ==================== */
.strategy-form-body::-webkit-scrollbar {
  width: 5px;
}

.strategy-form-body::-webkit-scrollbar-track {
  background: transparent;
}

.strategy-form-body::-webkit-scrollbar-thumb {
  background: rgba(2, 167, 240, 0.25);
  border-radius: 3px;
}

/* ==================== Responsive ==================== */
@media (max-width: 1100px) {
  .strategy-form-modal {
    width: 98vw;
    max-width: 98vw;
    border-radius: 8px;
  }
  .strategy-form-body {
    flex-direction: column;
  }
  .form-left {
    width: 100%;
    min-width: unset;
  }
  .soc-panel-row {
    flex-direction: column;
  }
  .advanced-toggles {
    flex-direction: column;
  }
}
</style>
