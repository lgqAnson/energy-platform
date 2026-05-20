<template>
  <div class="panel">
    <div class="panel-header">
      <img src='' class="panel-header-bg" alt="" />
      <span class="panel-header-text">能量块监控</span>
    </div>
    <div class="energy-block-scroll">
      <div v-for="block in blocks" :key="block.id" class="energy-block-card" :class="{ warning: block.hasWarning }">
        <div class="eb-card-header">
          <span class="eb-card-title">{{ block.name }}</span>
          <span class="eb-card-status" :class="block.statusType">{{ block.status }}</span>
        </div>
        <div class="eb-card-body">
          <div class="eb-row"><span class="eb-label">实时功率</span><span class="eb-value">{{ block.power }} kW</span></div>
          <div class="eb-row"><span class="eb-label">SOC</span><span class="eb-value"
              :style="{ color: block.socColor }">{{ block.soc }}%</span></div>
          <div class="eb-row"><span class="eb-label">最高温度</span><span class="eb-value"
              :class="{ 'text-red': block.maxTemp > 35 }">{{ block.maxTemp }} C</span></div>
          <div class="eb-row"><span class="eb-label">电池电压</span><span class="eb-value">{{ block.voltage }} V</span>
          </div>
          <div class="eb-row"><span class="eb-label">总电压</span><span class="eb-value">{{ block.totalVoltage }} V</span>
          </div>
          <div class="eb-row"><span class="eb-label">直流电流</span><span class="eb-value">{{ block.current }} A</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  blocks: Array<{
    id: string
    name: string
    power: number
    soc: number
    maxTemp: number
    voltage: number
    totalVoltage: number
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
  padding: 16px;
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

.energy-block-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  flex: 1;
  padding-bottom: 4px;
}

.energy-block-scroll::-webkit-scrollbar {
  height: 4px;
}

.energy-block-scroll::-webkit-scrollbar-thumb {
  background: rgba(2, 167, 240, 0.3);
  border-radius: 2px;
}

.energy-block-card {
  flex: 0 0 160px;
  background: linear-gradient(145deg, rgba(22, 38, 62, 0.9) 0%, rgba(12, 24, 42, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 10px;
}

.energy-block-card.warning {
  border-color: rgba(250, 173, 20, 0.3);
  box-shadow: 0 0 8px rgba(250, 173, 20, 0.1);
}

.eb-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.eb-card-title {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.eb-card-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.eb-card-status.normal {
  background: rgba(82, 196, 26, 0.2);
  color: #52C41A;
}

.eb-card-status.warning {
  background: rgba(250, 173, 20, 0.2);
  color: #FAAD14;
}

.eb-card-body {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.eb-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.eb-label {
  color: rgba(255, 255, 255, 0.45);
}

.eb-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.eb-value.text-red {
  color: #ef4444;
}
</style>