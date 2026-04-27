<template>
  <div class="settlement-container">
    <EnergyStorageTabs :embedded="embedded" />

    <!-- 页面标题 -->
    <div class="settlement-page-header">
      <span class="page-title">电表数据详情</span>
    </div>

    <!-- 计量电表数据 -->
    <MeterDataSection />
  </div>
</template>

<script setup lang="ts">
import EnergyStorageTabs from '@/components/common/EnergyStorageTabs.vue'
import MeterDataSection from './components/MeterDataSection.vue'

defineProps<{ embedded?: boolean }>()
</script>

<style scoped>
.settlement-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settlement-page-header {
  margin-bottom: 4px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #02A7F0;
}
</style>
