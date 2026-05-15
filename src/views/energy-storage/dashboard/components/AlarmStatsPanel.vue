<template>
  <div class="panel alarm-panel">
    <div class="panel-header-bar">
      <img src="/public//images/title@2x.png" class="header-bg" alt="" />
      <span class="header-title">未处理告警统计</span>
    </div>
    <div class="panel-body">
      <div class="panel-inner alarm-inner">
        <v-chart class="alarm-chart-el" :option="alarmChartOption" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PictorialBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { axisTooltipConfig } from '@/utils/echartsTooltip'

use([CanvasRenderer, PictorialBarChart, GridComponent, TooltipComponent])

const alarmRaw = [
  { value: 210, colors: ['#FF4D4F', 'rgba(255, 77, 79, 0.15)'] },
  { value: 155, colors: ['#FAAD14', 'rgba(250, 173, 20, 0.15)'] },
  { value: 65, colors: ['#FADB14', 'rgba(250, 219, 20, 0.15)'] }
]

const alarmData = ref(
  alarmRaw.map((item) => ({
    value: item.value,
    itemStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: item.colors[0] },
          { offset: 1, color: item.colors[1] }
        ]
      }
    }
  }))
)

const alarmChartOption = computed(() => ({
  /** 自定义 tooltip formatter：确保数值颜色与各柱子主色调一致 */
  tooltip: axisTooltipConfig({
    formatter: (params: { dataIndex?: number; value?: number | string; seriesName?: string; axisValue?: string }[]) => {
      const t = params[0]?.axisValue || ''
      let html = `<div style="background: url(/images/echartsPop-up@2x.png) no-repeat center center / 100% 100%; padding: 14px 18px; min-width: 180px;">`
      html += `<div style="font-size: 16px; color: #fff; margin-bottom: 10px; font-weight: 500;">${t}</div>`
      for (const p of params) {
        const label = (p.seriesName || '').replace('(kWh)', '').replace('（kWh）', '')
        /** 从 alarmRaw 取对应柱子的主色调 */
        const barColor = p.dataIndex !== undefined && alarmRaw[p.dataIndex] ? alarmRaw[p.dataIndex].colors[0] : '#fff'
        html += `<div style="display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 6px;">`
        if (label) {
          html += `<span style="background: linear-gradient( 90deg, rgba(75,87,107,0.6) 0%, rgba(75,87,107,0) 100%); padding: 3px 10px; width: 100%; border-radius: 3px; color: rgba(255,255,255,0.6); font-size: 11px;">${label}</span>`
        }
        html += `<span style="color: ${barColor}; font-size: 16px; font-weight: 700;">${p.value}</span>`
        html += `</div>`
      }
      html += `</div>`
      return html
    }
  }),
  grid: { left: '10%', right: '6%', bottom: '14%', top: '12%', containLabel: false },
  xAxis: {
    type: 'category',
    data: ['紧急告警', '重要告警', '一般告警'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    max: 250,
    interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [
    {
      name: '告警数量',
      type: 'pictorialBar',
      symbol: 'circle',
      symbolRepeat: true,
      symbolSize: [14, 10],
      symbolMargin: 3,
      symbolClip: true,
      barWidth: 28,
      //  itemStyle: { color: ['#FF4D4F','#FAAD14','#FADB14'] }, 
      data: alarmData.value,
      label: { show: true, position: 'top', color: '#fff', fontSize: 11 }
    }
  ]
}))
</script>

<style scoped>
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
.alarm-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-bar {
  position: relative;
  height: 49px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 440px;
  object-fit: fill;
}
.header-title {
  position: relative;
  z-index: 10;
  font-size: 24px;
  font-style: italic;
  /* font-weight: 700; */
  padding-left: 24px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
 color: #D5F2FF;
  line-height: 23px;
}
.alarm-panel .panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.alarm-inner {
  padding: 4px 6px;
  height: 100%;
  min-height: 160px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}
.alarm-chart-el {
  width: 100%;
  height: 100%;
}
</style>
