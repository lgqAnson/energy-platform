<template>
  <div class="price-setting-section">
    <!-- 标题行 -->
    <div class="section-header">
      <div class="section-title-row">
        <Zap class="title-icon" :size="20" />
        <span class="section-title-text">各时段电价设置</span>
      </div>
      <p class="section-hint">
        提示：支持根据电网发布的当月尖、峰、平、谷时段电价，手动或自动更新匹配。
        <template v-if="selectedRegion?.data">
          当前电价数据更新至：{{ selectedRegion.data.updatedAt }}
        </template>
      </p>
    </div>

    <!-- 开关 + 历史电价按钮 -->
    <div class="section-toolbar">
      <div class="toggle-row">
        <ToggleRight v-if="autoUpdate" class="toggle-icon active" :size="36" @click="autoUpdate = false" />
        <ToggleLeft v-else class="toggle-icon" :size="36" @click="autoUpdate = true" />
        <span class="toggle-label">启用自动更新(每日同步电网最新电价)</span>
      </div>
      <button class="history-btn" @click="$emit('show-history')">
        <History :size="16" />
        <span>历史电价</span>
      </button>
    </div>

    <!-- 4个电价卡片 -->
    <div class="price-cards">
      <div
        v-for="card in priceCards"
        :key="card.key"
        class="price-card"
        :class="`card-${card.key}`"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="card-title-row">
            <component :is="card.icon" class="card-icon" :size="18" :color="card.iconColor" />
            <span class="card-title">{{ card.title }}</span>
          </div>
          <button v-if="!autoUpdate" class="save-btn" @click="saveCard(card.key)">
            <Save :size="14" />
            <span>保存设置</span>
          </button>
        </div>

        <!-- 价格输入 -->
        <div class="card-body">
          <div class="price-row">
            <span class="price-label">充：</span>
            <input
              v-model.number="card.charge"
              type="number"
              step="0.01"
              class="price-input"
              :readonly="autoUpdate"
            />
            <span class="price-unit">元/kWh</span>
          </div>
          <div class="price-row">
            <span class="price-label">放：</span>
            <input
              v-model.number="card.discharge"
              type="number"
              step="0.01"
              class="price-input"
              :readonly="autoUpdate"
            />
            <span class="price-unit">元/kWh</span>
          </div>
        </div>

        <!-- 标签 -->
        <div class="card-footer">
          <span class="card-tag" :style="{ background: card.tagBg, color: card.tagColor }">
            {{ card.tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Zap, Flame, Sun, Moon, History, Save, ToggleRight, ToggleLeft } from 'lucide-vue-next'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import type { RegionInfo } from '../data/regionData'

const props = defineProps<{
  selectedRegion: {
    path: string
    province: string
    city: string
    district: string
    data: RegionInfo | null
  } | null
}>()

defineEmits<{
  (e: 'show-history'): void
}>()

const autoUpdate = ref(true)

interface PriceCard {
  key: string
  title: string
  icon: any
  iconColor: string
  charge: number
  discharge: number
  tag: string
  tagBg: string
  tagColor: string
}

/**
 * 创建默认的四个时段电价卡片（尖/峰/平/谷），
 * 包含充放电价格、图标、标签颜色等初始值
 * @returns 默认电价卡片数组
 */
function createDefaultCards(): PriceCard[] {
  return [
    {
      key: 'sharp',
      title: '尖时段电价',
      icon: Flame,
      iconColor: '#FF6B35',
      charge: 1.43,
      discharge: 1.43,
      tag: '尖峰时段',
      tagBg: 'rgba(255, 107, 53, 0.2)',
      tagColor: '#FF6B35'
    },
    {
      key: 'peak',
      title: '峰时段电价',
      icon: Sun,
      iconColor: '#FF4D4D',
      charge: 1.15,
      discharge: 1.15,
      tag: '高峰时段',
      tagBg: 'rgba(255, 77, 77, 0.2)',
      tagColor: '#FF4D4D'
    },
    {
      key: 'flat',
      title: '平时段电价',
      icon: Zap,
      iconColor: '#4A9EFF',
      charge: 0.68,
      discharge: 0.68,
      tag: '平常时段',
      tagBg: 'rgba(74, 158, 255, 0.2)',
      tagColor: '#4A9EFF'
    },
    {
      key: 'valley',
      title: '谷时段电价',
      icon: Moon,
      iconColor: '#4A9EFF',
      charge: 0.27,
      discharge: 0.27,
      tag: '低谷时段',
      tagBg: 'rgba(74, 158, 255, 0.2)',
      tagColor: '#4A9EFF'
    }
  ]
}

const priceCards = ref<PriceCard[]>(createDefaultCards())

/**
 * 监听所选区域的电价数据变化，自动更新四个电价卡片
 * 当 regionData 变化时立即同步尖/峰/平/谷时段的充放电价格
 */
watch(() => props.selectedRegion?.data, (regionData) => {
  if (regionData) {
    const { prices } = regionData
    const cards = priceCards.value
    const sharp = cards.find(c => c.key === 'sharp')
    const peak = cards.find(c => c.key === 'peak')
    const flat = cards.find(c => c.key === 'flat')
    const valley = cards.find(c => c.key === 'valley')
    if (sharp) { sharp.charge = prices.sharp.charge; sharp.discharge = prices.sharp.discharge }
    if (peak) { peak.charge = prices.peak.charge; peak.discharge = prices.peak.discharge }
    if (flat) { flat.charge = prices.flat.charge; flat.discharge = prices.flat.discharge }
    if (valley) { valley.charge = prices.valley.charge; valley.discharge = prices.valley.discharge }
  }
}, { immediate: true })

/**
 * 保存指定电价卡片的设置（仅在手动模式下可用）
 * @param key 电价时段标识（sharp/peak/flat/valley）
 */
function saveCard(key: string) {
  const card = priceCards.value.find(c => c.key === key)
  if (card) {
    console.log(`保存 ${card.title}: 充=${card.charge}, 放=${card.discharge}`)
  }
}

// WebSocket 实时数据订阅（10s）
useRealtimeChannel('price', (payload) => {
  if (payload.sharp !== undefined) {
    const sharp = priceCards.value.find(c => c.key === 'sharp')
    if (sharp) { sharp.charge = payload.sharp.charge; sharp.discharge = payload.sharp.discharge }
  }
  if (payload.peak !== undefined) {
    const peak = priceCards.value.find(c => c.key === 'peak')
    if (peak) { peak.charge = payload.peak.charge; peak.discharge = payload.peak.discharge }
  }
  if (payload.flat !== undefined) {
    const flat = priceCards.value.find(c => c.key === 'flat')
    if (flat) { flat.charge = payload.flat.charge; flat.discharge = payload.flat.discharge }
  }
  if (payload.valley !== undefined) {
    const valley = priceCards.value.find(c => c.key === 'valley')
    if (valley) { valley.charge = payload.valley.charge; valley.discharge = payload.valley.discharge }
  }
})
</script>

<style scoped>
.price-setting-section {
  padding: 16px 20px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.08) 0%, rgba(85, 85, 85, 0.05) 100%);
  border: 1px solid rgba(129, 211, 248, 0.15);
}

.section-header {
  margin-bottom: 12px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.title-icon {
  color: #02A7F0;
}

.section-title-text {
  font-size: 16px;
  font-weight: 700;
  color: #02A7F0;
}

.section-hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  padding-left: 28px;
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-left: 28px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-icon {
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-icon.active {
  color: #02A7F0;
}

.toggle-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.history-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 4px;
  background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%);
  color: #fff;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.history-btn:hover {
  opacity: 0.9;
}

/* 4个电价卡片 */
.price-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding-left: 28px;
}

.price-card {
  background: rgba(10, 23, 42, 0.6);
  border: 1px solid rgba(129, 211, 248, 0.12);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  background: linear-gradient(135deg, #02A7F0 0%, #01579B 100%);
  color: #fff;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 28px;
}

.price-input {
  width: 72px;
  padding: 3px 6px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(129, 211, 248, 0.2);
  border-radius: 4px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  outline: none;
}

.price-input:focus {
  border-color: #02A7F0;
}

.price-input[readonly] {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(129, 211, 248, 0.08);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

.price-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.card-footer {
  margin-top: 4px;
}

.card-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 1200px) {
  .price-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .price-cards {
    grid-template-columns: 1fr;
  }
}
</style>
