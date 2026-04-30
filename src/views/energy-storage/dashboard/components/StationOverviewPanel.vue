<template>
        <div class="panel station-panel">
          <div class="panel-header-bar">
            <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
            <span class="header-title">电站规模及运行概况</span>
          </div>
          <div class="panel-body">
            <div class="panel-inner station-inner">
              <img src="/images/储能-可视看板/u3608.svg" class="station-bg-img" alt="" />
              <div class="stats-grid">
                <div v-for="(stat, index) in stationStats" :key="index" class="stat-card"
                  :style="{ '--accent-color': stat.borderColor }">
                  <div class="stat-accent-line"></div>
                  <div class="stat-body">
                    <div class="stat-icon-wrap">
                      <component :is="statIcons[index]" class="stat-icon" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-label">{{ stat.label }}</div>
                      <div class="stat-value-row">
                        <span class="stat-value">{{ formatNumber(stat.value) }}</span>
                      </div>
                      <div class="stat-value-row">
                        <span class="stat-unit">{{ stat.unit }}</span>
                      </div>
                      <div v-if="stat.trend" class="stat-trend">
                        <span class="trend-label">{{ stat.trendLabel }}</span>
                        <span class="trend-value">{{ stat.trend }}</span>
                      </div>
                      <div v-else-if="stat.desc" class="stat-desc">{{ stat.desc }}</div>
                      <div v-else class="stat-desc-placeholder"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useEnergyStorageStore } from '@/stores/energyStorage'
import {
  Battery, Zap, Plug, ShieldCheck, MapPin, Server
} from 'lucide-vue-next'

const statIcons = [Battery, Zap, Plug, Zap, ShieldCheck, MapPin, Server]
const { stationStats } = storeToRefs(useEnergyStorageStore())

const formatNumber = (num: number) => num.toLocaleString('zh-CN')
</script>

<style scoped>
.station-panel {
  width: 340px;
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
.station-panel .panel-body {
  padding-top: 4px;
  flex: 1;
  min-height: 0;
  position: relative;
}
.station-inner {
  position: relative;
  padding: 8px;
  height: 100%;
}
.station-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.station-inner .stats-grid {
  position: relative;
  z-index: 1;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 1fr;
  gap: 8px;
  padding: 6px;
  height: 100%;
}
.stat-card {
  position: relative;
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid color-mix(in srgb, var(--accent-color), transparent 82%);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 2px 10px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.stat-accent-line {
  height: 3px;
  width: 100%;
  background: var(--accent-color);
  box-shadow: 0 0 8px var(--accent-color);
  flex-shrink: 0;
}
.stat-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 10px 10px;
  flex: 1;
  min-height: 74px;
}
.stat-icon-wrap {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon {
  width: 26px;
  height: 26px;
  color: var(--accent-color);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--accent-color), transparent 35%));
}
.stat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
  line-height: 1.2;
}
.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1.1;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
  letter-spacing: 0.3px;
}
.stat-unit {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  transform: translateY(-3px);
}
.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  margin-top: 2px;
}
.trend-label {
  color: rgba(255, 255, 255, 0.4);
}
.trend-value {
  color: #22c55e;
}
.stat-desc {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.3);
  margin-top: 2px;
}
.stat-desc-placeholder {
  height: 14px;
}
</style>
