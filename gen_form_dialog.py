import os

path = 'src/views/energy-storage/strategy/components/StrategyFormDialog.vue'

template_part = r'''<<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="$emit('update:visible', false)">
        <div class="strategy-form-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <Zap class="modal-title-icon" />
              <span>{{ formTitle }}</span>
            </div>
            <button class="modal-close" @click="$emit('update:visible', false)">
              <X />
            </button>
          </div>

          <div class="strategy-form-body">
            <!-- 左栏 -->
            <div class="form-left">
              <div class="form-group">
                <label class="form-label">策略名称</label>
                <input v-model="form.name" :readonly="isViewMode" type="text" class="form-input" placeholder="请输入策略名称" />
              </div>
              <div class="form-group">
                <label class="form-label">策略类型</label>
                <select v-model="form.type" :disabled="isViewMode" class="form-select">
                  <option value="日常策略">日常策略</option>
                  <option value="节假日策略">节假日策略</option>
                  <option value="特殊日策略">特殊日策略</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">生效时段</label>
                <div class="time-range-row">
                  <input v-model="form.startTime" :readonly="isViewMode" type="time" class="form-time" />
                  <span class="time-sep">至</span>
                  <input v-model="form.endTime" :readonly="isViewMode" type="time" class="form-time" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">适用日期</label>
                <div class="date-type-tabs">
                  <button v-for="t in dateTabs" :key="t.key" :class="['date-tab', { active: form.dateType === t.key }]" @click="form.dateType = t.key">{{ t.label }}</button>
                </div>
                <div class="calendar-box">
                  <div class="calendar-nav">
                    <button class="cal-nav-btn" @click="prevMonth">&lt; 上月</button>
                    <span class="cal-month">{{ calendarYear }}年{{ calendarMonth }}月</span>
                    <button class="cal-nav-btn" @click="nextMonth">下月 &gt;</button>
                    <button class="cal-select-btn">选择日期</button>
                  </div>
                  <div class="calendar-week-row">
                    <span v-for="d in weekDays" :key="d" class="cal-weekday">{{ d }}</span>
                  </div>
                  <div class="calendar-day-grid">
                    <span v-for="(day, didx) in calendarDays" :key="didx" :class="['cal-day', day.class]" @click="toggleDate(day)">{{ day.day }}</span>
                  </div>
                  <div class="calendar-btns">
                    <button class="cal-action edit"><Pencil class="cal-icon" /></button>
                    <button class="cal-action delete"><Trash2 class="cal-icon" /></button>
                    <button class="cal-action add"><Plus class="cal-icon" /></button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右栏 -->
            <div class="form-right">
              <div class="form-group slider-group">
                <label class="form-label">充电功率 (kW) <span class="val-highlight">{{ form.chargePower }} kW</span></label>
                <input type="range" v-model.number="form.chargePower" :disabled="isViewMode" min="0" max="500" class="form-slider" />
              </div>
              <div class="form-group slider-group">
                <label class="form-label">放电功率 (kW) <span class="val-highlight">{{ form.dischargePower }} kW</span></label>
                <input type="range" v-model.number="form.dischargePower" :disabled="isViewMode" min="0" max="500" class="form-slider" />
              </div>
              <div class="form-group slider-group">
                <label class="form-label">SOC控制范围</label>
                <div class="soc-dual">
                  <div class="soc-item">
                    <span class="soc-label">充电上限</span>
                    <input type="range" v-model.number="form.socUpper" :disabled="isViewMode" min="0" max="100" class="form-slider" />
                    <span class="soc-val">{{ form.socUpper }}%</span>
                  </div>
                  <div class="soc-item">
                    <span class="soc-label">放电下限</span>
                    <input type="range" v-model.number="form.socLower" :disabled="isViewMode" min="0" max="100" class="form-slider" />
                    <span class="soc-val">{{ form.socLower }}%</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">高级控制</label>
                <div class="advanced-box">
                  <div class="adv-row">
                    <span class="adv-name">防逆流控制</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="form.antiReflux" :disabled="isViewMode" />
                      <span class="toggle-track"></span>
                    </label>
                    <span class="adv-threshold">阈值: {{ form.antiRefluxThreshold }}kW</span>
                  </div>
                  <div class="adv-row">
                    <span class="adv-name">需量管理</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="form.demandManage" :disabled="isViewMode" />
                      <span class="toggle-track"></span>
                    </label>
                    <span class="adv-threshold">阈值: {{ form.demandThreshold }}kW</span>
                  </div>
                </div>
              </div>
              <div class="form-group chart-group">
                <label class="form-label">策略预览</label>
                <v-chart class="preview-chart" :option="previewOption" autoresize />
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button class="btn-form-cancel" @click="$emit('update:visible', false)">取消</button>
            <button v-if="!isViewMode" class="btn-form-save" @click="saveForm">保存策略</button>
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
import { Zap, X, Pencil, Trash2, Plus } from 'lucide-vue-next'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit' | 'view'
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: typeof form]
}>()

const isViewMode = computed(() => props.mode === 'view')

const formTitle = computed(() => {
  if (props.mode === 'add') return '充放电策略配置'
  if (props.mode === 'edit') return '编辑充放电策略'
  return '查看充放电策略'
})

const form = reactive({
  name: '',
  type: '日常策略',
  startTime: '00:00',
  endTime: '23:59',
  dateType: 'weekday' as 'weekday' | 'holiday' | 'special',
  selectedDates: [] as string[],
  chargePower: 150,
  dischargePower: 200,
  socUpper: 95,
  socLower: 20,
  antiReflux: false,
  antiRefluxThreshold: 5,
  demandManage: false,
  demandThreshold: 800,
})

const dateTabs = [
  { key: 'weekday', label: '平日' },
  { key: 'holiday', label: '节假日' },
  { key: 'special', label: '特殊日期' }
]
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const calendarYear = ref(2026)
const calendarMonth = ref(3)

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: { day: string; date: string; class: string }[] = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', date: '', class: 'empty' })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const isSelected = form.selectedDates.includes(dateStr)
    days.push({ day: String(i), date: dateStr, class: isSelected ? 'selected' : '' })
  }
  return days
}

const calendarDays = computed(() => getCalendarDays(calendarYear.value, calendarMonth.value))

function prevMonth() {
  if (calendarMonth.value === 1) { calendarMonth.value = 12; calendarYear.value-- }
  else { calendarMonth.value-- }
}
function nextMonth() {
  if (calendarMonth.value === 12) { calendarMonth.value = 1; calendarYear.value++ }
  else { calendarMonth.value++ }
}
function toggleDate(day: { day: string; date: string; class: string }) {
  if (isViewMode.value || !day.date) return
  const idx = form.selectedDates.indexOf(day.date)
  if (idx >= 0) form.selectedDates.splice(idx, 1)
  else form.selectedDates.push(day.date)
}

function resetForm() {
  Object.assign(form, {
    name: '', type: '日常策略', startTime: '00:00', endTime: '23:59',
    dateType: 'weekday', selectedDates: [],
    chargePower: 150, dischargePower: 200,
    socUpper: 95, socLower: 20,
    antiReflux: false, antiRefluxThreshold: 5,
    demandManage: false, demandThreshold: 800
  })
  calendarYear.value = 2026
  calendarMonth.value = 3
}

watch(() => props.visible, (val) => {
  if (val && props.mode === 'add') resetForm()
})

function saveForm() {
  emit('save', { ...form })
  emit('update:visible', false)
}

const previewOption = computed(() => {
  const data: (number | string)[] = new Array(24).fill('-')
  const startH = parseInt(form.startTime.split(':')[0] || '0')
  const endH = parseInt(form.endTime.split(':')[0] || '23')
  for (let h = 0; h < 24; h++) {
    if (h >= startH && h <= endH) {
      data[h] = h < 8 ? -form.dischargePower : form.chargePower
    }
  }
  return {
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
    legend: { data: ['充放电策略'], top: 0, right: 0, textStyle: { color: '#8a93a5', fontSize: 11 }, itemWidth: 16, itemHeight: 8 },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
      axisLine: { lineStyle: { color: '#1a273f' } },
      axisLabel: { color: '#8a93a5', fontSize: 10, interval: 2 },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: '#1a273f' } }
    },
    yAxis: {
      type: 'value',
      min: -300, max: 400, interval: 50,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: '#8a93a5', fontSize: 10 },
      splitLine: { show: true, lineStyle: { color: '#1a273f' } }
    },
    series: [{
      name: '充放电策略',
      type: 'bar',
      barWidth: '100%',
      itemStyle: { color: '#5599ff' },
      data
    }]
  }
})
</script>

<style scoped>'''

style_part = r'''
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
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

.strategy-form-body {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.form-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-right {
  flex: 1.1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.form-input,
.form-select,
.form-time {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 12px;
  color: #fff;
  outline: none;
  width: 100%;
}

.form-input::placeholder { color: rgba(255, 255, 255, 0.35); }
.form-input:focus,
.form-select:focus,
.form-time:focus { border-color: rgba(2, 167, 240, 0.5); }

.form-select option { background: #1a2a3e; color: #fff; }

.time-range-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-sep { color: rgba(255, 255, 255, 0.5); font-size: 12px; }

.date-type-tabs {
  display: flex;
  gap: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.date-tab {
  flex: 1;
  padding: 6px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.04);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.date-tab:hover { background: rgba(255, 255, 255, 0.08); }
.date-tab.active {
  background: rgba(2, 167, 240, 0.25);
  color: #02A7F0;
  font-weight: 600;
}

.calendar-box {
  background: rgba(10, 22, 40, 0.5);
  border: 1px solid rgba(2, 167, 240, 0.15);
  border-radius: 6px;
  padding: 10px 12px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.cal-nav-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
}

.cal-month {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  flex: 1;
  text-align: center;
}

.cal-select-btn {
  background: rgba(250, 173, 20, 0.8);
  border: none;
  border-radius: 3px;
  padding: 3px 10px;
  font-size: 11px;
  color: #fff;
  cursor: pointer;
}

.calendar-week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 4px;
}

.cal-weekday {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  padding: 4px 0;
}

.calendar-day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.cal-day {
  text-align: center;
  padding: 5px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 3px;
  cursor: pointer;
  min-height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-day:hover:not(.empty) {
  background: rgba(2, 167, 240, 0.15);
}

.cal-day.selected {
  background: rgba(2, 167, 240, 0.35);
  color: #fff;
}

.cal-day.empty {
  cursor: default;
}

.calendar-btns {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  justify-content: flex-end;
}

.cal-action {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
}

.cal-action.edit:hover { background: rgba(2, 167, 240, 0.2); color: #02A7F0; }
.cal-action.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
.cal-action.add:hover { background: rgba(82, 196, 26, 0.2); color: #52C41A; }

.cal-icon { width: 12px; height: 12px; }

.slider-group .val-highlight {
  color: #02A7F0;
  font-weight: 600;
  margin-left: 4px;
}

.form-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  margin-top: 6px;
}

.form-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #02A7F0;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(2, 167, 240, 0.4);
}

.form-slider:disabled { opacity: 0.5; cursor: not-allowed; }

.soc-dual {
  display: flex;
  gap: 16px;
}

.soc-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.soc-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

.soc-val {
  font-size: 12px;
  color: #02A7F0;
  font-weight: 600;
}

.advanced-box {
  background: rgba(10, 22, 40, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.adv-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.adv-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  width: 80px;
}

.adv-threshold {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  flex: 1;
  text-align: right;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  transition: 0.2s;
}

.toggle-track::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
}

.toggle-switch input:checked + .toggle-track {
  background: #02A7F0;
}

.toggle-switch input:checked + .toggle-track::before {
  transform: translateX(16px);
}

.toggle-switch input:disabled + .toggle-track {
  opacity: 0.5;
  cursor: not-allowed;
}

.chart-group {
  flex: 1;
  min-height: 160px;
}

.preview-chart {
  width: 100%;
  height: 160px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.btn-form-cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 7px 22px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-form-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-form-save {
  background: linear-gradient(90deg, rgba(2, 167, 240, 0.9) 0%, rgba(2, 167, 240, 0.7) 100%);
  border: 1px solid rgba(2, 167, 240, 0.5);
  border-radius: 4px;
  padding: 7px 22px;
  font-size: 13px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-form-save:hover {
  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.85) 100%);
  box-shadow: 0 0 12px rgba(2, 167, 240, 0.3);
}
</style>
'''

full = template_part.lstrip('<') + style_part
with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(full)
print('Done:', path, 'len:', len(full))
