<template>
  <div class="panel">
    <div class="panel-header">
      <img src="/images/登录日志/u79.png" class="panel-header-bg" alt="" />
      <span class="panel-header-text">能量组监控</span>
    </div>
    <div class="energy-group-grid">
      <div v-for="group in groups" :key="group.id" class="energy-group-card" :class="{ warning: group.hasWarning }">
        <div class="eg-card-header">
          <span class="eg-card-title">{{ group.name }}</span>
          <span class="eg-card-status" :class="group.statusType">{{ group.status }}</span>
        </div>
        <div class="eg-card-body">
          <div class="eg-row"><span class="eg-label">实时功率</span><span class="eg-value">{{ group.power }} kW</span></div>
          <div class="eg-row"><span class="eg-label">SOC</span><span class="eg-value"
              :style="{ color: group.socColor }">{{ group.soc }}%</span></div>
          <div class="eg-row"><span class="eg-label">最高温度</span><span class="eg-value"
              :class="{ 'text-red': group.maxTemp > 35 }">{{ group.maxTemp }} C</span></div>
          <div class="eg-row"><span class="eg-label">电池电压</span><span class="eg-value">{{ group.voltage }} V</span>
          </div>
          <div class="eg-row"><span class="eg-label">最低温度</span><span class="eg-value">{{ group.minTemp }} C</span>
          </div>
          <div class="eg-row"><span class="eg-label">直流电流</span><span class="eg-value">{{ group.current }} A</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  groups: Array<{
    id: string
    name: string
    power: number
    soc: number
    maxTemp: number
    minTemp: number
    voltage: number
    current: number
    status: string
    statusType: string
    socColor: string
    hasWarning: boolean
  }>
}>()
</script>

<style scoped>
.panel {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}
.panel-header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 200px;
  object-fit: fill;
}

.panel-header-text {
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

.energy-group-grid {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
}

.energy-group-grid::-webkit-scrollbar {
  width: 4px;
}

.energy-group-grid::-webkit-scrollbar-thumb {
  background: rgba(2, 167, 240, 0.3);
  border-radius: 2px;
}

.energy-group-card {
  flex: 1;
  background: linear-gradient(145deg, rgba(22, 38, 62, 0.9) 0%, rgba(12, 24, 42, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px;
  min-width: 0;
}

.energy-group-card.warning {
  border-color: rgba(250, 173, 20, 0.3);
  box-shadow: 0 0 8px rgba(250, 173, 20, 0.1);
}

.eg-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.eg-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

.eg-card-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
}

.eg-card-status.normal {
  background: rgba(82, 196, 26, 0.2);
  color: #52C41A;
}

.eg-card-status.warning {
  background: rgba(250, 173, 20, 0.2);
  color: #FAAD14;
}

.eg-card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eg-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.eg-label {
  color: rgba(255, 255, 255, 0.45);
}

.eg-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.eg-value.text-red {
  color: #ef4444;
}
</style>