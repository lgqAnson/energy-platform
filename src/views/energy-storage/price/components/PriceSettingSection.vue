<template>
  <div class="price-setting-section">
    <!-- 标题行：图标 + 标题 + 开关 + 提示文字 -->
    <div class="section-header">
      <div class="header-left">
        <Zap class="title-icon" :size="20" />
        <span class="section-title-text">各时段电价设置</span>
        <ToggleRight v-if="autoUpdate" class="toggle-icon active" :size="20" @click="autoUpdate = false" />
        <ToggleLeft v-else class="toggle-icon" :size="20" @click="autoUpdate = true" />
        <span class="toggle-label">启用自动更新(每日同步电网最新电价)</span>
      </div>
      <p class="section-hint hint-warning">
        提示：实时电价政策更新后请关注：峰、平、谷时段电价、手动设置电价策略配置，实时电价新增提醒！2026-01-12 06:10:22
      </p>
    </div>

    <!-- 主体区域：4个电价卡片 + 右侧历史按钮 -->
    <div class="section-body">
      <div class="price-cards">
        <div
          v-for="card in priceCards"
          :key="card.key"
          class="price-card"
          :class="`card-${card.key}`"
        >
          <!-- 卡片顶部标签组 -->
          <div class="card-tags">
            <span class="card-tag card-tag-primary" :style="{ background: card.tagBg, color: card.tagColor }">
              {{ card.tagPrimary }}
            </span>
            <span class="card-tag card-tag-secondary" :style="{ background: card.tagSecondaryBg, color: card.tagSecondaryColor }">
              {{ card.tagSecondary }}
            </span>
            <button v-if="!autoUpdate" class="card-adjust-btn">设置调整</button>
          </div>

          <!-- 卡片标题 -->
          <div class="card-title-row">
            <span class="card-title">{{ card.title }}</span>
          </div>

          <!-- 卡片内容：图标 + 价格数据 -->
          <div class="card-content">
            <component :is="card.icon" class="card-icon-large" :size="40" :color="card.iconColor" />
            <div class="card-prices">
              <div class="price-row">
                <span class="price-label">高</span>
                <span class="price-value">{{ card.charge.toFixed(2) }}</span>
                <span class="price-unit">元/kWh</span>
              </div>
              <div class="price-row">
                <span class="price-label">低</span>
                <span class="price-value">{{ card.discharge.toFixed(2) }}</span>
                <span class="price-unit">元/kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：查看历史电价按钮（垂直） -->
      <button class="history-btn-vertical" @click="$emit('show-history')">
        <ArrowUpRight :size="20" />
        <span>查看历史<br/>电价</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Zap, Flame, Sun, Moon, ToggleRight, ToggleLeft, ArrowUpRight } from 'lucide-vue-next'
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
  tagPrimary: string
  tagSecondary: string
  tagBg: string
  tagColor: string
  tagSecondaryBg: string
  tagSecondaryColor: string
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
      title: '尖峰电价',
      icon: Zap,
      iconColor: '#FF4D4D',
      charge: 1.43,
      discharge: 1.43,
      tagPrimary: '实时电价',
      tagSecondary: '近期调整',
      tagBg: 'rgba(255, 77, 77, 0.2)',
      tagColor: '#FF4D4D',
      tagSecondaryBg: 'rgba(255, 140, 0, 0.15)',
      tagSecondaryColor: '#FF8C00'
    },
    {
      key: 'peak',
      title: '峰时电价',
      icon: Flame,
      iconColor: '#FF8C00',
      charge: 1.43,
      discharge: 1.43,
      tagPrimary: '峰时电价',
      tagSecondary: '近期调整',
      tagBg: 'rgba(255, 140, 0, 0.2)',
      tagColor: '#FF8C00',
      tagSecondaryBg: 'rgba(255, 140, 0, 0.15)',
      tagSecondaryColor: '#FF8C00'
    },
    {
      key: 'flat',
      title: '平时段电价',
      icon: Sun,
      iconColor: '#4A9EFF',
      charge: 1.43,
      discharge: 1.43,
      tagPrimary: '平时段电价',
      tagSecondary: '近期调整',
      tagBg: 'rgba(74, 158, 255, 0.2)',
      tagColor: '#4A9EFF',
      tagSecondaryBg: 'rgba(74, 158, 255, 0.1)',
      tagSecondaryColor: '#4A9EFF'
    },
    {
      key: 'valley',
      title: '谷时电价',
      icon: Moon,
      iconColor: '#4A9EFF',
      charge: 1.43,
      discharge: 1.43,
      tagPrimary: '谷时电价',
      tagSecondary: '近期调整',
      tagBg: 'rgba(74, 158, 255, 0.2)',
      tagColor: '#4A9EFF',
      tagSecondaryBg: 'rgba(74, 158, 255, 0.1)',
      tagSecondaryColor: '#4A9EFF'
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
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.06) 0%, rgba(10, 23, 42, 0.4) 100%);
  border: 1px solid rgba(129, 211, 248, 0.12);
}

/* 标题行：左侧(图标+标题+开关) + 右侧(提示文字) */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(129, 211, 248, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #02A7F0;
  flex-shrink: 0;
}

.section-title-text {
  font-size: 15px;
  font-weight: 700;
  color: #02A7F0;
}

.toggle-icon {
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}

.toggle-icon.active {
  color: #02A7F0;
}

.toggle-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 提示文字 - 橙色警告样式 */
.section-hint.hint-warning {
  font-size: 11px;
  line-height: 1.4;
  color: rgba(255, 180, 50, 0.85);
  background: rgba(255, 140, 0, 0.08);
  border: 1px solid rgba(255, 140, 0, 0.25);
  border-radius: 4px;
  padding: 6px 12px;
  white-space: nowrap;
}

/* 主体区域：左侧卡片 + 右侧历史按钮 */
.section-body {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

/* 4个电价卡片网格 */
.price-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.price-card {
  background: linear-gradient(145deg, rgba(20, 40, 65, 0.85) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

/* 卡片顶部标签组 */
.card-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.card-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.card-tag-primary {
  border-left: 2px solid currentColor;
}

.card-tag-secondary {
  opacity: 0.75;
}

.card-adjust-btn {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 4px;
  background: linear-gradient(135deg, rgba(2, 167, 240, 0.2) 0%, rgba(2, 167, 240, 0.1) 100%);
  border: 1px solid rgba(2, 167, 240, 0.35);
  color: #02A7F0;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.card-adjust-btn:hover {
  background: linear-gradient(135deg, rgba(2, 167, 240, 0.35) 0%, rgba(2, 167, 240, 0.2) 100%);
  border-color: rgba(2, 167, 240, 0.55);
}

/* 卡片标题 */
.card-title-row {
  display: flex;
  align-items: center;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

/* 卡片内容区：大图标 + 价格数据 */
.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.card-icon-large {
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px currentColor);
  opacity: 0.9;
}

.card-prices {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  min-width: 16px;
}

.price-value {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.price-unit {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

/* 历史电价按钮（右侧垂直样式） */
.history-btn-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 72px;
  padding: 20px 12px;
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.05) 0%, rgba(10, 23, 42, 0.6) 100%);
  border: 1px solid rgba(129, 211, 248, 0.18);
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
}

.history-btn-vertical:hover {
  background: linear-gradient(180deg, rgba(2, 167, 240, 0.12) 0%, rgba(10, 23, 42, 0.8) 100%);
  border-color: rgba(2, 167, 240, 0.4);
  color: #02A7F0;
}

/* 响应式 */
@media (max-width: 1200px) {
  .price-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .price-cards {
    grid-template-columns: 1fr;
  }

  .history-btn-vertical {
    width: 100%;
    flex-direction: row;
    padding: 12px 16px;
  }
}
</style>
