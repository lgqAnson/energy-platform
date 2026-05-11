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
          v-for="tab in tabsData"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTabKey === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="tab-actions">
        <button class="action-btn" title="编辑当前Tab名称" :disabled="!activeTabKey" @click="editCurrentTabName">
          <Edit3 :size="16" />
        </button>
        <button class="action-btn danger" title="删除当前Tab" :disabled="tabsData.length <= 1 || !activeTabKey" @click="deleteCurrentTab">
          <Trash2 :size="16" />
        </button>
        <button class="action-btn success" title="新建Tab" @click="createNewTab">
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
            :class="getCalendarCellClass(date)"
            :style="getCalendarCellStyle(date)"
            @click="selectDate(date)"
            @mouseenter="onCellMouseEnter(date)"
            @mouseleave="onCellMouseLeave"
          >
            {{ date.day }}
          </button>
        </div>
        <div class="calendar-footer">
          <span class="calendar-range-text">{{ formattedRangeText }}</span>
          <div class="calendar-footer-actions">
            <button v-if="isSelectingRange" class="cancel-select-btn" @click="cancelRangeSelection">取消</button>
          </div>
        </div>
      </div>

      <!-- 右侧时段列表 -->
      <div class="time-slot-list">
        <div
          v-for="slot in currentTimeSlots"
          :key="slot.key"
          class="time-slot-item"
          :class="{ editing: editingKey === slot.key }"
        >
          <!-- 查看模式 -->
          <template v-if="editingKey !== slot.key">
            <div class="slot-left">
              <div class="slot-name">{{ slot.name }}</div>
              <div class="slot-tag" :style="{ background: slot.tagBg, color: slot.tagColor }">
                {{ slot.tag }}
              </div>
            </div>
            <div class="slot-range">{{ formatRange(slot.periods) }}</div>
            <div class="slot-actions">
              <button class="slot-action-btn edit" title="编辑" @click="startEdit(slot)">
                <Edit3 :size="14" />
              </button>
              <button class="slot-action-btn delete" title="删除最后一个时间段" @click="deleteSlotLastPeriod(slot)">
                <Trash2 :size="14" />
              </button>
              <button class="slot-action-btn add" title="新增时间段" @click="addSlotPeriod(slot)">
                <Plus :size="14" />
              </button>
            </div>
          </template>

          <!-- 编辑模式 -->
          <template v-else>
            <div class="slot-edit-panel">
              <div class="slot-edit-header">
                <div class="slot-name">{{ slot.name }}</div>
                <div class="slot-edit-actions">
                  <button class="save-btn" @click="saveEdit">
                    <Save :size="14" />
                    <span>保存设置</span>
                  </button>
                  <button class="cancel-btn" @click="cancelEdit">
                    <X :size="14" />
                  </button>
                </div>
              </div>
              <div class="period-list">
                <div
                  v-for="(period, idx) in editingPeriods"
                  :key="idx"
                  class="period-row"
                >
                  <div class="period-inputs">
                    <div class="time-field">
                      <span class="time-label">开始</span>
                      <input v-model="period.start" type="time" class="time-input" />
                    </div>
                    <span class="time-sep">至</span>
                    <div class="time-field">
                      <span class="time-label">结束</span>
                      <input v-model="period.end" type="time" class="time-input" />
                    </div>
                  </div>
                  <button class="period-delete-btn" title="删除该时间段" @click="deletePeriod(idx)">
                    <Trash2 :size="13" />
                  </button>
                </div>
                <button class="add-period-btn" @click="addPeriod">
                  <Plus :size="14" />
                  <span>新增时间段</span>
                </button>
              </div>
              <div class="slot-tag" :style="{ background: slot.tagBg, color: slot.tagColor }">
                {{ slot.tag }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Clock, ToggleRight, ToggleLeft,
  Edit3, Trash2, Plus,
  ChevronLeft, ChevronRight,
  Save, X
} from 'lucide-vue-next'
import type { RegionInfo } from '../data/regionData'
import dayjs from 'dayjs'

const props = defineProps<{
  selectedRegion: {
    path: string
    province: string
    city: string
    district: string
    data: RegionInfo | null
  } | null
}>()

const autoUpdate = ref(true)

/* ============================================================
 * 类型定义
 * ============================================================ */

/** 日历日期键值，用于日历中的日期表示 */
interface DateKey {
  year: number
  month: number
  day: number
}

/** 日历网格中的日期对象 */
interface CalendarDate {
  year: number
  month: number
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

/** 单段日期范围 */
interface DateRange {
  id: string
  start: DateKey
  end: DateKey
}

/** 时间区间 */
interface TimePeriod {
  start: string
  end: string
}

/** 时段配置 */
interface TimeSlot {
  key: string
  name: string
  periods: TimePeriod[]
  tag: string
  tagBg: string
  tagColor: string
}

/** Tab 数据，每个 Tab 拥有独立的按月存储的日期范围和时段配置 */
interface TabData {
  key: string
  label: string
  /** 按月份存储日期范围数组，key 为 "YYYY-MM" */
  dateRangesByMonth: Record<string, DateRange[]>
  /** 时段配置 */
  timeSlots: TimeSlot[]
}

/* ============================================================
 * 常量定义
 * ============================================================ */

/** 范围颜色池，用于多段不连续范围的视觉区分 */
const RANGE_COLORS = [
  '#02A7F0', // 蓝色
  '#FF6B35', // 橙色
  '#4ADE80', // 绿色
  '#FF4D4F', // 红色
  '#A855F7', // 紫色
  '#FACC15', // 黄色
]

/** 星期标签 */
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

/** 当前系统日期 */
const today = dayjs()

/* ============================================================
 * Tab 数据与状态管理
 * ============================================================ */

/**
 * 获取默认的尖/峰/平/谷四个时段配置
 * @returns 默认时段配置数组
 */
function getDefaultTimeSlots(): TimeSlot[] {
  return [
    {
      key: 'sharp',
      name: '尖时段',
      periods: [{ start: '11:00', end: '12:00' }],
      tag: '尖峰',
      tagBg: 'rgba(255, 107, 53, 0.2)',
      tagColor: '#FF6B35'
    },
    {
      key: 'peak',
      name: '峰时段',
      periods: [{ start: '10:00', end: '11:00' }, { start: '14:00', end: '19:00' }],
      tag: '高峰',
      tagBg: 'rgba(255, 77, 77, 0.2)',
      tagColor: '#FF4D4D'
    },
    {
      key: 'flat',
      name: '平时段',
      periods: [{ start: '08:00', end: '10:00' }, { start: '12:00', end: '14:00' }, { start: '19:00', end: '23:59' }],
      tag: '平常',
      tagBg: 'rgba(74, 158, 255, 0.2)',
      tagColor: '#4A9EFF'
    },
    {
      key: 'valley',
      name: '谷时段',
      periods: [{ start: '00:00', end: '08:00' }],
      tag: '低谷',
      tagBg: 'rgba(74, 158, 255, 0.2)',
      tagColor: '#4A9EFF'
    }
  ]
}

/**
 * 创建一个新的空 Tab 数据
 * @param label Tab 显示名称
 * @returns 新的 TabData 实例
 */
function createEmptyTabData(label: string): TabData {
  return {
    key: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    dateRangesByMonth: {},
    timeSlots: getDefaultTimeSlots()
  }
}

/** 动态 Tab 列表，支持增删改操作 */
const tabsData = ref<TabData[]>([
  createEmptyTabData('平日'),
  createEmptyTabData('特殊日期')
])

/** 当前激活的 Tab 的 key */
const activeTabKey = ref(tabsData.value[0].key)

/* ============================================================
 * 当前 Tab 的计算属性
 * ============================================================ */

/** 当前激活的 Tab 数据对象 */
const activeTab = computed<TabData | undefined>(() => {
  return tabsData.value.find(t => t.key === activeTabKey.value)
})

/** 当前月份的 key 字符串，格式 "YYYY-MM" */
const monthKey = computed<string>(() => {
  return `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`
})

/** 当前 Tab + 当前月份对应的日期范围数组 */
const currentDateRanges = computed<DateRange[]>(() => {
  if (!activeTab.value) return []
  return activeTab.value.dateRangesByMonth[monthKey.value] || []
})

/** 当前 Tab 的时段配置 */
const currentTimeSlots = computed<TimeSlot[]>(() => {
  if (!activeTab.value) return getDefaultTimeSlots()
  return activeTab.value.timeSlots
})

/* ============================================================
 * 日历状态
 * ============================================================ */

/** 当前显示的月份基准日期 */
const currentDate = ref(dayjs('2026-03-01'))
/** 当前年份 */
const currentYear = computed(() => currentDate.value.year())
/** 当前月份 (0-based) */
const currentMonth = computed(() => currentDate.value.month())

/** 是否处于"已选起始，等待选结束"的中间状态 */
const isSelectingRange = ref(false)
/** 选择过程中的临时起始日期 */
const tempRangeStart = ref<DateKey | null>(null)
/** 鼠标悬停日期，用于选择过程中的范围预览 */
const hoverDate = ref<DateKey | null>(null)

/* ============================================================
 * 工具函数
 * ============================================================ */

/**
 * 将日期对象转为可比较的字符串键
 * @param date 日期对象
 * @returns 格式为 YYYY-MM-DD 的字符串
 */
function toDateKey(date: DateKey): string {
  return `${date.year}-${String(date.month + 1).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

/**
 * 将日期对象转为 dayjs 实例，便于时间戳比较
 * @param date 日期对象
 * @returns dayjs 实例
 */
function toDateDayjs(date: DateKey): dayjs.Dayjs {
  return dayjs().year(date.year).month(date.month).date(date.day)
}

/**
 * 解析时段范围字符串为时间区间数组
 * 格式："HH:MM - HH:MM, HH:MM - HH:MM" → [{ start, end }, ...]
 * @param range 时段范围字符串
 * @returns 时间区间数组
 */
function parseRange(range: string): TimePeriod[] {
  if (!range || range.trim() === '--') return []
  return range.split(',').map(part => {
    const [start, end] = part.trim().split('-').map(s => s.trim())
    return { start: start || '00:00', end: end || '00:00' }
  })
}

/**
 * 将时间区间数组格式化为时段范围字符串
 * @param periods 时间区间数组
 * @returns 格式化后的字符串（如 "10:00 - 11:00, 14:00 - 19:00"）
 */
function formatRange(periods: TimePeriod[]): string {
  if (periods.length === 0) return '--'
  return periods.map(p => `${p.start} - ${p.end}`).join(', ')
}

/**
 * 格式化单段日期范围为文本
 * @param range 单段日期范围
 * @returns 格式化后的文本（如 "03-01 至 03-05"）
 */
function formatSingleDateRange(range: DateRange): string {
  const start = toDateKey(range.start).slice(5)
  const end = toDateKey(range.end).slice(5)
  return start === end ? start : `${start} 至 ${end}`
}

/* ============================================================
 * 多段范围判断函数
 * ============================================================ */

/**
 * 获取指定日期在已选范围中匹配到的信息
 * @param date 日历日期对象
 * @returns 匹配的范围及位置信息，未匹配返回 null
 */
function getDateRangeMatch(date: CalendarDate): { range: DateRange; position: 'start' | 'end' | 'between' } | null {
  for (const range of currentDateRanges.value) {
    if (!isDateInRange(date, range)) continue
    const d = toDateDayjs({ year: date.year, month: date.month, day: date.day })
    const start = toDateDayjs(range.start)
    const end = toDateDayjs(range.end)
    let position: 'start' | 'end' | 'between' = 'between'
    if (d.isSame(start, 'day')) position = 'start'
    else if (d.isSame(end, 'day')) position = 'end'
    return { range, position }
  }
  return null
}

/**
 * 判断指定日期是否在某段范围内（含起止）
 * @param date 日历日期对象
 * @param range 待检测的日期范围
 * @returns 是否在该范围内
 */
function isDateInRange(date: CalendarDate, range: DateRange): boolean {
  const d = toDateDayjs({ year: date.year, month: date.month, day: date.day })
  const start = toDateDayjs(range.start)
  const end = toDateDayjs(range.end)
  return !d.isBefore(start) && !d.isAfter(end)
}

/**
 * 判断新范围是否与已有范围重叠
 * @param newStart 新范围起始
 * @param newEnd 新范围结束
 * @returns 若重叠则返回冲突的范围描述，否则返回 null
 */
function checkOverlap(newStart: DateKey, newEnd: DateKey): string | null {
  const ns = toDateDayjs(newStart)
  const ne = toDateDayjs(newEnd)
  for (const range of currentDateRanges.value) {
    const rs = toDateDayjs(range.start)
    const re = toDateDayjs(range.end)
    // 两段有交集即视为重叠：!(ne.before(rs) || ns.after(re))
    if (!ne.isBefore(rs) && !ns.isAfter(re)) {
      return formatSingleDateRange(range)
    }
  }
  return null
}

/**
 * 判断日期是否在选择过程中的预览范围内（临时起始与悬停之间）
 * @param date 日历日期对象
 * @returns 是否在预览范围内
 */
function isInPreviewRange(date: CalendarDate): boolean {
  if (!isSelectingRange.value || !tempRangeStart.value || !hoverDate.value) return false
  const d = toDateDayjs({ year: date.year, month: date.month, day: date.day })
  const start = toDateDayjs(tempRangeStart.value)
  const hover = toDateDayjs(hoverDate.value)
  const [earlier, later] = start.isBefore(hover) ? [start, hover] : [hover, start]
  return !d.isBefore(earlier) && !d.isAfter(later)
}

/* ============================================================
 * 日历网格生成
 * ============================================================ */

/**
 * 生成日历网格数据（6行×7列 = 42格）
 * 包含上月末尾填充、当月全部日期和下月开头填充，
 * 每格标记是否属于当前月以及是否为今天
 */
const calendarDates = computed<CalendarDate[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDayOfMonth = dayjs().year(year).month(month).date(1)
  const lastDayOfMonth = dayjs().year(year).month(month).endOf('month')
  const daysInMonth = lastDayOfMonth.date()
  const startWeekday = firstDayOfMonth.day()

  const dates: CalendarDate[] = []

  // 上月填充
  const prevMonthLastDay = dayjs().year(year).month(month).date(0).date()
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
      isToday: year === today.year() && month === today.month() && day === today.date()
    })
  }

  // 下月填充（凑满6行42格）
  const remaining = 42 - dates.length
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 11 ? 0 : month + 1
    dates.push({
      year: month === 11 ? year + 1 : year,
      month: nextMonth,
      day,
      isCurrentMonth: false,
      isToday: false
    })
  }

  return dates
})

/**
 * 统一计算每个日历格子的动态 class
 * @param date 日历日期对象
 * @returns class 对象
 */
function getCalendarCellClass(date: CalendarDate): Record<string, boolean> {
  const match = getDateRangeMatch(date)
  /** 起止同一天时，等同于单日期选中 */
  const isSingleSelected = match && match.position === 'start' &&
    toDateDayjs(match.range.start).isSame(toDateDayjs(match.range.end), 'day')

  return {
    'other-month': !date.isCurrentMonth,
    'today': date.isToday,
    'range-start': !!match && match.position === 'start' && !isSingleSelected,
    'range-end': !!match && match.position === 'end' && !isSingleSelected,
    'range-between': !!match && match.position === 'between',
    'range-preview': isInPreviewRange(date),
    'selected': !!isSingleSelected
  }
}

/**
 * 计算每个日历格子的动态内联样式（主要用于多色范围区分）
 * @param date 日历日期对象
 * @returns 内联样式对象
 */
function getCalendarCellStyle(date: CalendarDate): Record<string, string> {
  const match = getDateRangeMatch(date)
  if (!match) return {}

  const rangeIndex = currentDateRanges.value.findIndex(r => r.id === match.range.id)
  const color = RANGE_COLORS[rangeIndex % RANGE_COLORS.length]
  const isSingle = match.position === 'start' &&
    toDateDayjs(match.range.start).isSame(toDateDayjs(match.range.end), 'day')

  if (isSingle) {
    return { background: color, color: '#fff', fontWeight: '600' as const }
  }

  switch (match.position) {
    case 'start':
      return { background: color, color: '#fff', fontWeight: '600' as const, borderRadius: '6px 0 0 6px' }
    case 'end':
      return { background: color, color: '#fff', fontWeight: '600' as const, borderRadius: '0 6px 6px 0' }
    case 'between':
      return { background: hexToRgba(color, 0.15), borderRadius: '0' }
    default:
      return {}
  }
}

/**
 * 将十六进制颜色转为带透明度的 rgba 值
 * @param hex 十六进制颜色值（如 "#02A7F0"）
 * @param alpha 透明度 0~1
 * @returns rgba 格式字符串
 */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 底部格式化的范围统计文本 */
const formattedRangeText = computed<string>(() => {
  const count = currentDateRanges.value.length
  if (count === 0) return '未选择日期范围'
  if (count === 1) return `已选 1 个范围：${formatSingleDateRange(currentDateRanges.value[0])}`
  return `已选 ${count} 个日期范围`
})

/* ============================================================
 * 月份导航
 * ============================================================ */

/** 切换到上一个月 */
function prevMonth() {
  currentDate.value = dayjs().year(currentYear.value).month(currentMonth.value - 1).date(1)
}

/** 切换到下一个月 */
function nextMonth() {
  currentDate.value = dayjs().year(currentYear.value).month(currentMonth.value + 1).date(1)
}

/* ============================================================
 * 日期选择逻辑（支持多段不连续范围）
 * ============================================================ */

/**
 * 选中日历中的某个日期，支持多次两击添加多个不连续范围
 * 第一次点击设临时起始，第二次点击确认并添加一段范围
 * 点击同一天取消当前选择；点击已有范围内的日期则删除该范围
 * @param date 日历日期对象
 */
function selectDate(date: CalendarDate) {
  const clicked: DateKey = { year: date.year, month: date.month, day: date.day }

  // 只允许点击当月的日期
  if (!date.isCurrentMonth) return

  if (isSelectingRange.value) {
    // 第二次点击 —— 确定结束日期
    const startDayjs = toDateDayjs(tempRangeStart.value!)
    const clickedDayjs = toDateDayjs(clicked)

    // 点击同一天 → 取消选择
    if (startDayjs.isSame(clickedDayjs, 'day')) {
      cancelRangeSelection()
      return
    }

    // 确定起止顺序（自动排序）
    const [start, end] = startDayjs.isBefore(clickedDayjs) ? [tempRangeStart.value!, clicked] : [clicked, tempRangeStart.value!]

    // 检测重叠
    const overlapResult = checkOverlap(start, end)
    if (overlapResult) {
      ElMessage.warning(`新范围与已有范围「${overlapResult}」重叠，请重新选择`)
      cancelRangeSelection()
      return
    }

    addDateRange(start, end)
    // 自动重置为可继续选择下一段的状态
    tempRangeStart.value = null
    isSelectingRange.value = false
  } else {
    // 检查点击的是否已在某范围内 → 则删除该范围
    const existingMatch = getDateRangeMatch(date)
    if (existingMatch) {
      removeDateRange(existingMatch.range.id)
      return
    }

    // 第一次点击 —— 设临时起始日期
    tempRangeStart.value = clicked
    isSelectingRange.value = true
  }
}

/**
 * 添加一段日期范围到当前 Tab 当前月份数据中
 * @param start 起始日期
 * @param end 结束日期
 */
function addDateRange(start: DateKey, end: DateKey) {
  if (!activeTab.value) return
  const mk = monthKey.value
  if (!activeTab.value.dateRangesByMonth[mk]) {
    activeTab.value.dateRangesByMonth[mk] = []
  }
  activeTab.value.dateRangesByMonth[mk].push({
    id: `range-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    start,
    end
  })
}

/**
 * 根据范围 ID 删除指定的一段日期范围
 * @param rangeId 要删除的范围 ID
 */
function removeDateRange(rangeId: string) {
  if (!activeTab.value) return
  const mk = monthKey.value
  const ranges = activeTab.value.dateRangesByMonth[mk]
  if (ranges) {
    const index = ranges.findIndex(r => r.id === rangeId)
    if (index !== -1) ranges.splice(index, 1)
  }
}

/** 取消当前的正在进行的范围选择过程 */
function cancelRangeSelection() {
  tempRangeStart.value = null
  isSelectingRange.value = false
}

/** 鼠标悬停日历格子，更新预览状态 */
function onCellMouseEnter(date: CalendarDate) {
  if (!isSelectingRange.value || !date.isCurrentMonth) return
  hoverDate.value = { year: date.year, month: date.month, day: date.day }
}

/** 鼠标移出日历格子，清除预览状态 */
function onCellMouseLeave() {
  hoverDate.value = null
}

/* ============================================================
 * Tab 操作：切换 / 编辑 / 删除 / 新建
 * ============================================================ */

/**
 * 切换到指定 Tab
 * @param tabKey 目标 Tab 的 key
 */
function switchTab(tabKey: string) {
  // 取消进行中的范围选择
  cancelRangeSelection()
  // 取消时段编辑
  cancelEdit()
  activeTabKey.value = tabKey
}

/**
 * 编辑当前 Tab 名称
 * 使用 Element Plus MessageBox 弹出输入框让用户修改名称
 */
async function editCurrentTabName() {
  if (!activeTab.value) return
  try {
    const { value } = await ElMessageBox.prompt(
      '请输入新的 Tab 名称',
      '编辑 Tab 名称',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: activeTab.value.label,
        inputPattern: /\S+/,
        inputErrorMessage: '名称不能为空',
        customClass: 'tab-name-dialog'
      }
    )
    if (value && value.trim()) {
      activeTab.value.label = value.trim()
    }
  } catch {
    // 用户取消了编辑
  }
}

/**
 * 删除当前 Tab（至少保留一个 Tab）
 * 使用 Element Plus MessageBox 弹出二次确认
 */
async function deleteCurrentTab() {
  if (!activeTab.value) return
  if (tabsData.value.length <= 1) {
    ElMessage.warning('至少保留一个 Tab')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除 Tab「${activeTab.value.label}」及其所有日期范围和时段配置吗？`,
      '删除 Tab',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    const deleteIndex = tabsData.value.findIndex(t => t.key === activeTabKey.value)
    if (deleteIndex !== -1) {
      tabsData.value.splice(deleteIndex, 1)
      // 切换到相邻 Tab 或第一个 Tab
      const nextIndex = Math.min(deleteIndex, tabsData.value.length - 1)
      activeTabKey.value = tabsData.value[nextIndex]?.key || ''
      cancelEdit()
    }
  } catch {
    // 用户取消了删除
  }
}

/**
 * 新建一个 Tab 并自动切换到它
 */
function createNewTab() {
  const defaultLabel = `自定义${tabsData.value.length + 1}`
  const newTab = createEmptyTabData(defaultLabel)
  tabsData.value.push(newTab)
  switchTab(newTab.key)
}

/* ============================================================
 * 时段列表编辑逻辑（基于当前 Tab 的 timeSlots）
 * ============================================================ */

/** 当前正在编辑的时段 key */
const editingKey = ref<string | null>(null)
/** 编辑缓冲区：当前时段的时间区间副本 */
const editingPeriods = ref<TimePeriod[]>([])

/** 进入时段编辑模式，深拷贝当前时段数据到编辑缓冲区 */
function startEdit(slot: TimeSlot) {
  editingKey.value = slot.key
  editingPeriods.value = slot.periods.map(p => ({ ...p }))
}

/** 取消编辑，清空编辑缓冲区 */
function cancelEdit() {
  editingKey.value = null
  editingPeriods.value = []
}

/** 保存编辑：将编辑缓冲区中有效的时间区间写回当前 Tab 对应时段 */
function saveEdit() {
  if (!activeTab.value) return
  const slot = activeTab.value.timeSlots.find(s => s.key === editingKey.value)
  if (slot) {
    slot.periods = editingPeriods.value.filter(p => p.start && p.end).map(p => ({ ...p }))
  }
  editingKey.value = null
  editingPeriods.value = []
}

/** 在编辑缓冲区中删除指定索引的时间区间 */
function deletePeriod(index: number) {
  editingPeriods.value.splice(index, 1)
}

/** 在编辑缓冲区中新增一个空白时间区间 */
function addPeriod() {
  editingPeriods.value.push({ start: '00:00', end: '00:00' })
}

/** 删除指定时段的最后一个时间区间 */
function deleteSlotLastPeriod(slot: TimeSlot) {
  if (slot.periods.length > 0) {
    slot.periods.pop()
  }
}

/** 在指定时段末尾新增一个空白时间区间 */
function addSlotPeriod(slot: TimeSlot) {
  slot.periods.push({ start: '00:00', end: '00:00' })
}

/* ============================================================
 * 地区联动监听
 * ============================================================ */

/**
 * 监听地区切换，动态更新当前 Tab 的时段列表
 * 仅当有选中地区数据时覆盖当前 Tab 的时段，否则恢复默认配置
 */
watch(() => props.selectedRegion?.data, (regionData) => {
  if (!activeTab.value) return
  if (regionData) {
    activeTab.value.timeSlots = regionData.timeSlots.map(slot => ({
      ...slot,
      periods: parseRange(slot.range)
    }))
  } else {
    activeTab.value.timeSlots = getDefaultTimeSlots()
  }
})
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

.action-btn:not(:disabled):hover {
  background: rgba(2, 167, 240, 0.2);
  color: #02A7F0;
}

.action-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.action-btn.danger:not(:disabled):hover {
  background: rgba(255, 77, 77, 0.2);
  color: #FF4D4D;
}

.action-btn.success:not(:disabled):hover {
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
  position: relative;
}

.calendar-day.other-month {
  color: rgba(255, 255, 255, 0.2);
}

.calendar-day:hover:not(.selected):not(.range-start):not(.range-end) {
  background: rgba(2, 167, 240, 0.15);
}

/* 单日期选中（起止同一天）—— 由内联 style 控制背景色 */
.calendar-day.selected {
  color: #fff;
}

/* 范围起始日期 —— 由内联 style 控制背景色和圆角 */
.calendar-day.range-start::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: inherit;
  opacity: 0.25;
}

/* 范围结束日期 —— 由内联 style 控制背景色和圆角 */
.calendar-day.range-end::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: inherit;
  opacity: 0.25;
}

/* 起始与结束相邻时，避免伪元素重叠 */
.calendar-day.range-start.range-end {
  border-radius: 6px;
}

.calendar-day.range-start.range-end::before,
.calendar-day.range-start.range-end::after {
  display: none;
}

/* 范围内日期 —— 由内联 style 控制背景色 */
.calendar-day.range-between {
}

/* 选择过程中的预览范围 */
.calendar-day.range-preview {
  background: rgba(2, 167, 240, 0.08);
  border-radius: 0;
}

.calendar-day.today:not(.selected):not(.range-start):not(.range-end) {
  border: 1px solid rgba(2, 167, 240, 0.5);
}

.calendar-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-footer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.calendar-range-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 220px;
}

.cancel-select-btn {
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(255, 77, 77, 0.15);
  color: #FF4D4D;
  border: 1px solid rgba(255, 77, 77, 0.3);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.cancel-select-btn:hover {
  background: rgba(255, 77, 77, 0.25);
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

.slot-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 72px;
  flex-shrink: 0;
}

.slot-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.slot-range {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 12px;
}

.slot-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  align-self: flex-start;
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

/* ---------- 编辑模式 ---------- */
.time-slot-item.editing {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 14px 16px;
}

.slot-edit-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slot-edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.slot-edit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 4px;
  background: linear-gradient(135deg, #02A7F0 0%, #0284c7 100%);
  border: none;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.save-btn:hover {
  opacity: 0.9;
}

.cancel-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #FF4D4D;
}

.period-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.period-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.period-inputs {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(10, 23, 42, 0.6);
  border: 1px solid rgba(129, 211, 248, 0.12);
  border-radius: 6px;
  padding: 8px 12px;
}

.time-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.time-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.time-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 13px;
  color: #fff;
  outline: none;
  transition: border-color 0.2s;
}

.time-input:focus {
  border-color: rgba(2, 167, 240, 0.5);
}

.time-input::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}

.time-sep {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  padding-top: 14px;
}

.period-delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(129, 211, 248, 0.12);
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.period-delete-btn:hover {
  background: rgba(255, 77, 77, 0.2);
  color: #FF4D4D;
}

.add-period-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  background: rgba(76, 175, 80, 0.1);
  border: 1px dashed rgba(76, 175, 80, 0.3);
  color: #4CAF50;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.add-period-btn:hover {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
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
