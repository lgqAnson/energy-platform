<template>
  <div class="weather-panel">
    <div class="weather-main">
      <div class="weather-city">
        <MapPin class="weather-icon" />
        <span class="city-name">广州</span>
      </div>
      <div class="weather-temp">
        <span class="temp-value">32</span>
        <span class="temp-unit">C</span>
      </div>
      <div class="weather-desc">晴，空气质量良好</div>
    </div>
    <div class="weather-alert">
      <div class="alert-icon">!</div>
      <div class="alert-content">
        <div class="alert-title">高温电价策略已启用</div>
        <div class="alert-desc">根据天气预报，今日最高气温达33C，系统已自动切换至高温电价策略进行电费计量</div>
      </div>
    </div>
    <div class="price-row">
      <div class="price-card peak">
        <div class="price-label">峰时电价</div>
        <div class="price-value">1.25<span class="price-unit">元/kWh</span></div>
      </div>
      <div class="price-card flat">
        <div class="price-label">平时电价</div>
        <div class="price-value">0.78<span class="price-unit">元/kWh</span></div>
      </div>
      <div class="price-card valley">
        <div class="price-label">谷时电价</div>
        <div class="price-value">0.32<span class="price-unit">元/kWh</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
</script>

<style scoped>
.weather-panel {
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather-city {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.7);
}

.weather-icon {
  width: 18px;
  height: 18px;
}

.city-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.weather-temp {
  display: flex;
  align-items: flex-start;
  gap: 2px;
}

.temp-value {
  font-size: 32px;
  font-weight: 700;
  color: #02A7F0;
  line-height: 1;
}

.temp-unit {
  font-size: 14px;
  color: #02A7F0;
  margin-top: 2px;
}

.weather-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: auto;
}

.weather-alert {
  display: flex;
  gap: 10px;
  background: rgba(250, 173, 20, 0.1);
  border: 1px solid rgba(250, 173, 20, 0.2);
  border-radius: 8px;
  padding: 10px;
}

.alert-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(250, 173, 20, 0.3);
  color: #FAAD14;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.alert-title {
  font-size: 12px;
  font-weight: 600;
  color: #FAAD14;
  margin-bottom: 2px;
}

.alert-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.4;
}

.price-row {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.price-card {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
}

.price-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 4px;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
}

.price-unit {
  font-size: 11px;
  font-weight: 400;
  margin-left: 2px;
}

.price-card.peak .price-value {
  color: #ef4444;
}

.price-card.flat .price-value {
  color: #02A7F0;
}

.price-card.valley .price-value {
  color: #22c55e;
}
</style>