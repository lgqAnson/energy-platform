<template>
  <div class="price-setting-section">
    <!-- 标题行：图标 + 标题 + 开关 + 提示文字 -->
    <div class="section-header">
      <div class="header-left">
        <!-- <Zap class="title-icon" :size="20" /> -->
         <img src="/icons/Subheading.png" class="detail-title-icon" />
        <span class="section-title-text">各时段电价设置</span>
        <label class="toggle-switch" :class="{ active: autoUpdate }" @click="autoUpdate = !autoUpdate">
          <span class="toggle-knob"></span>
        </label>
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
            <span class="card-tag card-tag-secondary" >
              {{ card.title }}
            </span>
            <button v-if="!autoUpdate" class="card-save-btn" @click="saveCard(card.key)">保存设置</button>
          </div>

          <!-- 卡片内容区：大图标 + 价格数据 -->
          <div class="card-content">
            <div class="card-prices">
              <div class="price-row">
                <span class="price-label">放</span>
                <template v-if="!autoUpdate">
                  <input type="number" class="price-input" v-model.number="editingCards[card.key].discharge" step="0.01" />
                </template>
                <template v-else>
                  <span class="price-value">{{ card.discharge.toFixed(2) }}</span>
                </template>
                <span class="price-unit">元/kWh</span>
              </div>
              <div class="price-row">
                <span class="price-label">充</span>
                <template v-if="!autoUpdate">
                  <input type="number" class="price-input" v-model.number="editingCards[card.key].charge" step="0.01" />
                </template>
                <template v-else>
                  <span class="price-value">{{ card.charge.toFixed(2) }}</span>
                </template>
                <span class="price-unit">元/kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：查看历史电价按钮（垂直） -->
      <button class="history-btn-vertical" @click="$emit('show-history')">
        <img src="/icons/vuesax_outline_send@2x.png" alt="" class="history-btn-icon" />
        <span>查看历史电价</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Zap, Flame, Sun, Moon } from 'lucide-vue-next'
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

/** 各卡片的编辑状态（手动模式下用于绑定输入框） */
const editingCards = reactive<Record<string, { charge: number; discharge: number }>>({
  sharp: { charge: 1.43, discharge: 1.43 },
  peak: { charge: 1.43, discharge: 1.43 },
  flat: { charge: 1.43, discharge: 1.43 },
  valley: { charge: 1.43, discharge: 1.43 }
})

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
      tagPrimary: '尖峰时段',
      tagSecondary: '尖时段电价',
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
      tagPrimary: '高峰时段',
      tagSecondary: '峰时段电价',
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
      tagPrimary: '平常时段',
      tagSecondary: '平时段电价',
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
      tagPrimary: '低谷时段',
      tagSecondary: '谷时段电价',
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

    /** 自动模式下同步编辑缓存 */
    if (autoUpdate.value) {
      if (sharp) { editingCards.sharp.charge = sharp.charge; editingCards.sharp.discharge = sharp.discharge }
      if (peak) { editingCards.peak.charge = peak.charge; editingCards.peak.discharge = peak.discharge }
      if (flat) { editingCards.flat.charge = flat.charge; editingCards.flat.discharge = flat.discharge }
      if (valley) { editingCards.valley.charge = valley.charge; editingCards.valley.discharge = valley.discharge }
    }
  }
}, { immediate: true })

/** 切换到手动编辑模式时（autoUpdate=false），用当前卡片值初始化输入框 */
watch(autoUpdate, (val) => {
  if (!val) {
    priceCards.value.forEach(card => {
      editingCards[card.key] = { charge: card.charge, discharge: card.discharge }
    })
  }
})

/**
 * 保存指定电价卡片的设置（手动模式下将输入框值写回卡片，并退出编辑模式）
 * @param key 电价时段标识（sharp/peak/flat/valley）
 */
function saveCard(key: string) {
  const card = priceCards.value.find(c => c.key === key)
  const editing = editingCards[key]
  if (card && editing) {
    card.charge = editing.charge
    card.discharge = editing.discharge
  }
  autoUpdate.value = true
}

// WebSocket 实时数据订阅（10s）
useRealtimeChannel('price', (payload) => {
  /** 电价实时数据载荷 */
  const p = payload as {
    sharp?: { charge: number; discharge: number }
    peak?: { charge: number; discharge: number }
    flat?: { charge: number; discharge: number }
    valley?: { charge: number; discharge: number }
  }
  if (p.sharp !== undefined) {
    const sharp = priceCards.value.find(c => c.key === 'sharp')
    if (sharp) { sharp.charge = p.sharp.charge; sharp.discharge = p.sharp.discharge }
  }
  if (p.peak !== undefined) {
    const peak = priceCards.value.find(c => c.key === 'peak')
    if (peak) { peak.charge = p.peak.charge; peak.discharge = p.peak.discharge }
  }
  if (p.flat !== undefined) {
    const flat = priceCards.value.find(c => c.key === 'flat')
    if (flat) { flat.charge = p.flat.charge; flat.discharge = p.flat.discharge }
  }
  if (p.valley !== undefined) {
    const valley = priceCards.value.find(c => c.key === 'valley')
    if (valley) { valley.charge = p.valley.charge; valley.discharge = p.valley.discharge }
  }
})
</script>

<style scoped>
.price-setting-section {
  position: relative;
  padding: 16px 20px;
}

.price-setting-section::after {
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

.price-setting-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}
.detail-title-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
/* 标题行：左侧(图标+标题+开关) + 右侧(提示文字) */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid ;
  border-image: linear-gradient(90deg, rgba(0, 246, 255, 1), rgba(0, 246, 255, 0)) 1 1;
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
  font-weight: 500;
  color: #fff;
  font-style: italic;
}

/** iOS 风格开关 */
.toggle-switch {
  position: relative;
  width: 29px;
  height: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: linear-gradient(135deg, #34D058 0%, #28A745 100%);
  border-color: #2EA043;
  box-shadow: 0 0 10px rgba(52, 208, 88, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.toggle-knob {
  position: absolute;
  top: -1px;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.3s ease;
}

.toggle-switch.active .toggle-knob {
  transform: translateX(16px);
}

.toggle-label {
  font-size: 12px;
  color: #fff;
}

/* 提示文字 - 橙色警告样式 */
.section-hint.hint-warning {
  font-size: 11px;
  line-height: 1.4;
  color: #F7AE34;
  background: rgba(245,180,0,0.2);
  border-radius: 4px;
  padding: 6px 12px;
  white-space: nowrap;
}

/* 主体区域：左侧卡片 + 右侧历史按钮 */
.section-body {
  display: flex;
  gap: 36px;
  align-items: stretch;
}

/* 4个电价卡片网格 */
.price-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 36px;
}

.price-card {
  background: linear-gradient(145deg, rgba(20, 40, 65, 0.85) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 140px;
}

/* 尖峰电价卡片背景 */
.price-card.card-sharp {
  background-image: url('/images/spike.png');
}

/* 峰时电价卡片背景 */
.price-card.card-peak {
  background-image: url('/images/peak.png');
}

/* 平时段电价卡片背景 */
.price-card.card-flat {
  background-image: url('/images/ordinary.png');
}

/* 谷时电价卡片背景 */
.price-card.card-valley {
  background-image: url('/images/trough.png');
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
  /* border-left: 2px solid currentColor; */
}

.card-tag-secondary {
  font-size: 16px;
color: #FFFFFF;
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

/** 手动模式下的保存设置按钮 */
.card-save-btn {
  margin-left: auto;
  color: #FFF;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.card-save-btn:hover {
  background: rgba(255, 77, 77, 0.15);
  border-color: rgba(255, 77, 77, 0.9);
}

/* 卡片标题 - 已移至标签区域 */
.card-title-row {
  display: none;
}

/* 卡片内容区：大图标 + 价格数据 */
.card-content {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 16px;
  padding: 12px 30px;
  flex: 1;
}

.card-icon-large {
  flex-shrink: 0;
  filter: drop-shadow(0 0 12px currentColor);
  opacity: 0.95;
}

.card-prices {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 20px;
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  min-width: 56px;
}

/** 手动编辑模式下的价格输入框 */
.price-input {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
  min-width: 64px;
  width: 64px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(2, 167, 240, 0.4);
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
  transition: all 0.2s;
}

.price-input:focus {
  border-color: #02A7F0;
  box-shadow: 0 0 8px rgba(2, 167, 240, 0.3);
  background: rgba(255, 255, 255, 0.12);
}

/** 移除数字输入框默认箭头 */
.price-input::-webkit-inner-spin-button,
.price-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.price-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

/* 历史电价按钮（右侧垂直样式） */
.history-btn-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 126px;
  padding: 20px 12px;
  border-radius: 8px;
  background-image: url('/images/viewPriceBg.png');
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  line-height: 1.4;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
}

.history-btn-icon {
  width: 24px;
  height: 24px;
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
