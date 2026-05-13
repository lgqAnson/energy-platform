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
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const alarmData = ref([
  { value: 210, itemStyle: { color: '#EC808D', borderRadius: [3, 3, 0, 0] } },
  { value: 155, itemStyle: { color: '#F59A23', borderRadius: [3, 3, 0, 0] } },
  { value: 65, itemStyle: { color: '#588BF0', borderRadius: [3, 3, 0, 0] } }
])

const alarmChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
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
      type: 'bar',
      barWidth: 28,
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
