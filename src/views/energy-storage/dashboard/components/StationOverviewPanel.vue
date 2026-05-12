<template>
  <div class="panel station-panel">
    <div class="panel-header-bar">
      <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
      <span class="header-title">电站规模及运行概况</span>
    </div>
    <div class="panel-body">
      <div class="panel-inner station-inner">
        <img src="/images/储能-可视看板/u3608.svg" class="station-bg-img" alt="" />
        <div class="station-content">
          <!-- 上方两列指标网格 -->
          <div class="stats-grid">
            <div v-for="(stat, index) in topStats" :key="index" class="stat-item">
              <div class="stat-item-label">{{ stat.label }}</div>
              <div class="stat-item-value">
                <span class="stat-num">{{ formatNumber(stat.value) }}</span>
                <span class="stat-unit">{{ stat.unit }}</span>
              </div>
            </div>
          </div>

          <!-- 中间大圆环 -->
          <div class="center-ring">
            <div class="ring-outer">
              <div class="ring-inner">
                <div class="ring-value">{{ formatNumber(safeDays) }}</div>
              </div>
            </div>
            <div class="ring-label">安全运行天数/天</div>
          </div>

          <!-- 底部额外指标 -->
          <div class="bottom-stats">
            <div class="bottom-stat">
              <span class="bottom-label">总电站数</span>
              <span class="bottom-num">{{ formatNumber(totalStations) }}</span>
              <span class="bottom-unit">座</span>
            </div>
            <div class="bottom-stat">
              <span class="bottom-label">总储能柜数</span>
              <span class="bottom-num">{{ formatNumber(totalCabinets) }}</span>
              <span class="bottom-unit">套</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const safeDays = ref(1250)
const totalStations = ref(328)
const totalCabinets = ref(1850)

const topStats = ref([
  { label: '装机容量', value: 15280, unit: 'kwh' },
  { label: '装机功率', value: 15280, unit: 'kW' },
  { label: '累计总充电量', value: 85600, unit: 'kwh' },
  { label: '累计总放电量', value: 15280, unit: 'kwh' }
])

const formatNumber = (num: number) => num.toLocaleString('zh-CN')
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
.station-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-bar {
  position: relative;
  height: 24px;
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
  width: 200px;
  object-fit: fill;
}
.header-title {
  position: relative;
  z-index: 10;
  font-size: 16px;
  font-weight: 700;
  padding-left: 12px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #02A7F0;
  line-height: 23px;
}
.station-panel .panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
}
.station-inner {
  position: relative;
  padding: 6px 8px;
  height: 100%;
}
.station-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.station-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 6px;
}

/* 上方两列指标网格 */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  flex-shrink: 0;
}
.stat-item {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.8) 0%, rgba(10, 22, 40, 0.8) 100%);
  border: 1px solid rgba(2, 167, 240, 0.15);
  border-radius: 8px;
  padding: 6px 8px;
}
.stat-item-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
}
.stat-item-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.stat-num {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.2;
}
.stat-unit {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

/* 中间大圆环 */
.center-ring {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.ring-outer {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(2, 167, 240, 0.9) 0%,
    rgba(2, 167, 240, 0.4) 60%,
    rgba(2, 167, 240, 0.1) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(2, 167, 240, 0.2);
}
.ring-inner {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(145deg, rgba(10, 22, 40, 0.95) 0%, rgba(18, 34, 58, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ring-value {
  font-size: 32px;
  font-weight: 700;
  color: #02A7F0;
  text-shadow: 0 0 10px rgba(2, 167, 240, 0.4);
}
.ring-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 底部指标 */
.bottom-stats {
  display: flex;
  justify-content: space-around;
  flex-shrink: 0;
  padding: 4px 0;
}
.bottom-stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.bottom-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}
.bottom-num {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
}
.bottom-unit {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}
</style>
