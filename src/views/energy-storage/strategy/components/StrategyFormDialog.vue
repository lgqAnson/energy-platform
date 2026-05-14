<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleClose">
        <div class="strategy-form-modal" @click.stop>
          <!-- 弹窗标题 -->
          <div class="modal-header">
            <div class="modal-title">
              <Zap class="modal-title-icon" />
              <span>{{ modalTitle }}</span>
            </div>
            <button class="modal-close" @click="handleClose">
              <X />
            </button>
          </div>

          <!-- 主体 -->
          <div class="strategy-form-body">
            <!-- 左栏 -->
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

              <div class="form-item">
                <label class="form-label">生效时段</label>
                <div class="time-range">
                  <input v-model="form.startTime" type="time" class="form-time" :disabled="isViewMode" />
                  <span class="time-sep">至</span>
                  <input v-model="form.endTime" type="time" class="form-time" :disabled="isViewMode" />
                </div>
              </div>

              <div class="form-item date-item">
                <label class="form-label">适用日期</label>
                <div class="date-tags">
                  <button v-for="tag in dateTags" :key="tag" type="button" class="date-tag" :class="{ active: form.dateTag === tag }" @click="!isViewMode && (form.dateTag = tag)">
                    {{ tag }}
                  </button>
                </div>

                <CalendarPicker
                  ref="calendarRef"
                  v-model="form.selectedDates"
                  :disabled="isViewMode"
                />
              </div>
            </div>

            <!-- 右栏 -->
            <div class="form-right">
              <div class="form-item slider-item">
                <label class="form-label">充电功率 (kW)</label>
                <div class="slider-row">
                  <input v-model.number="form.chargePower" type="range" min="0" max="500" class="form-range" :disabled="isViewMode" />
                  <span class="range-value">{{ form.chargePower }}</span>
                </div>
              </div>

              <div class="form-item slider-item">
                <label class="form-label">放电功率 (kW)</label>
                <div class="slider-row">
                  <input v-model.number="form.dischargePower" type="range" min="0" max="500" class="form-range" :disabled="isViewMode" />
                  <span class="range-value">{{ form.dischargePower }}</span>
                </div>
              </div>

              <div class="form-item slider-item">
                <label class="form-label">SOC控制范围</label>
                <div class="soc-row">
                  <div class="slider-row">
                    <span class="soc-label">充电上限</span>
                    <input v-model.number="form.socChargeLimit" type="range" min="0" max="100" class="form-range" :disabled="isViewMode" />
                    <span class="range-value">{{ form.socChargeLimit }}%</span>
                  </div>
                  <div class="slider-row">
                    <span class="soc-label">放电下限</span>
                    <input v-model.number="form.socDischargeLimit" type="range" min="0" max="100" class="form-range" :disabled="isViewMode" />
                    <span class="range-value">{{ form.socDischargeLimit }}%</span>
                  </div>
                </div>
              </div>
              <div class="form-item toggle-group">
                <label class="form-label">高级控制</label>
                <div class="toggle-row">
                  <span class="toggle-label">防逆流控制</span>
                  <label class="toggle-switch">
                    <input v-model="form.antiRefluxEnabled" type="checkbox" :disabled="isViewMode" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="toggle-threshold">阈值: 5kW</span>
                </div>
                <div class="toggle-row">
                  <span class="toggle-label">需量管理</span>
                  <label class="toggle-switch">
                    <input v-model="form.demandEnabled" type="checkbox" :disabled="isViewMode" />
                    <span class="toggle-slider"></span>
                  </label>
                  <span class="toggle-threshold">阈值: 800kW</span>
                </div>
              </div>

              <div class="form-item chart-item">
                <label class="form-label">策略预览</label>
                <div class="chart-box">
                  <VChart :option="previewOption" autoresize style="width: 100%; height: 200px" />
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
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Zap, X } from 'lucide-vue-next'
import CalendarPicker from '@/components/business/CalendarPicker.vue'
import { axisTooltipConfig } from '@/utils/echartsTooltip'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

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

const modalTitle = computed(() => {
  switch (props.mode) {
    case 'add': return '充放电策略配置'
    case 'edit': return '编辑充放电策略'
    case 'view': return '查看充放电策略'
    default: return '充放电策略配置'
  }
})

/* ---------- Form ---------- */
const dateTags = ['平日', '节假日', '特殊日期']

const form = reactive({
  name: '',
  type: '日常策略',
  startTime: '08:00',
  endTime: '22:00',
  dateTag: '平日',
  selectedDates: [] as string[],
  chargePower: 150,
  dischargePower: 200,
  socChargeLimit: 95,
  socDischargeLimit: 20,
  antiRefluxEnabled: true,
  demandEnabled: true,
})

const calendarRef = ref<InstanceType<typeof CalendarPicker> | null>(null)

/** 将表单数据重置为默认值，包括日历选择器的清空 */
function resetForm() {
  form.name = ''
  form.type = '日常策略'
  form.startTime = '08:00'
  form.endTime = '22:00'
  form.dateTag = '平日'
  form.selectedDates = []
  form.chargePower = 150
  form.dischargePower = 200
  form.socChargeLimit = 95
  form.socDischargeLimit = 20
  form.antiRefluxEnabled = true
  form.demandEnabled = true
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

/* ---------- Chart Preview ---------- */
const previewOption = computed(() => {
  const startHour = parseInt(form.startTime.split(':')[0], 10) || 0
  const endHour = parseInt(form.endTime.split(':')[0], 10) || 24

  const data = Array.from({ length: 24 }, (_, h) => {
    const inPeriod = startHour <= endHour ? h >= startHour && h < endHour : h >= startHour || h < endHour
    return inPeriod ? form.chargePower : -form.dischargePower
  })

  return {
    tooltip: axisTooltipConfig({
      formatter: (params: any[]) => {
        const p = Array.isArray(params) ? params[0] : params
        const val = p.value as number
        const action = val >= 0 ? '充电' : '放电'
        return axisTooltipConfig().formatter([
          { axisValue: p.name, seriesName: action, value: `${Math.abs(val)} kW`, color: '#02A7F0' }
        ])
      }
    }),
    grid: { top: 30, right: 16, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}时`),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
    },
    series: [
      {
        type: 'bar',
        data,
        itemStyle: { color: '#02A7F0', borderRadius: [2, 2, 0, 0] },
        barWidth: '55%',
      },
    ],
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
/* ---------- Modal base ---------- */
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
  width: 92vw;
  max-width: 1100px;
  max-height: 92vh;
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

/* ---------- Header ---------- */
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
  color: #02a7f0;
}

.modal-title-icon {
  width: 20px;
  height: 20px;
  color: #faad14;
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

/* ---------- Body ---------- */
.strategy-form-body {
  display: flex;
  gap: 24px;
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.form-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

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

.form-input,
.form-select,
.form-time {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-time:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-input:read-only,
.form-select:disabled,
.form-time:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-select option {
  background: #1a2a3e;
  color: #fff;
}

/* Time range */
.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-time {
  flex: 1;
}

.time-sep {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

/* Date tags */
.date-tags {
  display: flex;
  gap: 8px;
}

.date-tag {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 5px 14px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.date-tag.active {
  background: rgba(2, 167, 240, 0.18);
  border-color: rgba(2, 167, 240, 0.5);
  color: #02a7f0;
}

.date-tag:hover:not(:disabled) {
  border-color: rgba(2, 167, 240, 0.35);
}

.date-tag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---------- Right column ---------- */
.slider-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-range {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #02a7f0;
  cursor: pointer;
  border: 2px solid #132233;
  box-shadow: 0 0 6px rgba(2, 167, 240, 0.4);
}

.form-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #02a7f0;
  cursor: pointer;
  border: 2px solid #132233;
  box-shadow: 0 0 6px rgba(2, 167, 240, 0.4);
}

.form-range:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-range:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}

.range-value {
  font-size: 12px;
  color: #02a7f0;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
}

.soc-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.soc-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  min-width: 56px;
}

/* Toggle */
.toggle-group {
  gap: 8px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 8px 12px;
}

.toggle-label {
  flex: 1;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 20px;
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
  border-radius: 20px;
  transition: 0.25s;
}

.toggle-slider::before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.25s;
}

.toggle-switch input:checked + .toggle-slider {
  background: #02a7f0;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-threshold {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  min-width: 64px;
  text-align: right;
}

/* Chart */
.chart-box {
  background: rgba(10, 22, 40, 0.4);
  border: 1px solid rgba(2, 167, 240, 0.12);
  border-radius: 6px;
  padding: 6px;
}

/* ---------- Footer ---------- */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid rgba(2, 167, 240, 0.12);
  flex-shrink: 0;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 7px 22px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-save {
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.9) 0%, rgba(2, 167, 240, 0.65) 100%);
  border: 1px solid rgba(2, 167, 240, 0.5);
  border-radius: 4px;
  padding: 7px 22px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.8) 100%);
  box-shadow: 0 0 12px rgba(2, 167, 240, 0.3);
}

/* Scrollbar */
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

/* Responsive: stack form columns on narrow screens */
@media (max-width: 900px) {
  .strategy-form-modal {
    width: 100vw;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
  .strategy-form-body {
    flex-direction: column;
  }
}
</style>
