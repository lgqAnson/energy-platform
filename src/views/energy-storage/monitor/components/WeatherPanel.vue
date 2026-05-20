<template>
  <div class="weather-panel">
    <div class="panel-header">
      <img src='' class="panel-header-bg" alt="" />
      <span class="panel-header-text">环境监测</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="weather-loading">
      <span>天气数据加载中...</span>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="weather-error">
      <span>{{ error }}</span>
    </div>

    <template v-else-if="weather">
      <div class="weather-main">
        <div class="weather-city">
          <MapPin class="weather-icon" />
          <span class="city-name">{{ weather.city }}</span>
        </div>
        <div class="weather-temp">
          <span class="temp-value">{{ weather.temperature }}</span>
          <span class="temp-unit">°C</span>
        </div>
        <div class="weather-desc">{{ weather.description }}</div>
      </div>

      <!-- 高温预警 -->
      <div v-if="showAlert" class="weather-alert">
        <div class="alert-icon">!</div>
        <div class="alert-content">
          <div class="alert-title">高温电价策略已启用</div>
          <div class="alert-desc">
            根据天气预报，今日最高气温达{{ weather.maxTemp }}°C，系统已自动切换至高温电价策略进行电费计量
          </div>
        </div>
      </div>

      <!-- 正常温度提示 -->
      <div v-else class="weather-normal">
        <span>今日温度适宜，{{ weather.minTemp }}°C ~ {{ weather.maxTemp }}°C</span>
      </div>
    </template>

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
import { computed, onMounted } from 'vue'
import { MapPin } from 'lucide-vue-next'
import { useAsyncState } from '@/composables/useAsyncState'
import { fetchWeather, isHighTempAlert, type WeatherInfo } from '@/api/weather'

/** 查询城市，默认从环境变量读取 */
const city = import.meta.env.VITE_WEATHER_CITY || '广州'

const { data: weather, loading, error, execute } = useAsyncState<WeatherInfo>(null)

/** 加载天气数据 */
function loadWeather() {
  execute(async () => fetchWeather(city))
}

onMounted(() => { loadWeather() })

/** 是否显示高温预警（最高温度 >= 35°C） */
const showAlert = computed(() => {
  if (!weather.value) return false
  return isHighTempAlert(weather.value.maxTemp)
})
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

.weather-loading,
.weather-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.weather-error {
  color: #ef4444;
}

.weather-normal {
  display: flex;
  align-items: center;
  padding: 10px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>