<template>
  <div class="calendar-box">
    <div class="calendar-toolbar">
      <button type="button" class="cal-nav" :disabled="disabled" @click="prevMonth">上月</button>
      <span class="cal-title">{{ calendarYear }}年{{ calendarMonth + 1 }}月</span>
      <button type="button" class="cal-nav" :disabled="disabled" @click="nextMonth">下月</button>
      <button type="button" class="btn-orange" :disabled="disabled" @click="selectCurrentMonth">选择日期</button>
    </div>
    <div class="calendar-grid">
      <div class="calendar-weekdays">
        <span v-for="w in weekdays" :key="w">{{ w }}</span>
      </div>
      <div class="calendar-days">
        <span
          v-for="(cell, idx) in calendarDays"
          :key="idx"
          class="cal-day"
          :class="{
            'other-month': !cell.current,
            selected: cell.current && modelValue.includes(cell.date),
            today: cell.current && cell.date === todayStr,
          }"
          @click="cell.current && toggleDate(cell.date)"
        >
          {{ cell.day }}
        </span>
      </div>
    </div>

    <div class="calendar-actions">
      <button type="button" :disabled="disabled" title="编辑"><Pencil class="icon-xs" /></button>
      <button type="button" :disabled="disabled" title="删除"><Trash2 class="icon-xs" /></button>
      <button type="button" :disabled="disabled" title="添加"><Plus class="icon-xs" /></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Trash2, Plus } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [dates: string[]]
}>()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const calendarYear = ref(new Date().getFullYear())
const calendarMonth = ref(new Date().getMonth())

const todayStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

interface CalendarCell {
  day: number
  current: boolean
  date: string
}

const calendarDays = computed<CalendarCell[]>(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startWeekday = firstDay.getDay()

  const days: CalendarCell[] = []

  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, current: false, date: '' })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    days.push({ day: i, current: true, date })
  }

  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false, date: '' })
  }

  return days
})

function prevMonth() {
  if (props.disabled) return
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

function nextMonth() {
  if (props.disabled) return
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

function toggleDate(date: string) {
  if (props.disabled) return
  const current = [...props.modelValue]
  const idx = current.indexOf(date)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(date)
  }
  emit('update:modelValue', current)
}

function selectCurrentMonth() {
  if (props.disabled) return
  const year = calendarYear.value
  const month = calendarMonth.value
  const lastDay = new Date(year, month + 1, 0).getDate()
  const dates: string[] = []
  for (let i = 1; i <= lastDay; i++) {
    dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`)
  }
  emit('update:modelValue', dates)
}

function reset() {
  const now = new Date()
  calendarYear.value = now.getFullYear()
  calendarMonth.value = now.getMonth()
}

defineExpose({ reset })
</script>

<style scoped>
.calendar-box {
  background: rgba(10, 22, 40, 0.4);
  border: 1px solid rgba(2, 167, 240, 0.12);
  border-radius: 6px;
  padding: 10px;
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.cal-nav {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
}

.cal-nav:hover:not(:disabled) {
  border-color: rgba(2, 167, 240, 0.4);
  color: #02a7f0;
}

.cal-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.cal-title {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.btn-orange {
  background: linear-gradient(90deg, rgba(250, 173, 20, 0.85) 0%, rgba(250, 173, 20, 0.6) 100%);
  border: 1px solid rgba(250, 173, 20, 0.5);
  border-radius: 4px;
  padding: 3px 12px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-orange:hover:not(:disabled) {
  background: linear-gradient(90deg, rgba(250, 173, 20, 1) 0%, rgba(250, 173, 20, 0.8) 100%);
  box-shadow: 0 0 10px rgba(250, 173, 20, 0.25);
}

.btn-orange:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.calendar-grid {
  margin-bottom: 8px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.calendar-weekdays span {
  text-align: center;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  padding: 4px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-day {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  padding: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.cal-day.other-month {
  color: rgba(255, 255, 255, 0.25);
  cursor: default;
}

.cal-day:not(.other-month):hover {
  background: rgba(2, 167, 240, 0.15);
}

.cal-day.selected {
  background: rgba(2, 167, 240, 0.35) !important;
  color: #fff;
  font-weight: 600;
}

.cal-day.today {
  border: 1px solid rgba(2, 167, 240, 0.4);
}

.calendar-actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.calendar-actions button {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  padding: 3px 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.calendar-actions button:hover:not(:disabled) {
  border-color: rgba(2, 167, 240, 0.4);
  color: #02a7f0;
}

.calendar-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.icon-xs {
  width: 13px;
  height: 13px;
}
</style>
