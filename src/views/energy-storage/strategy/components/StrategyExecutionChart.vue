<template>
  <div class="panel strategy-chart-panel">
    <!-- 面板标题栏（看板统一风格） -->
    <div class="panel-header-bar">
      <img src="/public/images/title@2x.png" class="header-bg" alt="" />
      <span class="header-title">策略执行情况</span>
    </div>

    <!-- 设备标签 + 按钮（同一行，带边框容器） -->
    <div class="chart-toolbar">
      <div class="device-tabs">
        <button
          v-for="dev in deviceList"
          :key="dev"
          class="device-tab"
          :class="{ active: activeDevice === dev }"
          @click="activeDevice = dev"
        >
          {{ dev }}
        </button>
      </div>
      <button class="manage-btn" @click="$emit('manage')">
        管理充放电策略
      </button>
    </div>

    <!-- 图例（独立一行，带边框容器） -->
    <div class="legend-bar">
      <span v-for="item in legendItems" :key="item.name" class="legend-item">
        <span class="legend-pill" :style="{ background: item.color }" />
        <span>{{ item.name }}</span>
      </span>
    </div>

    <!-- 图表区域 -->
    <div class="chart-wrapper">
      <v-chart class="strategy-chart" :option="chartOption" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { CustomChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, CustomChart, GridComponent, TooltipComponent, DataZoomComponent])

defineEmits<{ manage: [] }>()

/** 设备列表 */
const deviceList = ['G5', 'G6', 'G12']
/** 当前选中的设备 */
const activeDevice = ref('G5')

/** 图例项定义 */
const legendItems = [
  { name: '待机状态', color: '#6B7280' },
  { name: '充电策略配置', color: '#00FF00' },
  { name: '充电实际情况', color: '#00CED1' },
  { name: '放电策略配置', color: '#02A7F0' },
  { name: '放电实际情况', color: '#48CAE4' }
]

/** 单个时间段条带的数据结构 */
interface TimeSegment {
  start: number   // 开始时间（小时，如 2.5 表示 02:30）
  end: number     // 结束时间
  power: number   // 功率值（kW），负值充电，正值放电
  label?: string  // 可选标签
}

/**
 * 根据选中设备生成各状态的甘特图时间段数据
 * @param deviceId 设备标识
 * @returns 各状态类型的时间段数组
 */
function getDeviceData(deviceId: string): Record<string, TimeSegment[]> {
  const offset = deviceId === 'G5' ? 0 : deviceId === 'G6' ? 15 : -10

  return {
    standby: [
      { start: 2.3, end: 3.6, power: 0 },
      { start: 7.8, end: 8.15, power: 0 },
      { start: 12.4, end: 13.4, power: 0 }
    ],
    chargePlan: [
      { start: 0, end: 2.3, power: -120 + offset },
      { start: 8.15, end: 16, power: -100 + offset }
    ],
    chargeActual: [
      { start: 0, end: 2.25, power: -135 + offset },
      { start: 8.18, end: 12.35, power: -100 + offset }
    ],
    dischargePlan: [
      { start: 5.0, end: 7.8, power: 200 + offset },
      { start: 13.4, end: 18.0, power: 250 + offset }
    ],
    dischargeActual: [
      { start: 5.05, end: 7.75, power: 180 + offset },
      { start: 13.4, end: 15.95, power: 250 + offset }
    ]
  }
}

/** 跨系列 X 轴区间重叠 + Y 轴功率相等时，短段右端圆点隐藏 */

/**
 * ECharts custom renderItem：绘制胶囊形水平时间段条 + 端点圆点标记
 * 返回一个 group，包含圆角矩形主体 + 左右两端圆形端点
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
      shape: {
        x: coordStart[0],
        y: coordStart[1] - halfH,
        width: w,
        height: barHeight,
        r: r
      },
      style: api.style({
        fill: color,
        opacity: 0.88,
        lineWidth: 0.5,
        stroke: 'rgba(255,255,255,0.12)'
      })
    },
    // 左端圆点标记
    {
      type: 'circle',
      shape: { cx: coordStart[0], cy: coordStart[1], r: dotR },
      style: {
        fill: '#fff',
        stroke: '#000',
        lineWidth: 2,
        opacity: 0.95
      }
    }
  ]

  // 仅在非衔接状态下绘制右端圆点
  if (!hideRightDot) {
    children.push({
      type: 'circle',
      shape: { cx: coordEnd[0], cy: coordEnd[1], r: dotR },
      style: {
        fill: '#fff',
        stroke: '#000',
        lineWidth: 2,
        opacity: 0.95
      }
    })
  }

  return { type: 'group', children }
}

/**
 * 构建 custom series 配置（胶囊条形 + 端点圆点 + 独立 tooltip）
 * @param allSegments 全局所有系列的 segment 集合，用于跨系列衔接检测
 */
function buildCustomSeries(
  name: string,
  segments: TimeSegment[],
  color: string,
  barHeight: number,
  allSegments: TimeSegment[]
): any {
  /** 跨系列 X 重叠 + Y 相等时，仅隐藏较短段的右端圆点 */
  const hideFlags = segments.map((seg) => {
    return allSegments.some(
      (other) =>
        seg !== other && // 排除自身
        seg.power === other.power && // Y 轴位置相同
        other.start < seg.end && // X 轴区间重叠
        other.end > seg.start &&
        (seg.end - seg.start) <= (other.end - other.start) // 当前段 ≤ 其他段长度
    )
  })

  return {
    name,
    type: 'custom',
    renderItem: (params: any, api: any) => {
      const hideRight = hideFlags[params.dataIndex] || false
      return renderGanttItem(params, api, color, barHeight, hideRight)
    },
    encode: { x: [0, 2], y: [1, 3] },
    data: segments.map(s => [s.start, s.power, s.end, s.power]),
    z: color === '#6B7280' ? 1 : color.includes('Actual') || color.includes('实际') ? 10 : 5,
    /** 悬停时高亮当前系列，确保重叠区域可独立触发 */
    emphasis: {
      focus: 'series',
      itemStyle: {
        opacity: 1
      }
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      /** 格式化 tooltip 内容 */
      formatter: (p: any) => {
        const seg = segments[p.dataIndex]
        if (!seg) return ''
        const sh = String(Math.floor(seg.start)).padStart(2, '0')
        const sm = String(Math.round((seg.start % 1) * 60)).padStart(2, '0')
        const eh = String(Math.floor(seg.end)).padStart(2, '0')
        const em = String(Math.round((seg.end % 1) * 60)).padStart(2, '0')
        return `<span style="color:${color};font-weight:bold;">● ${name}</span><br/>`
          + `时段：${sh}:${sm} ~ ${eh}:${em}<br/>`
          + `功率：${seg.power} kW`
      }
    }
  }
}

/** 图表 option（computed 缓存） */
const chartOption = computed(() => {
  const data = getDeviceData(activeDevice.value)

  /** 收集全局所有系列的 segment，用于跨系列衔接检测 */
  const allSegments = [
    ...data.standby,
    ...data.chargePlan,
    ...data.chargeActual,
    ...data.dischargePlan,
    ...data.dischargeActual
  ]

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      axisPointer: { type: 'line', lineStyle: { color: 'rgba(2,167,240,0.4)', type: 'dashed' } },
      backgroundColor: 'rgba(10,22,40,0.94)',
      borderColor: 'rgba(2,167,240,0.35)',
      borderWidth: 1,
      textStyle: { color: '#D5F2FF', fontSize: 12 },
      extraCssText: 'border-radius: 6px; padding: 8px 14px;',
      confine: true
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '5%',
      top: '2%'
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 24,
      interval: 1,
      axisLine: { lineStyle: { color: '#1a273f' } },
      axisLabel: {
        color: '#8a93a5',
        fontSize: 11,
        formatter: (val: number) => `${String(val).padStart(2, '0')}:00`
      },
      axisTick: { show: false },
      splitLine: { show: true, lineStyle: { color: 'rgba(26,39,63,0.55)' } }
    },
    yAxis: {
      type: 'value',
      min: -350,
      max: 600,
      interval: 50,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#8a93a5',
        fontSize: 11,
        formatter: (val: number) => `${val}`
      },
      splitLine: {
        lineStyle: {
          color: (p: { value: number }) =>
            p.value === 0 ? 'rgba(2,167,240,0.42)' : 'rgba(26,39,63,0.5)',
          width: (p: { value: number }) => (p.value === 0 ? 1.5 : 1)
        }
      }
    },
    series: [
      buildCustomSeries('待机状态', data.standby, '#6B7280', 12, allSegments),
      buildCustomSeries('充电策略配置', data.chargePlan, '#00FF00', 12, allSegments),
      buildCustomSeries('充电实际情况', data.chargeActual, '#00CED1', 12, allSegments),
      buildCustomSeries('放电策略配置', data.dischargePlan, '#02A7F0', 12, allSegments),
      buildCustomSeries('放电实际情况', data.dischargeActual, '#48CAE4', 12, allSegments)
    ]
  }
})
</script>

<style scoped>
/* ====== 面板容器（看板统一风格） ====== */
.panel {
  background: linear-gradient(180deg, rgba(22, 43, 131, 0) 0%, rgba(22, 43, 131, 0.15) 100%);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.panel::before {
  content: '';
  position: absolute;
  top: 56px;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}

.strategy-chart-panel {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-bottom: 4px;
}

/* ====== 标题栏（与看板统一） ====== */
.panel-header-bar {
  position: relative;
  height: 49px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 800px;
  object-fit: fill;
}

.header-title {
  position: relative;
  z-index: 10;
  font-size: 24px;
  font-style: italic;
  padding-left: 36px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #D5F2FF;
  line-height: 23px;
}

/* ====== 工具栏（设备标签 + 按钮，单行带边框容器） ====== */
.chart-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
  padding: 12px 14px 8px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.device-tabs {
  display: flex;
  gap: 4px;
}

.device-tab {
  position: relative;
  padding: 5px 22px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 0.5px;
}

/* 非激活态：暗色边框 */
.device-tab:not(.active)::before,
.device-tab:not(.active)::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-color: rgba(255, 255, 255, 0.2);
  border-style: solid;
  transition: all 0.25s ease;
}

.device-tab:not(.active)::before {
  top: -1px; left: -1px;
  border-width: 1px 0 0 1px;
}
.device-tab:not(.active)::after {
  bottom: -1px; right: -1px;
  border-width: 0 1px 1px 0;
}

/* 激活态：青色发光 + 角标方块 */
.device-tab.active {
  border-color: rgba(2, 167, 240, 0.7);
  color: #48CAE4;
  background: rgba(2, 167, 240, 0.08);
  box-shadow:
    0 0 10px rgba(2, 167, 240, 0.2),
    inset 0 0 8px rgba(2, 167, 240, 0.06);
}

/* 激活态左上角青色方块 */
.device-tab.active::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  width: 8px;
  height: 8px;
  background: #02A7F0;
  box-shadow: 0 0 6px rgba(2, 167, 240, 0.6), 0 0 12px rgba(2, 167, 240, 0.3);
}

/* 激活态右下角青色方块 */
.device-tab.active::after {
  content: '';
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  background: #02A7F0;
  box-shadow: 0 0 6px rgba(2, 167, 240, 0.6), 0 0 12px rgba(2, 167, 240, 0.3);
}

/* 悬停非激活态 */
.device-tab:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.32);
  color: rgba(255, 255, 255, 0.75);
}

/* ====== 图例栏（独立一行，带边框容器） ====== */
.legend-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 10px 18px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  white-space: nowrap;
}

/** 胶囊形图例标记（与图表条形风格一致：圆角矩形 + 两端白底黑圈圆点） */
.legend-pill {
  position: relative;
  width: 22px;
  height: 9px;
  border-radius: 5px;
  flex-shrink: 0;
}

/** 左端白底黑圈圆点（直径与胶囊高度一致） */
.legend-pill::before {
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

/** 右端白底黑圈圆点（直径与胶囊高度一致） */
.legend-pill::after {
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

.manage-btn {
  padding: 5px 18px;
  background: #1F5EFF;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.22s ease;
  flex-shrink: 0;
}


/* ====== 图表区域 ====== */
.chart-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
  padding: 0 6px;
}

.strategy-chart {
  width: 100%;
  height: 100%;
}
</style>
