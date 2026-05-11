---
name: calendar-date-range-selection
overview: 将 TimeSettingSection.vue 中的日历组件从单日期选择改造为日期范围选择，支持日期范围的回显和点击选择日期范围
todos:
  - id: refactor-state
    content: 将 selectedDate 替换为 rangeStartDate/rangeEndDate/isSelectingRange 状态，实现两次点击范围选择逻辑
    status: completed
  - id: update-template
    content: 改造日历模板：动态 class 绑定、悬停预览事件、底部范围文本显示
    status: completed
    dependencies:
      - refactor-state
  - id: add-styles
    content: 添加日期范围条带式高亮样式（range-start/range-end/range-between/range-preview）
    status: completed
    dependencies:
      - update-template
---

## 用户需求

日历组件需要支持日期范围选择和回显功能：

- **日期范围选择**：点击日历中的日期时，支持两次点击选择日期范围（第一次点击选起始日期，第二次点击选结束日期），选择完成后在日历中高亮显示整个范围
- **日期范围回显**：当选中了日期范围后，日历需要能正确回显（高亮显示起始日期、结束日期以及两者之间的所有日期）
- **交互细节**：若第二次点击的日期早于起始日期，自动交换起止；点击同一日期可取消选择；范围选择过程中应有视觉提示

## 产品概述

在电价管理的"电价时段设置"区域中，左侧日历面板从单日期选择升级为日期范围选择，配合右侧时段列表共同管理特殊日期的电价配置。

## 核心功能

- 两次点击完成日期范围选择（起始→结束）
- 范围内日期的条带式高亮回显（起始日期圆角左侧高亮、结束日期圆角右侧高亮、中间日期条带高亮）
- 日历底部显示当前选中的日期范围文本
- 选择过程中的半透明预览提示

## 技术栈

- Vue 3.4 + Composition API + `<script setup lang="ts">`
- dayjs（日期处理）
- Tailwind CSS + scoped CSS（样式）
- lucide-vue-next（图标）

## 实现方案

### 核心思路

将当前日历的单日期选择机制替换为日期范围选择机制。通过两次点击交互（第一次选起始，第二次选结束）完成范围选择，并在日历网格中用条带式视觉高亮回显范围。

### 状态改造

1. **移除** `selectedDate` 单日期 ref
2. **新增** 以下状态：

- `rangeStartDate`: 范围起始日期 `{ year, month, day } | null`
- `rangeEndDate`: 范围结束日期 `{ year, month, day } | null`
- `isSelectingRange`: 布尔值，标记是否处于"已选起始，等待选结束"的中间状态
- `hoverDate`: 鼠标悬停日期，用于选择过程中的范围预览

3. **新增** 辅助方法：

- `toDateKey(date)`: 将日期对象转为可比较的字符串 `YYYY-MM-DD`
- `isInRange(date)`: 判断日期是否在选中的范围内
- `isRangeStart(date)` / `isRangeEnd(date)`: 判断是否为起始/结束日期
- `isInPreviewRange(date)`: 选择过程中，判断日期是否在起始与悬停日期之间（预览用）

### 选择逻辑

```
selectDate(date):
  if isSelectingRange:
    // 第二次点击
    if 同一天 → 清空范围，退出选择状态
    if 早于起始 → 交换作为新起始，原起始变为结束
    else → 设为结束日期
    isSelectingRange = false
  else:
    // 第一次点击
    rangeStartDate = date
    rangeEndDate = null
    isSelectingRange = true
```

### 模板改造

- 日历按钮 `:class` 增加：`range-start`、`range-end`、`range-between`、`range-preview`
- 鼠标悬停事件：`@mouseenter` 更新 `hoverDate`，`@mouseleave` 清空
- 底部区域：显示范围文本（如 "2026-03-13 至 2026-03-20"），保留"选择日期"按钮

### 样式设计

| 状态 | 样式 |
| --- | --- |
| `range-start` | 背景条带从左延伸，右侧圆角为0，圆形高亮背景 `#02A7F0` |
| `range-end` | 背景条带向右延伸，左侧圆角为0，圆形高亮背景 `#02A7F0` |
| `range-between` | 条带式高亮 `rgba(2, 167, 240, 0.15)`，无圆角 |
| `range-preview` | 选择过程中预览，更淡的半透明 `rgba(2, 167, 240, 0.08)` |


起始/结束同一天时，显示为完整圆形高亮（等同于原 `selected` 效果）。

使用伪元素 `::before` 实现条带效果，避免影响日历格子布局。

### 性能注意事项

- `isInRange` 等判断方法基于 `dayjs` 时间戳比较，O(1) 复杂度
- 42 个日历格子的 class 绑定通过 computed 一次性计算，避免模板中重复计算
- `hoverDate` 的 mouseenter/mouseleave 仅更新一个 ref，开销极小

## 目录结构

```
src/views/energy-storage/price/components/
└── TimeSettingSection.vue   # [MODIFY] 日历组件改造为支持日期范围选择和回显
```

### 修改文件详细说明

**TimeSettingSection.vue** — 日历区域改造

- **状态层**（第199-299行区域）：
- 移除 `selectedDate` ref
- 新增 `rangeStartDate`、`rangeEndDate`、`isSelectingRange`、`hoverDate` refs
- 新增 `toDateKey()`、`isRangeStart()`、`isRangeEnd()`、`isInRange()`、`isInPreviewRange()` 辅助方法
- 改造 `selectDate()` 为两次点击范围选择逻辑
- 改造 `selectToday()` 适配范围选择
- 新增 `formattedRange` computed 用于底部范围文本展示
- 新增 `calendarCellClasses` computed 统一计算每个格子的 class

- **模板层**（第67-81行区域）：
- 日历按钮 `:class` 替换为基于 `calendarCellClasses` 的动态绑定
- 添加 `@mouseenter` / `@mouseleave` 事件处理悬停预览
- 底部区域增加范围文本显示

- **样式层**（第651-701行区域）：
- 移除 `.calendar-day.selected` 样式
- 新增 `.calendar-day.range-start`、`.range-end`、`.range-between`、`.range-preview` 样式
- 新增 `.calendar-range-text` 范围文本样式
- 条带效果使用 `::before` 伪元素实现，保持格子布局不变