<template>
  <div class="time-setting-section">
    <!-- 标题行：图标+标题+开关+提示文字（一行内完成） -->
    <div class="section-header">
      <div class="header-left">
        <Clock class="title-icon" :size="20" />
        <span class="section-title-text">电价时段设置</span>
        <!-- 开关紧跟标题 -->
        <ToggleRight v-if="autoUpdate" class="toggle-icon active" :size="32" @click="autoUpdate = false" />
        <ToggleLeft v-else class="toggle-icon" :size="32" @click="autoUpdate = true" />
        <span class="toggle-label">启用自动更新(根据地区电网政策)</span>
      </div>
      <!-- 右侧橙色提示文字 -->
      <p class="section-hint hint-warning">
        <AlertTriangle class="hint-icon" :size="14" />
        提示：支持根据电网发布的尖、峰、平、谷对应时间段，手动或自动更新匹配。开启自动后将按地区电网政策自动同步。
      </p>
    </div>

    <!-- 工具栏行：Tab组 | 操作按钮 | 选用日期 -->
    <div class="section-toolbar">
      <!-- Tab 组 -->
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

      <!-- 操作按钮组 -->
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

    <!-- 主内容区：左侧日历 + 右侧时段列表 -->
    <div class="time-setting-main">
      <!-- 左侧日历面板 -->
      <div class="calendar-panel">
        <!-- 日历主体 -->
        <CalendarPicker
          ref="calendarRef"
          mode="range"
          v-model="flatSelectedDates"
          @range-add="handleRangeAdd"
          @range-remove="handleRangeRemove"
        />
      </div>

      <!-- 右侧时段列表 -->
      <div class="time-slot-list">
        <div
          v-for="slot in currentTimeSlots"
          :key="slot.key"
          class="time-slot-item"
          :class="[`slot-${slot.key}`, { editing: editingKey === slot.key }]"
        >
          <!-- 查看模式：单行布局 -->
          <template v-if="editingKey !== slot.key">
            <!-- 左侧彩色标签条 -->
            <!-- <div class="slot-tag-bar" >
              <span class="slot-tag-text" :style="{ color: slot.tagColor }"></span>
            </div> -->
            <!-- 中间：图标+名称+时间 -->
            <div class="slot-info">
              <span class="slot-name">{{ slot.name }}</span>
              <span class="slot-range">{{ formatRange(slot.periods) }}</span>
            </div>
            <!-- 右侧操作按钮（圆形） -->
            <div class="slot-actions">
              <button class="slot-action-btn edit" title="编辑" @click="startEdit(slot)">
                <Edit3 :size="14" />
              </button>
              <button class="slot-action-btn delete" title="删除最后一个时间段" @click="deleteSlotLastPeriod(slot)">
                <Trash2 :size="14" />
              </button>
              <button class="slot-action-btn more" title="新增时间段" @click="addSlotPeriod(slot)">
                <Plus :size="14" />
              </button>
            </div>
          </template>

          <!-- 编辑模式：展开面板 -->
          <template v-else>
            <div class="slot-edit-panel">
              <div class="slot-edit-header">
                <div class="slot-name">{{ slot.name }}</div>
                <div class="slot-tag-inline" :style="{ background: slot.tagBg, color: slot.tagColor }">
                  {{ slot.tag }}
                </div>
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
  Save, X, AlertTriangle, CalendarDays,
  Zap, Flame, Sun, Moon
} from 'lucide-vue-next'
import CalendarPicker from '@/components/business/CalendarPicker.vue'
import type { RegionInfo } from '../data/regionData'
import dayjs from 'dayjs'

/** 当前系统日期（提前声明供日历年月使用） */
const today = dayjs()

const props = defineProps<{
  selectedRegion: {
    path: string
    province: string
    city: string
    district: string
    data: RegionInfo | null
  } | null
}>()

/** 日历组件引用 */
const calendarRef = ref<InstanceType<typeof CalendarPicker> | null>(null)

/** 当前日历显示的年份 */
const calendarYear = ref(today.year())
/** 当前日历显示的月份（1-12） */
const calendarMonth = ref(today.month() + 1)

/**
 * 根据时段 key 返回对应的图标组件
 * @param slotKey 时段标识
 * @returns 图标组件
 */
function getSlotIcon(slotKey: string) {
  const iconMap: Record<string, any> = {
    sharp: Zap,
    peak: Flame,
    flat: Sun,
    valley: Moon
  }
  return iconMap[slotKey] || Clock
}

/**
 * 触发日历选择日期功能
 * 通过调用日历组件暴露的方法进入选择模式
 */
function triggerDatePick() {
  // 点击"选择日期"按钮时触发日历进入选择模式
  if (calendarRef.value) {
    const btn = (calendarRef.value as any).$el?.querySelector('.btn-pick')
    if (btn) btn.click()
  }
}

const autoUpdate = ref(true)

/* ============================================================
 * 类型定义
 * ============================================================ */

/** 日期键值，用于日历中的日期表示 */
interface DateKey {
  year: number
  month: number
  day: number
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

/**
 * 将 DateKey 对象转为 YYYY-MM-DD 字符串
 * @param dk 日期键值对象
 * @returns 格式化字符串
 */
function dateKeyToStr(dk: DateKey): string {
  return `${dk.year}-${String(dk.month + 1).padStart(2, '0')}-${String(dk.day).padStart(2, '0')}`
}

/**
 * 将 YYYY-MM-DD 字符串解析为 DateKey 对象
 * @param str 日期字符串
 * @returns DateKey 对象
 */
function strToDateKey(str: string): DateKey {
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m - 1, day: d }
}

/**
 * 展开一段日期范围内的所有日期字符串（含起止）
 * @param range 单段日期范围
 * @returns 日期字符串数组
 */
function expandRange(range: DateRange): string[] {
  const dates: string[] = []
  const start = dayjs().year(range.start.year).month(range.start.month).date(range.start.day)
  const end = dayjs().year(range.end.year).month(range.end.month).date(range.end.day)
  let cur = start
  while (cur.diff(end) <= 0) {
    dates.push(cur.format('YYYY-MM-DD'))
    cur = cur.add(1, 'day')
  }
  return dates
}

/** 当前月份的 key 字符串，格式 "YYYY-MM" */
const monthKey = computed<string>(() => {
  // 从日历组件内部年月推导：这里使用一个默认值或需要同步机制
  // 实际使用中 monthKey 应该与日历显示月份保持一致
  // 简化处理：使用当前系统月份作为默认值
  return `${today.year()}-${String(today.month() + 1).padStart(2, '0')}`
})

/** 当前 Tab + 当前月份对应的日期范围数组 */
const currentDateRanges = computed<DateRange[]>(() => {
  if (!activeTab.value) return []
  return activeTab.value.dateRangesByMonth[monthKey.value] || []
})

/**
 * 将当前选中范围展开为扁平日期字符串数组，供 CalendarPicker 的 v-model 使用
 * CalendarPicker 需要知道哪些日期被选中来渲染高亮效果
 */
const flatSelectedDates = computed<string[]>(() => {
  const dates: string[] = []
  for (const range of currentDateRanges.value) {
    dates.push(...expandRange(range))
  }
  return dates
})

/** 当前 Tab 的时段配置 */
const currentTimeSlots = computed<TimeSlot[]>(() => {
  if (!activeTab.value) return getDefaultTimeSlots()
  return activeTab.value.timeSlots
})

/* ============================================================
 * 范围选择事件处理（由 CalendarPicker 的 range-add/range-remove 触发）
 * ============================================================ */

/**
 * 处理 CalendarPicker 发出的范围新增事件
 * 执行重叠检测后添加到当前 Tab 的数据中
 * @param startStr 起始日期字符串
 * @param endStr 结束日期字符串
 */
function handleRangeAdd(startStr: string, endStr: string) {
  const start = strToDateKey(startStr)
  const end = strToDateKey(endStr)

  // 重叠检测
  const overlapResult = checkOverlap(start, end)
  if (overlapResult) {
    ElMessage.warning(`新范围与已有范围「${overlapResult}」重叠，请重新选择`)
    return
  }

  addDateRange(start, end)
}

/**
 * 处理 CalendarPicker 发出的范围移除事件
 * 找到包含指定日期的范围并删除
 * @param dateStr 被点击的日期字符串
 */
function handleRangeRemove(dateStr: string) {
  const clicked = strToDateKey(dateStr)
  for (const range of currentDateRanges.value) {
    if (isDateIn(clicked, range)) {
      removeDateRange(range.id)
      return
    }
  }
}

/* ============================================================
 * 工具函数
 * ============================================================ */

/**
 * 解析时段范围字符串为时间区间数组
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
 * @returns 格式化后的字符串
 */
function formatRange(periods: TimePeriod[]): string {
  if (periods.length === 0) return '--'
  return periods.map(p => `${p.start} - ${p.end}`).join(', ')
}

/**
 * 格式化单段日期范围为文本
 * @param range 单段日期范围
 * @returns 格式化后的文本
 */
function formatSingleDateRange(range: DateRange): string {
  const start = dateKeyToStr(range.start).slice(5)
  const end = dateKeyToStr(range.end).slice(5)
  return start === end ? start : `${start} 至 ${end}`
}

/* ============================================================
 * 范围判断函数
 * ============================================================ */

/**
 * 判断指定日期是否在某段范围内（含起止）
 * @param date 日期键值
 * @param range 待检测的日期范围
 * @returns 是否在该范围内
 */
function isDateIn(date: DateKey, range: DateRange): boolean {
  const d = dayjs().year(date.year).month(date.month).date(date.day)
  const start = dayjs().year(range.start.year).month(range.start.month).date(range.start.day)
  const end = dayjs().year(range.end.year).month(range.end.month).date(range.end.day)
  return !(d.diff(start) < 0) && !(d.diff(end) > 0)
}

/**
 * 判断新范围是否与已有范围重叠
 * @param newStart 新范围起始
 * @param newEnd 新范围结束
 * @returns 若重叠则返回冲突的范围描述，否则返回 null
 */
function checkOverlap(newStart: DateKey, newEnd: DateKey): string | null {
  const ns = dayjs().year(newStart.year).month(newStart.month).date(newStart.day)
  const ne = dayjs().year(newEnd.year).month(newEnd.month).date(newEnd.day)
  for (const range of currentDateRanges.value) {
    const rs = dayjs().year(range.start.year).month(range.start.month).date(range.start.day)
    const re = dayjs().year(range.end.year).month(range.end.month).date(range.end.day)
    if (!(ne.diff(rs) < 0) && !(ns.diff(re) > 0)) {
      return formatSingleDateRange(range)
    }
  }
  return null
}

/* ============================================================
 * 范围 CRUD 操作
 * ============================================================ */

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

/* ============================================================
 * Tab 操作：切换 / 编辑 / 删除 / 新建
 * ============================================================ */

/**
 * 切换到指定 Tab
 * @param tabKey 目标 Tab 的 key
 */
function switchTab(tabKey: string) {
  cancelEdit()
  activeTabKey.value = tabKey
}

/**
 * 编辑当前 Tab 名称
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
/** 编辑缓冲区 */
const editingPeriods = ref<TimePeriod[]>([])

/** 进入时段编辑模式 */
function startEdit(slot: TimeSlot) {
  editingKey.value = slot.key
  editingPeriods.value = slot.periods.map(p => ({ ...p }))
}

/** 取消编辑 */
function cancelEdit() {
  editingKey.value = null
  editingPeriods.value = []
}

/** 保存编辑 */
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

/* ---------- 标题区（一行：左侧标题+开关 | 右侧提示） ---------- */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  color: #02A7F0;
}

.section-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #02A7F0;
}

.toggle-icon {
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toggle-icon.active {
  color: #02A7F0;
}

.toggle-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

/* 右侧橙色警告提示 */
.section-hint {
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.section-hint.hint-warning {
  color: rgba(255, 180, 50, 0.9);
  background: rgba(255, 140, 0, 0.08);
  border-radius: 4px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.hint-icon {
  flex-shrink: 0;
}

/* ---------- 工具栏（Tab + 操作 + 选用日期） ---------- */
.section-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 28px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(129, 211, 248, 0.1);
}

.tab-group {
  display: flex;
  gap: 4px;
}

.tab-btn {
  padding: 6px 18px;
  border-radius: 4px 4px 0 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  background-image: url('/images/tabDefaultBg.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #fff;
  background-image: url('/images/tabSeletedBg.png');
}

.tab-btn:hover:not(.active) {
  color: rgba(255, 255, 255, 0.8);
}

.tab-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
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

.pick-date-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 18px;
  border-radius: 5px;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.pick-date-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 14px rgba(37, 99, 235, 0.35);
}

/* ---------- 主内容区（左右分栏）---------- */
.time-setting-main {
  display: flex;
  gap: 24px;
  padding-left: 28px;
  padding-right: 28px;
}

/* ---------- 左侧日历面板 ---------- */
.calendar-panel {
  width:50%;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(10, 23, 42, 0.3);
  border: 1px solid rgba(129, 211, 248, 0.12);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(2, 167, 240, 0.06);
  border-bottom: 1px solid rgba(129, 211, 248, 0.1);
}

.calendar-title {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.calendar-pick-btn {
  padding: 5px 16px;
  border-radius: 4px;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: filter 0.2s;
}

.calendar-pick-btn:hover {
  filter: brightness(1.15);
}

/* ---------- 右侧时段列表 ---------- */
.time-slot-list {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 时段行 - 单行卡片布局（按图示） */
.time-slot-item {
  display: flex;
  align-items: center;
  position: relative;
  gap: 12px;
  /* padding: 24px 16px; */
  height: 72px;
  border-radius: 6px;
  transition: all 0.2s;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  margin-bottom:24px
}

.time-slot-item:hover {
  filter: brightness(1.1);
}

/** 尖峰时段背景 */
.time-slot-item.slot-sharp {
  background-image: url('/images/jianfengtimeSlot.png');
}

/** 峰时段背景 */
.time-slot-item.slot-peak {
  background-image: url('/images/gaofengtimeSlot.png');
}

/** 平时段背景 */
.time-slot-item.slot-flat {
  background-image: url('/images/pingchangtimeSlot.png');
}

/** 谷时段背景 */
.time-slot-item.slot-valley {
  background-image: url('/images/digutimeSlot.png');
}

/* 左侧彩色标签条 */
.slot-tag-bar {
  width: 52px;
  flex-shrink: 0;
  padding: 6px 0;

  text-align: center;
}

.slot-tag-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 中间信息区 */
.slot-info {
  display: flex;
  align-items: center;
  position: absolute;
  top: 10px;
  left: 184px;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.slot-info-icon {
  flex-shrink: 0;
}

.slot-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
}

.slot-range {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧操作按钮组 */
.slot-actions {
  position: absolute;
  top: 10px;
  right: 16px;
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.slot-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(129, 211, 248, 0.15);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.2s;
}

.slot-action-btn.edit:hover {
  background: rgba(2, 167, 240, 0.15);
  border-color: #02A7F0;
  color: #02A7F0;
}

.slot-action-btn.delete:hover {
  background: rgba(255, 77, 77, 0.15);
  border-color: #FF4D4D;
  color: #FF4D4D;
}

.slot-action-btn.more:hover {
  background: rgba(74, 158, 255, 0.15);
  border-color: #4A9EFF;
  color: #4A9EFF;
}

/* ---------- 编辑模式 ---------- */
.time-slot-item.editing {
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 16px;
}

.slot-edit-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slot-edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.slot-tag-inline {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
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
@media (max-width: 1200px) {
  .time-setting-main {
    flex-direction: column;
  }

  .calendar-panel {
    width: 100%;
    max-width: 520px;
    margin: 0 auto;
  }

  .section-toolbar {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
