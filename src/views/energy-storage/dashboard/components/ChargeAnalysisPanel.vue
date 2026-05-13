<template>
  <div class="panel charge-panel">
    <div class="panel-header-bar">
      <img src="/public/images/title@2x.png" class="header-bg" alt="" />
      <span class="header-title">充放电分析</span>
    </div>
    <div class="panel-body">
      <div class="panel-inner charge-inner">
        <div class="charge-chart-wrap">
          <v-chart class="charge-chart-el" :option="chargeDischargeChartOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent])

const chargeDischargeChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(10, 22, 40, 0.92)',
    borderColor: 'rgba(2, 167, 240, 0.3)',
    textStyle: { color: '#fff', fontSize: 12 }
  },
  legend: {
    data: ['放电量(kWh)', '充电量(kWh)'],
    textStyle: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
    itemWidth: 12,
    itemHeight: 12,
    icon: 'circle',
    top: 8,
    left: 'center',
    itemGap: 24
  },
  grid: { left: '2%', right: '3%', bottom: '3%', top: '20%', containLabel: true },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.12)' } },
    axisTick: { show: false },
    axisLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    min: 84,
    max: 100,
    interval: 2,
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: {
      lineStyle: {
        color: 'rgba(255,255,255,0.08)',
        type: [4, 4]
      }
    },
    axisLabel: {
      color: 'rgba(255,255,255,0.55)',
      fontSize: 11,
      formatter: (value: number) => {
        const shown = [85, 86, 90, 92, 94, 96, 98, 100]
        return shown.includes(value) ? String(value) : ''
      }
    }
  },
  series: [
    {
      name: '放电量(kWh)',
      type: 'line',
      smooth: 0.4,
      symbol: 'none',
      lineStyle: {
        color: '#4ADE80',
        width: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(74, 222, 128, 0.5)'
      },
      // 填充色
      // areaStyle: {
      //   color: {
      //     type: 'linear',
      //     x: 0,
      //     y: 0,
      //     x2: 0,
      //     y2: 1,
      //     colorStops: [
      //       { offset: 0, color: 'rgba(74, 222, 128, 0.3)' },
      //       { offset: 0.6, color: 'rgba(74, 222, 128, 0.08)' },
      //       { offset: 1, color: 'rgba(74, 222, 128, 0)' }
      //     ]
      //   }
      // },
      data: [95, 93, 95, 97, 94, 96, 98, 95, 93, 96, 97, 96]
    },
    {
      name: '充电量(kWh)',
      type: 'line',
      smooth: 0.4,
      symbol: 'none',
      lineStyle: {
        color: '#02A7F0',
        width: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(2, 167, 240, 0.5)'
      },
      // areaStyle: {
      //   color: {
      //     type: 'linear',
      //     x: 0,
      //     y: 0,
      //     x2: 0,
      //     y2: 1,
      //     colorStops: [
      //       { offset: 0, color: 'rgba(2, 167, 240, 0.3)' },
      //       { offset: 0.6, color: 'rgba(2, 167, 240, 0.08)' },
      //       { offset: 1, color: 'rgba(2, 167, 240, 0)' }
      //     ]
      //   }
      // },
      data: [93, 90, 93, 95, 92, 94, 96, 93, 92, 94, 95, 93]
      // markLine: {
      //   symbol: 'none',
      //   silent: true,
      //   label: { show: false },
      //   lineStyle: {
      //     color: '#02A7F0',
      //     width: 1,
      //     type: [4, 4],
      //     opacity: 0.6
      //   },
      //   data: [{ yAxis: 96 }]
      // }
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
.charge-panel {
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
.charge-panel .panel-body {
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
.charge-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 4px 6px;
}
.charge-chart-wrap {
  width: 100%;
  height: 100%;
}
.charge-chart-el {
  width: 100%;
  height: 100%;
}
</style>
