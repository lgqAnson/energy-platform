<template>
  <div class="settlement-container">
    <!-- <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" /> -->

    <!-- 页面标题 -->
    <div class="settlement-page-header">
      <span class="page-title">电表数据详情</span>
    </div>

    <!-- 计量电表数据 -->
    <MeterDataSection />
  </div>
</template>

<script setup lang="ts">
import ModuleTabs from '@/components/common/ModuleTabs.vue'

import { energyStorageTabs } from '@/constants/navigation'
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
  background-image: url('/images/title@2x.png');
  width: 50%;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: left center;
  padding-left: 36px;
  height: 49px;
  display: flex;
  align-items: center;
}

.page-title {
    font-size: 24px;
    font-weight: 500;
    color: #fff;
    font-style: italic;
}
</style>
