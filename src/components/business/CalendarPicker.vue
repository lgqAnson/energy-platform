<template>
  <div class="calendar-box" @click.self="closePickers">
    <!-- 标题栏：年月 + 操作按钮 -->
    <div class="calendar-header">
      <div class="cal-title" @click.stop>
        <span class="title-part clickable" @click="toggleYearPicker">{{ calendarYear }} 年</span>
        <em class="title-part clickable" @click="toggleMonthPicker">{{ calendarMonth + 1 }} 月</em>
        <span v-if="crossMonthHint" class="cross-month-hint">{{ crossMonthHint }}</span>
      </div>
      <div class="header-actions">
        <!-- 选择模式下的取消/退出按钮 -->
        <button
          v-if="isSelecting"
          type="button"
          :class="[props.mode === 'range' ? 'btn-cancel-range' : 'btn-cancel-select']"
          @click="handleCancelBtn"
        >{{ cancelBtnText }}</button>
        <button
          type="button"
          :class="[isSelecting ? 'btn-save' : 'btn-pick']"
          :disabled="(props.mode === 'range') && isSelecting && props.modelValue.length === 0"
          @click="handleActionBtn"
        >{{ actionBtnText }}</button>
      </div>
    </div>

    <!-- 年份选择面板 -->
    <Transition name="picker-fade">
      <div v-if="showYearPicker" class="picker-panel year-picker" @click.stop>
        <div class="picker-grid">
          <button
            v-for="y in yearOptions"
            :key="y"
            type="button"
            :class="['picker-item', { active: y === calendarYear }]"
            @click="selectYear(y)"
          >{{ y }}</button>
        </div>
      </div>
    </Transition>

    <!-- 月份选择面板 -->
    <Transition name="picker-fade">
      <div v-if="showMonthPicker" class="picker-panel month-picker" @click.stop>
        <div class="picker-grid month-grid">
          <button
            v-for="m in 12"
            :key="m"
            type="button"
            :class="['picker-item', { active: m - 1 === calendarMonth }]"
            @click="selectMonth(m - 1)"
          >{{ m }}月</button>
        </div>
      </div>
    </Transition>

    <!-- 星期标题行（中文 + 英文双行） -->
    <div class="calendar-weekdays">
      <div v-for="(w, i) in weekHeaders" :key="i" class="weekday-cell">
        <span class="weekday-cn">{{ w.cn }}</span>
        <span class="weekday-en">{{ w.en }}</span>
      </div>
    </div>

    <!-- 日期网格（每格两行内容：日期数字 + 农历文字） -->
    <div class="calendar-days" :class="{ selecting: isSelecting }">
      <div
        v-for="(cell, idx) in calendarDays"
        :key="idx"
        class="cal-day"
        :class="getCellClass(cell)"
        @click="cell.current && isSelecting && handleCellClick(cell.date)"
        @mouseenter="cell.current && isSelecting && handleCellMouseEnter(cell.date)"
        @mouseleave="handleCellMouseLeave"
      >
        <span class="day-num">{{ cell.day }}</span>
        <span class="day-lunar">{{ cell.lunarText }}</span>
      </div>
    </div>

    <!-- 底部范围统计文本（仅 range 模式下显示） -->
    <div v-if="props.mode === 'range'" class="calendar-footer-text">
      {{ footerText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

const props = withDefaults(defineProps<{
  /** 选中的日期数组（select 模式为日期列表，range 模式为范围内所有日期的展开） */
  modelValue: string[]
  /** 是否禁用 */
  disabled?: boolean
  /** 日历模式：'select' 为点击切换单日期，'range' 为两击选择范围 */
  mode?: 'select' | 'range'
}>(), {
  disabled: false,
  mode: 'select',
})

const emit = defineEmits<{
  'update:modelValue': [dates: string[]]
  /** 范围模式：用户完成一段范围选择时触发 */
  'range-add': [start: string, end: string]
  /** 范围模式：用户点击已选中的日期删除该范围时触发 */
  'range-remove': [date: string]
  /** 用户点击保存/确认按钮时触发（表示确认当前选中并退出选择模式） */
  confirm: []
}>()

/** 星期头配置（中文 + 英文缩写） */
const weekHeaders = [
  { cn: '周一', en: 'MON' },
  { cn: '周二', en: 'TUE' },
  { cn: '周三', en: 'WED' },
  { cn: '周四', en: 'THU' },
  { cn: '周五', en: 'FRI' },
  { cn: '周六', en: 'SAT' },
  { cn: '周日', en: 'SUN' },
]

/** 农历日期文字映射表（每月固定顺序，简化模拟） */
const LUNAR_DAY_TEXTS = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
]

/** 特殊节日/节气标注（月-日 -> 文字） */
const SPECIAL_DATES: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '4-1': '愚人节',
  '4-4': '清明',
  '4-5': '清明',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节',
}

/** 节气近似日期（简化） */
const SOLAR_TERMS: Record<string, string> = {
  '2-4': '立春','2-19': '雨水',
  '3-5': '惊蛰','3-20': '春分',
  '4-5': '清明','4-20': '谷雨',
  '5-6': '立夏','5-21': '小满',
  '6-6': '芒种','6-21': '夏至',
  '7-7': '小暑','7-23': '大暑',
  '8-7': '立秋','8-23': '处暑',
  '9-8': '白露','9-23': '秋分',
  '10-8': '寒露','10-23': '霜降',
  '11-7': '立冬','11-22': '小雪',
  '12-7': '大雪','12-22': '冬至',
  '1-5': '小寒','1-20': '大寒',
}

/**
 * 获取指定日期的农历显示文字
 * 优先使用特殊日期/节气，其次使用农历日序
 * @param month 月份（1-based）
 * @param day 日期
 * @returns 农历/节日/节气显示文字
 */
function getLunarText(month: number, day: number): string {
  const key = `${month}-${day}`
  if (SPECIAL_DATES[key]) return SPECIAL_DATES[key]
  if (SOLAR_TERMS[key]) return SOLAR_TERMS[key]
  /** 简化农历计算：用 day 索引取模（仅视觉效果，非真实农历算法） */
  const lunarIdx = ((month * 31 + day) % 30)
  return LUNAR_DAY_TEXTS[lunarIdx] || String(day)
}

/* ====== 日历状态 ====== */

const calendarYear = ref(dayjs().year())
const calendarMonth = ref(dayjs().month())

/** 年份选择面板显示状态 */
const showYearPicker = ref(false)
/** 月份选择面板显示状态 */
const showMonthPicker = ref(false)
/** 是否处于日期选择模式（默认 false，点击"选择日期"后进入） */
const isSelecting = ref(false)

/* ====== 范围选择模式专用状态 ====== */

/** 范围选择中：临时起始日期字符串 */
const tempStartDate = ref<string | null>(null)
/** 范围选择中：鼠标悬停日期字符串 */
const hoverDateStr = ref<string | null>(null)
/** 范围添加后的防抖时间戳（防止快速双击导致的 add→remove 竞态） */
let lastRangeAddTime = 0
/** 防抖间隔（毫秒） */
const RANGE_ADD_DEBOUNCE_MS = 300

/* ====== 计算属性 ====== */

/** 操作按钮文字（根据选择状态动态切换） */
const actionBtnText = computed(() => {
  if (!isSelecting.value) return '选择日期'
  return '保存'
})

/** 取消/退出按钮文字（根据是否有临时选择动态切换） */
const cancelBtnText = computed(() => {
  if (props.mode === 'range' && tempStartDate.value) return '取消'
  return '退出'
})

/** 今日日期字符串 YYYY-MM-DD */
const todayStr = computed(() => dayjs().format('YYYY-MM-DD'))

/** 年份选项（当前年前后各5年，共11年） */
const yearOptions = computed(() => {
  const y = dayjs().year()
  return Array.from({ length: 11 }, (_, i) => y - 5 + i)
})

/** 底部范围统计文本（仅 range 模式使用） */
const footerText = computed(() => {
  if (props.mode !== 'range') return ''
  const count = props.modelValue.length
  if (count === 0) return '未选择日期范围'
  return `已选 ${count} 个日期`
})

/** 所有已选中的日期集合 */
const selectedSet = computed(() => new Set(props.modelValue))

/**
 * 跨月选择状态提示文字
 * 当 tempStartDate 存在但不在当前显示月份时，提醒用户正在跨月选择
 */
const crossMonthHint = computed(() => {
  if (props.mode !== 'range' || !isSelecting.value || !tempStartDate.value) return ''
  const startM = dayjs(tempStartDate.value).month()
  const startY = dayjs(tempStartDate.value).year()
  if (startY === calendarYear.value && startM === calendarMonth.value) return ''
  const mText = `${tempStartDate.value.substring(5, 7)}月${tempStartDate.value.substring(8)}日`
  return `正在选择中（起点：${mText}）`
})

/* ====== 日历单元格数据结构 ====== */

interface CalendarCell {
  day: number
  current: boolean
  date: string
  /** 农历/节日/节气文字 */
  lunarText: string
  /** 是否在选中范围内 */
  inRange: boolean
  /** 是否为选中范围的起始 */
  isStart: boolean
  /** 是否为选中范围的结束 */
  isEnd: boolean
  /** 是否为今日 */
  isToday: boolean
  /** 单独选中的非连续日期 */
  selectedSingle: boolean
}

/**
 * 生成当前年月对应的日历网格（6 行 × 7 列）
 */
const calendarDays = computed<CalendarCell[]>(() => {
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = dayjs().year(year).month(month).date(1)
  const lastDay = dayjs().year(year).month(month).endOf('month')
  const daysInMonth = lastDay.date()
  /** 星期几：dayjs 返回 0(周日)-6(周六)，转换为 1(周一)-7(周日) */
  const rawWeekday: number = firstDay.day()
  const startWeekday: number = rawWeekday === 0 ? 7 : rawWeekday

  const days: CalendarCell[] = []

  // 上月尾部填充
  const prevMonthLastDay = dayjs().year(year).month(month).date(0).date()
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    /** 上月月份：0-based 转 1-based，一月时上一年为12月 */
    const prevMonthVal = month === 0 ? 12 : month
    days.push({
      day: d, current: false, date: '',
      lunarText: getLunarText(prevMonthVal, d),
      inRange: false, isStart: false, isEnd: false, isToday: false, selectedSingle: false,
    })
  }

  // 当月日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const isSelected = selectedSet.value.has(date)
    const isToday = date === todayStr.value
    days.push({
      day: i,
      current: true,
      date,
      lunarText: getLunarText(month + 1, i),
      inRange: isSelected,
      isStart: isSelected,
      isEnd: isSelected,
      isToday,
      selectedSingle: isSelected,
    })
  }

  // 下月起始填充
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    /** 下月月份：0-based 转 1-based，十二月时下一年为1月 */
    const nextMonthVal = month >= 11 ? 1 : month + 2
    days.push({
      day: i, current: false, date: '',
      lunarText: getLunarText(nextMonthVal, i),
      inRange: false, isStart: false, isEnd: false, isToday: false, selectedSingle: false,
    })
  }

  // 后处理：修正选中范围的连通胶囊效果
  for (let i = 0; i < days.length; i++) {
    const cell = days[i]
    if (!cell.current || !selectedSet.value.has(cell.date)) continue
    const prevCell = i > 0 ? days[i - 1] : null
    const nextCell = i < days.length - 1 ? days[i + 1] : null
    const prevSelected = prevCell?.current && selectedSet.value.has(prevCell.date)
    const nextSelected = nextCell?.current && selectedSet.value.has(nextCell.date)

    /** 前后均无选中 → 独立单选胶囊 */
    if (!prevSelected && !nextSelected) {
      cell.inRange = false
      cell.isStart = false
      cell.isEnd = false
      cell.selectedSingle = true
      continue
    }
    /** 仅前方无选中 → 范围起点 */
    if (!prevSelected) {
      cell.isStart = true
      cell.isEnd = false
      cell.inRange = true
      cell.selectedSingle = false
    }
    /** 仅后方无选中 → 范围终点 */
    else if (!nextSelected) {
      cell.isStart = false
      cell.isEnd = true
      cell.inRange = true
      cell.selectedSingle = false
    }
    /** 前后都有选中 → 范围中间 */
    else {
      cell.inRange = true
      cell.isStart = false
      cell.isEnd = false
      cell.selectedSingle = false
    }
  }

  return days
})

/**
 * 统一计算每个格子的 CSS class（含预览状态）
 * @param cell 日历单元格
 * @returns 动态 class 对象
 */
function getCellClass(cell: CalendarCell): Record<string, boolean> {
  const base: Record<string, boolean> = {
    'other-month': !cell.current,
    'in-range': cell.inRange,
    'range-start': cell.isStart,
    'range-end': cell.isEnd,
    'today': cell.isToday,
    'selected-single': cell.selectedSingle,
  }

  // 范围预览（仅在选择模式且有临时起止时生效）
  if (props.mode === 'range' && isSelecting.value && tempStartDate.value && hoverDateStr.value && cell.current) {
    const startD = dayjs(tempStartDate.value)
    const hoverD = dayjs(hoverDateStr.value!)
    const cellD = dayjs(cell.date)
    const [earlier, later] = startD.diff(hoverD) < 0 ? [startD, hoverD] : [hoverD, startD]

    if (!(cellD.diff(earlier) < 0) && !(cellD.diff(later) > 0) && !selectedSet.value.has(cell.date)) {
      base['range-preview'] = true
    }
  }

  return base
}

/* ====== 交互方法 ====== */

/** 点击操作按钮：未选时进入选择模式，已选时保存并退出 */
function handleActionBtn() {
  if (props.disabled) return
  if (!isSelecting.value) {
    /** 进入选择模式：允许点击日期 */
    isSelecting.value = true
  } else {
    /** 确认当前选中数据 → 触发确认事件 → 退出选择模式 */
    emit('confirm')
    emit('update:modelValue', [...props.modelValue])
    isSelecting.value = false
    /** 同时取消进行中的临时范围选择 */
    cancelRangeSelection()
  }
}

/**
 * 处理日期格子点击
 * 根据模式分发到不同的选择逻辑
 * @param date 日期字符串 YYYY-MM-DD
 */
function handleCellClick(date: string) {
  if (props.disabled || !isSelecting.value) return
  if (props.mode === 'range') {
    handleRangeModeClick(date)
  } else {
    handleSelectModeToggle(date)
  }
}

/**
 * select 模式：切换单个日期的选中状态
 * @param date 日期字符串
 */
function handleSelectModeToggle(date: string) {
  const current = [...props.modelValue]
  const idx = current.indexOf(date)
  if (idx > -1) {
    current.splice(idx, 1)
  } else {
    current.push(date)
  }
  emit('update:modelValue', current)
}

/**
 * range 模式：两击范围选择逻辑
 * 第一次点击设起始，第二次点击确认结束
 * 点击已有范围内的日期则删除该范围
 * @param date 日期字符串
 */
function handleRangeModeClick(date: string) {
  if (tempStartDate.value) {
    // 第二次点击 —— 确定结束日期
    const startD = dayjs(tempStartDate.value)
    const clickedD = dayjs(date)

    // 点击同一天 → 取消选择
    if (startD.format('YYYY-MM-DD') === clickedD.format('YYYY-MM-DD')) {
      cancelRangeSelection()
      return
    }

    // 确定起止顺序（自动排序，早的在前）
    const [start, end] = startD.diff(clickedD) < 0
      ? [tempStartDate.value!, date]
      : [date, tempStartDate.value!]

    /** 通知父组件新增范围（父组件负责重叠检测等业务逻辑） */
    emit('range-add', start, end)
    /** 记录添加时间戳，用于防抖 */
    lastRangeAddTime = Date.now()

    // 自动重置为可继续选择下一段的状态（不退出选择模式）
    tempStartDate.value = null
    hoverDateStr.value = null
  } else {
    // 第一次点击 —— 检查是否点在了已有的选中区域
    if (selectedSet.value.has(date)) {
      /** 防抖检查：若刚执行过 range-add，忽略本次点击避免误删 */
      if (Date.now() - lastRangeAddTime < RANGE_ADD_DEBOUNCE_MS) return
      /** 点中已有范围 → 通知父组件移除该日期所在的范围 */
      emit('range-remove', date)
      return
    }
    // 设临时起始日期
    tempStartDate.value = date
  }
}

/** 鼠标悬停：更新预览状态的悬停日期 */
function handleCellMouseEnter(date: string) {
  if (props.mode === 'range') {
    hoverDateStr.value = date
  }
}

/** 鼠标移出：清除悬停预览 */
function handleCellMouseLeave() {
  hoverDateStr.value = null
}

/** 取消当前正在进行中的临时范围选择（仅清除起止点，保留已选数据，不退出选择模式） */
function cancelRangeSelection() {
  tempStartDate.value = null
  hoverDateStr.value = null
}

/**
 * 处理取消/退出按钮点击行为
 * - range 模式 + 有临时起点 → 仅取消当前临时选择（保留已选数据）
 * - 其他情况 → 完全退出选择模式（恢复默认态）
 */
function handleCancelBtn() {
  if (props.mode === 'range' && tempStartDate.value) {
    /** 有正在进行的范围选择时，仅取消本次临时选择 */
    cancelRangeSelection()
  } else {
    /** 无临时选择或 select 模式：完全退出并恢复默认 */
    resetToIdle()
  }
}

/* ====== 月份导航与选择器面板 ====== */

/** 切换到上一个月 */
function prevMonth() {
  if (props.disabled) return
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

/** 切换到下一个月 */
function nextMonth() {
  if (props.disabled) return
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

/** 切换年份选择面板显示/隐藏 */
function toggleYearPicker() {
  if (props.disabled) return
  showYearPicker.value = !showYearPicker.value
  showMonthPicker.value = false
}

/** 切换月份选择面板显示/隐藏 */
function toggleMonthPicker() {
  if (props.disabled) return
  showMonthPicker.value = !showMonthPicker.value
  showYearPicker.value = false
}

/** 关闭所有选择器面板 */
function closePickers() {
  showYearPicker.value = false
  showMonthPicker.value = false
}

/** 选择指定年份并关闭面板 */
function selectYear(y: number) {
  calendarYear.value = y
  showYearPicker.value = false
}

/** 选择指定月份并关闭面板 */
function selectMonth(m: number) {
  calendarMonth.value = m
  showMonthPicker.value = false
}

/** 将日历完全重置回初始态（清空选中 + 退出选择模式 + 回到当月） */
function resetToIdle() {
  emit('update:modelValue', [])
  isSelecting.value = false
  cancelRangeSelection()
}

/**
 * 重置日历视图状态
 * @param clearData 是否同时清空已选数据（默认 false）
 */
function reset(clearData = false) {
  const now = dayjs()
  calendarYear.value = now.year()
  calendarMonth.value = now.month()
  isSelecting.value = false
  cancelRangeSelection()
  if (clearData) {
    emit('update:modelValue', [])
  }
}

defineExpose({ reset, resetToIdle, prevMonth, nextMonth })
</script>

<style scoped>
/* ====== 日历容器（深色背景 + 边框） ====== */
.calendar-box {
  background: rgba(10, 18, 32, 0.85);
  border: 1px solid rgba(60, 80, 120, 0.25);
  border-radius: 8px;
  padding: 10px 14px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ====== 标题栏（年月 + 操作按钮） ====== */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.cal-title {
  font-size: 14px;
  font-weight: 600;
  color: #e8edf5;
  letter-spacing: 1px;
}

.title-part {
  font-style: normal;
}
.title-part.clickable {
  cursor: pointer;
  border-radius: 3px;
  padding: 1px 4px;
  margin: -1px -4px;
  transition: all 0.15s;
}
.title-part.clickable:hover {
  background: rgba(37, 99, 235, 0.2);
  color: #a5c4ff;
}

.cal-title em {
  text-decoration: underline;
  text-decoration-color: rgba(100, 160, 255, 0.5);
  text-underline-offset: 3px;
}

/** 跨月选择时的起点提示 */
.cross-month-hint {
  font-size: 11px;
  font-style: normal;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 4px;
  padding: 2px 8px;
  margin-left: 8px;
  white-space: nowrap;
  animation: cross-hint-pulse 2s ease-in-out infinite;
}

@keyframes cross-hint-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-cancel-range {
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(255, 77, 77, 0.15);
  color: #FF4D4D;
  border: 1px solid rgba(255, 77, 77, 0.3);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-cancel-range:hover {
  background: rgba(255, 77, 77, 0.25);
}

/** select 模式的退出按钮 */
.btn-cancel-select {
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(150, 160, 180, 0.15);
  color: rgba(200, 210, 230, 0.8);
  border: 1px solid rgba(150, 160, 180, 0.3);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-cancel-select:hover {
  background: rgba(150, 160, 180, 0.25);
}

.btn-save {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  border: none;
  border-radius: 4px;
  padding: 4px 16px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-save:hover:not(:disabled) {
  filter: brightness(1.15);
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.35);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/** "选择日期" 按钮（默认态） */
.btn-pick {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  border: none;
  border-radius: 4px;
  padding: 4px 16px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-pick:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 12px rgba(37, 99, 235, 0.35);
}

/* ====== 星期标题行（中英双语） ====== */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 3px;
  flex-shrink: 0;
}

.weekday-cell {
  text-align: center;
  padding: 4px 0 2px;
}

.weekday-cn {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: rgba(230, 235, 245, 0.75);
  line-height: 1.3;
}

.weekday-en {
  display: block;
  font-size: 9px;
  color: rgba(150, 165, 195, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
  margin-top: 1px;
}

/* ====== 日期网格 ====== */
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  flex: 1;
  align-content: start;
}

/* ---- 单个日期格子（两行内容：数字 + 农历） ---- */
.cal-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 4px 3px 3px;
  border-radius: 0;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  position: relative;
}

.day-num {
  display: block;
  font-size: 13.5px;
  font-weight: 400;
  color: rgba(225, 230, 240, 0.85);
  line-height: 1.35;
}

.day-lunar {
  display: block;
  font-size: 9px;
  color: rgba(140, 155, 185, 0.45);
  line-height: 1.25;
  margin-top: 1px;
  white-space: nowrap;
}

/* ---- 非当月日期置灰 ---- */
.cal-day.other-month .day-num {
  color: rgba(130, 145, 175, 0.28);
}
.cal-day.other-month .day-lunar {
  color: rgba(130, 145, 175, 0.15);
}
.cal-day.other-month:hover {
  background: transparent;
  cursor: default;
}

/* ---- 非选择模式下日期不可点击 ---- */
.calendar-days:not(.selecting) .cal-day:not(.other-month) {
  cursor: default;
}
.calendar-days:not(.selecting) .cal-day:not(.other-month):hover {
  background: transparent;
}

/* ---- 今日圆形高亮（蓝色圆点） ---- */
.cal-day.today .day-num {
  color: #fff;
  font-weight: 600;
}
.cal-day.today:not(.in-range):not(.selected-single)::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
  z-index: 0;
}
.cal-day.today:not(.in-range):not(.selected-single) {
  position: relative;
}
.cal-day.today:not(.in-range):not(.selected-single) .day-num,
.cal-day.today:not(.in-range):not(.selected-single) .day-lunar {
  position: relative;
  z-index: 1;
}
.cal-day.today .day-lunar {
  color: rgba(200, 220, 255, 0.9);
}

/* ---- 选中状态：亮蓝色连通胶囊条 ---- */

/** 所有选中格子的基础样式 */
.cal-day.in-range {
  background: linear-gradient(180deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%);
}

.cal-day.in-range .day-num {
  color: #fff;
  font-weight: 600;
}

.cal-day.in-range .day-lunar {
  color: rgba(210, 230, 255, 0.88);
}

/** 胶囊左端 */
.cal-day.range-start.in-range {
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

/** 胶囊右端 */
.cal-day.range-end.in-range {
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
}

/** 中间连通格子：四个角全部直角 */
.cal-day.in-range:not(.range-start):not(.range-end) {
  border-radius: 0 !important;
}

/** 单独选中一个日期（独立完整胶囊） */
.cal-day.selected-single {
  background: linear-gradient(180deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%) !important;
  border-radius: 20px !important;
}
.cal-day.selected-single .day-num {
  color: #fff;
  font-weight: 600;
}
.cal-day.selected-single .day-lunar {
  color: rgba(210, 230, 255, 0.88);
}

/* ---- 选择过程中的预览范围 ---- */
.cal-day.range-preview {
  background: rgba(59, 130, 246, 0.18) !important;
  border-radius: 0 !important;
}

/* ---- 悬停效果 ---- */

/** 已选中的日期：鼠标移入时强制锁定背景色与文字色，border-radius 保持原有 class 不变 */
.cal-day.in-range:hover,
.cal-day.selected-single:hover {
  background: linear-gradient(180deg, #3B82F6 0%, #2563EB 55%, #1D4ED8 100%) !important;
  cursor: default !important;
}

/** 未选中日期的悬停效果 */
.cal-day:not(.other-month):hover:not(.in-range):not(.today):not(.selected-single):not(.range-preview) {
  background: rgba(59, 130, 246, 0.18);
}
.cal-day:not(.other-month):hover:not(.in-range):not(.today):not(.selected-single):not(.range-preview) .day-num {
  color: #e8edf5;
}

/* ====== 底部范围统计文本 ====== */
.calendar-footer-text {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  flex-shrink: 0;
}

/* ====== 年/月选择面板 ====== */
.picker-panel {
  position: absolute;
  z-index: 20;
  background: rgba(15, 24, 42, 0.98);
  border: 1px solid rgba(60, 80, 120, 0.3);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.year-picker {
  left: 50%;
  transform: translateX(-50%);
  top: 36px;
  width: 220px;
}

.month-picker {
  left: 50%;
  transform: translateX(-50%);
  top: 36px;
  width: 240px;
}

.picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.month-grid {
  gap: 6px;
}

.picker-item {
  min-width: 44px;
  padding: 5px 10px;
  font-size: 12px;
  color: rgba(225, 230, 240, 0.8);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}

.picker-item:hover {
  background: rgba(37, 99, 235, 0.2);
  border-color: rgba(37, 99, 235, 0.35);
  color: #a5c4ff;
}

.picker-item.active {
  background: rgba(37, 99, 235, 0.55);
  border-color: rgba(100, 160, 255, 0.6);
  color: #fff;
  font-weight: 600;
}

/* ====== 面板过渡动画 ====== */
.picker-fade-enter-active,
.picker-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.picker-fade-enter-from,
.picker-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px) translateX(-50%);
}
</style>
