<template>
        <div class="panel alarm-panel">
          <div class="panel-header-bar">
            <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
            <span class="header-title">未处理告警统计</span>
          </div>
          <div class="panel-body">
            <img src="/images/储能-可视看板/u3522.svg" class="panel-bg-img" alt="" />
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
import { LineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const alarmData = ref([
  { value: 61, itemStyle: { color: '#EC808D', borderRadius: [3, 3, 0, 0] } },
  { value: 112, itemStyle: { color: '#F59A23', borderRadius: [3, 3, 0, 0] } },
  { value: 44, itemStyle: { color: '#588BF0', borderRadius: [3, 3, 0, 0] } }
])

const alarmChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '12%', right: '6%', bottom: '16%', top: '10%', containLabel: false },
  xAxis: {
    type: 'category', data: ['紧急告警', '重要告警', '一般告警'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value', max: 250, interval: 50,
    axisLine: { show: false },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 10 }
  },
  series: [{
    type: 'bar', barWidth: 32, data: alarmData.value,
    label: { show: true, position: 'top', color: '#fff', fontSize: 11 }
  }]
}))
</script>

<style scoped>
.alarm-panel {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.panel-header-bar {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 200px;
  object-fit: fill;
}
.header-title {
  position: relative;
  z-index: 10;
  font-size: 18px;
  font-weight: 700;
  padding-left: 12px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #02A7F0;
  line-height: 23px;
}
.alarm-panel .panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.panel-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.alarm-inner {
  padding: 4px 8px;
  height: 100%;
  min-height: 200px;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}
.alarm-chart-el {
  width: 100%;
  height: 100%;
}
</style>
