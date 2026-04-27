<template>
  <div class="time-setting-section">
    <!-- 标题行 -->
    <div class="section-header">
      <div class="section-title-row">
        <Clock class="title-icon" :size="20" />
        <span class="section-title-text">电价时段设置</span>
      </div>
      <p class="section-hint">
        提示：支持根据电网发布的尖、峰、平、谷对应时间段，手动或自动更新匹配。
      </p>
    </div>

    <!-- 开关行 -->
    <div class="section-toolbar">
      <div class="toggle-row">
        <ToggleRight v-if="autoUpdate" class="toggle-icon active" :size="36" @click="autoUpdate = false" />
        <ToggleLeft v-else class="toggle-icon" :size="36" @click="autoUpdate = true" />
        <span class="toggle-label">启用自动更新(根据地区电网政策)</span>
      </div>
    </div>

    <!-- Tab + 操作按钮 -->
    <div class="tab-bar">
      <div class="tab-group">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="tab-actions">
        <button class="action-btn" title="编辑">
          <Edit3 :size="16" />
        </button>
        <button class="action-btn danger" title="删除">
          <Trash2 :size="16" />
        </button>
        <button class="action-btn success" title="添加">
          <Plus :size="16" />
        </button>
      </div>
    </div>

    <!-- 日历 + 时段列表 -->
    <div class="time-setting-main">
      <!-- 左侧日历 -->
      <div class="calendar-panel">
        <div class="calendar-header">
          <button class="month-nav" @click="prevMonth">
            <ChevronLeft :size="18" />
            <span>上月</span>
          </button>
          <span class="calendar-title">{{ currentYear }}年{{ currentMonth + 1 }}月</span>
          <button class="month-nav" @click="nextMonth">
            <span>下月</span>
            <ChevronRight :size="18" />
          </button>
        </div>
        <div class="calendar-weekdays">
          <span v-for="day in weekDays" :key="day" class="weekday-label">{{ day }}</span>
        </div>
        <div class="calendar-grid">
          <button
            v-for="(date, idx) in calendarDates"
            :key="idx"
            class="calendar-day"
            :class="{
              'other-month': !date.isCurrentMonth,
              'selected': selectedDate && date.year === selectedDate.year && date.month === selectedDate.month && date.day === selectedDate.day,
              'today': date.isToday
            }"
            @click="selectDate(date)"
          >
            {{ date.day }}
          </button>
        </div>
        <div class="calendar-footer">
          <button class="select-date-btn" @click="selectToday">选择日期</button>
        </div>
      </div>

      <!-- 右侧时段列表 -->
      <div class="time-slot-list">
        <div
          v-for="slot in timeSlots"
          :key="slot.key"
          class="time-slot-item"
        >
          <div class="slot-info">
            <div class="slot-name">{{ slot.name }}</div>
            <div class="slot-range">{{ slot.range }}</div>
          </div>
          <div class="slot-tag" :style="{ background: slot.tagBg, color: slot.tagColor }">
            {{ slot.tag }}
          </div>
          <div class="slot-actions">
            <button class="slot-action-btn edit" title="编辑">
              <Edit3 :size="14" />
            </button>
            <button class="slot-action-btn delete" title="删除">
              <Trash2 :size="14" />
            </button>
            <button class="slot-action-btn add" title="添加">
              <Plus :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Clock, ToggleRight, ToggleLeft,
  Edit3, Trash2, Plus,
  ChevronLeft, ChevronRight
} from 'lucide-vue-next'

const autoUpdate = ref(true)

/* ---------- Tab ---------- */
const tabs = [
  { key: 'weekday', label: '平日' },
  { key: 'special', label: '特殊日期' }
]
const activeTab = ref('weekday')

/* ---------- 日历 ---------- */
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentDate = ref(new Date(2026, 2, 1)) // 2026年3月
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const selectedDate = ref<{ year: number; month: number; day: number } | null>({ year: 2026, month: 2, day: 13 })

interface CalendarDate {
  year: number
  month: number
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

const today = new Date()

const calendarDates = computed<CalendarDate[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startWeekday = firstDayOfMonth.getDay()

  const dates: CalendarDate[] = []

  // 上月填充
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    dates.push({
      year: prevYear,
      month: prevMonth,
      day,
      isCurrentMonth: false,
      isToday: false
    })
  }

  // 当月
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push({
      year,
      month,
      day,
      isCurrentMonth: true,
      isToday: year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
    })
  }

  // 下月填充（凑满6行42格）
  const remaining = 42 - dates.length
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year
    dates.push({
      year: nextYear,
      month: nextMonth,
      day,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return dates
})

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

function selectDate(date: CalendarDate) {
  selectedDate.value = { year: date.year, month: date.month, day: date.day }
}

function selectToday() {
  const now = new Date()
  currentDate.value = new Date(now.getFullYear(), now.getMonth(), 1)
  selectedDate.value = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() }
}

/* ---------- 时段列表 ---------- */
interface TimeSlot {
  key: string
  name: string
  range: string
  tag: string
  tagBg: string
  tagColor: string
}

const timeSlots: TimeSlot[] = [
  {
    key: 'sharp',
    name: '尖时段',
    range: '11:00 - 12:00',
    tag: '尖峰',
    tagBg: 'rgba(255, 107, 53, 0.2)',
    tagColor: '#FF6B35'
  },
  {
    key: 'peak',
    name: '峰时段',
    range: '10:00 - 11:00, 14:00 - 19:00',
    tag: '高峰',
    tagBg: 'rgba(255, 77, 77, 0.2)',
    tagColor: '#FF4D4D'
  },
  {
    key: 'flat',
    name: '平时段',
    range: '08:00 - 10:00, 12:00 - 14:00, 19:00 - 23:59',
    tag: '平常',
    tagBg: 'rgba(74, 158, 255, 0.2)',
    tagColor: '#4A9EFF'
  },
  {
    key: 'valley',
    name: '谷时段',
    range: '00:00 - 08:00',
    tag: '低谷',
    tagBg: 'rgba(74, 158, 255, 0.2)',
    tagColor: '#4A9EFF'
  }
]
</script>

<style scoped>
.time-setting-section {
  padding: 16px 20px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.08) 0%, rgba(85, 85, 85, 0.05) 100%);
  border: 1px solid rgba(129, 211, 248, 0.15);
}

.section-header {
  margin-bottom: 12px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.title-icon {
  color: #02A7F0;
}

.section-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #02A7F0;
}

.section-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  padding-left: 28px;
}

.section-toolbar {
  margin-bottom: 12px;
  padding-left: 28px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-icon.active {
  color: #02A7F0;
}

.toggle-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-left: 28px;
  border-bottom: 1px solid rgba(129, 211, 248, 0.12);
  padding-bottom: 10px;
}

.tab-group {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 6px 20px;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #fff;
  background: rgba(2, 167, 240, 0.15);
  border-bottom-color: #02A7F0;
}

.tab-btn:hover:not(.active) {
  color: rgba(255, 255, 255, 0.8);
}

.tab-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(2, 167, 240, 0.2);
  color: #02A7F0;
}

.action-btn.danger:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #FF4D4D;
}

.action-btn.success:hover {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

/* 主内容区 */
.time-setting-main {
  display: flex;
  gap: 20px;
  padding-left: 28px;
}

/* 日历 */
.calendar-panel {
  flex: 1;
  min-width: 320px;
  max-width: 420px;
  background: rgba(10, 23, 42, 0.5);
  border: 1px solid rgba(129, 211, 248, 0.12);
  border-radius: 8px;
  padding: 16px;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s;
}

.month-nav:hover {
  color: #02A7F0;
}

.calendar-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday-label {
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  padding: 6px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
  color: #fff;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.calendar-day.other-month {
  color: rgba(255, 255, 255, 0.2);
}

.calendar-day:hover:not(.selected) {
  background: rgba(2, 167, 240, 0.15);
}

.calendar-day.selected {
  background: #02A7F0;
  color: #fff;
  font-weight: 600;
}

.calendar-day.today:not(.selected) {
  border: 1px solid rgba(2, 167, 240, 0.5);
}

.calendar-footer {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.select-date-btn {
  padding: 6px 16px;
  border-radius: 4px;
  background: linear-gradient(135deg, #FF8C42 0%, #E67300 100%);
  color: #fff;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.select-date-btn:hover {
  opacity: 0.9;
}

/* 时段列表 */
.time-slot-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-slot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(10, 23, 42, 0.5);
  border: 1px solid rgba(129, 211, 248, 0.12);
  border-radius: 8px;
}

.slot-info {
  flex: 1;
  min-width: 0;
}

.slot-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.slot-range {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.slot-tag {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.slot-actions {
  display: flex;
  gap: 6px;
}

.slot-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.12);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.slot-action-btn.edit:hover {
  background: rgba(2, 167, 240, 0.2);
  color: #02A7F0;
}

.slot-action-btn.delete:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #FF4D4D;
}

.slot-action-btn.add:hover {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

/* 响应式 */
@media (max-width: 1024px) {
  .time-setting-main {
    flex-direction: column;
  }

  .calendar-panel {
    max-width: 100%;
  }
}
</style>
