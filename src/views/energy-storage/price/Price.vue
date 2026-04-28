<template>
  <div class="price-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />

    <!-- 页面标题 -->
    <div class="price-page-header">
      <div class="price-page-title">
        <span class="title-main">电价设置</span>
        <span class="title-region">地区：广东省 &gt; 广州市 &gt; 黄埔区</span>
      </div>
    </div>

    <!-- 各时段电价设置 -->
    <PriceSettingSection @show-history="historyVisible = true" />

    <!-- 电价时段设置 -->
    <TimeSettingSection />

    <!-- 历史电价弹窗 -->
    <PriceHistoryDialog v-model:visible="historyVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModuleTabs from '@/components/common/ModuleTabs.vue'

const energyStorageTabs = [
  { name: '可视看板', path: '/energy-storage/dashboard' },
  { name: '实时监控', path: '/energy-storage/monitor' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '电价管理', path: '/energy-storage/price' },
  { name: '抄表结算', path: '/energy-storage/settlement' },
  { name: '收益管理', path: '/energy-storage/revenue' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]
import PriceSettingSection from './components/PriceSettingSection.vue'
import TimeSettingSection from './components/TimeSettingSection.vue'
import PriceHistoryDialog from './components/PriceHistoryDialog.vue'

defineProps<{ embedded?: boolean }>()

const historyVisible = ref(false)
</script>

<style scoped>
.price-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.price-page-header {
  margin-bottom: 4px;
}

.price-page-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.title-main {
  font-size: 18px;
  font-weight: 700;
  color: #02A7F0;
}

.title-region {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
