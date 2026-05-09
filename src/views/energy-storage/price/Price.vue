<template>
  <div class="price-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />

    <!-- 页面标题 -->
    <div class="price-page-header">
      <div class="price-page-title">
        <span class="title-main">电价设置</span>
        <el-cascader
          v-model="selectedRegionPath"
          :options="regionOptions"
          :props="{ value: 'value', label: 'label', children: 'children' }"
          placeholder="选择地区"
          class="region-cascader"
          popper-class="region-cascader-popper"
          clearable
        />
      </div>
    </div>

    <!-- 各时段电价设置 -->
    <PriceSettingSection :selected-region="selectedRegion" @show-history="historyVisible = true" />

    <!-- 电价时段设置 -->
    <TimeSettingSection :selected-region="selectedRegion" />

    <!-- 历史电价弹窗 -->
    <PriceHistoryDialog v-model:visible="historyVisible" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { useApiData } from '@/composables/useApiData'
import { energyStorageApi } from '@/api/api'

import { energyStorageTabs } from '@/constants/navigation'
import PriceSettingSection from './components/PriceSettingSection.vue'
import TimeSettingSection from './components/TimeSettingSection.vue'
import PriceHistoryDialog from './components/PriceHistoryDialog.vue'
import { regionOptions, regionDataMap } from './data/regionData'

// 联调时：通过 energyStorageApi.getPriceList() / getCurrentPrice() 获取电价数据
// regionData.ts 作为 mock 数据源，regionOptions 作为静态地区配置
useApiData(
  () => null,
  () => energyStorageApi.getCurrentPrice().then(r => r.data)
)

defineProps<{ embedded?: boolean }>()

const historyVisible = ref(false)

const selectedRegionPath = ref<string[]>(['guangdong', 'guangzhou', 'huangpu'])

const selectedRegion = computed(() => {
  if (!selectedRegionPath.value || selectedRegionPath.value.length < 3) return null
  const path = selectedRegionPath.value
  const province = regionOptions.find(o => o.value === path[0])
  if (!province) return null
  const city = province.children?.find(o => o.value === path[1])
  if (!city) return null
  const district = city.children?.find(o => o.value === path[2])
  if (!district) return null
  const labelPath = `${province.label}/${city.label}/${district.label}`
  const data = regionDataMap[labelPath]
  return {
    path: labelPath,
    province: province.label,
    city: city.label,
    district: district.label,
    data: data || null
  }
})
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

/* 地区级联选择器 - 暗色主题 */
.region-cascader {
  width: 300px;
}

:deep(.region-cascader .el-input__wrapper) {
  background: rgba(10, 23, 42, 0.6);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 6px;
  box-shadow: none;
}

:deep(.region-cascader .el-input__wrapper:hover) {
  border-color: rgba(2, 167, 240, 0.4);
}

:deep(.region-cascader .el-input__inner) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

:deep(.region-cascader .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.35);
}

:deep(.region-cascader .el-input__suffix .el-icon) {
  color: rgba(255, 255, 255, 0.4);
}
</style>

<!-- 全局样式：级联面板暗色主题 -->
<style>
.region-cascader-popper {
  background: #0f1e32 !important;
  border: 1px solid rgba(129, 211, 248, 0.2) !important;
  border-radius: 8px !important;
}

.region-cascader-popper .el-cascader-node {
  color: rgba(255, 255, 255, 0.8);
}

.region-cascader-popper .el-cascader-node:not(.is-disabled):hover {
  background: rgba(2, 167, 240, 0.12);
}

.region-cascader-popper .el-cascader-node.is-active {
  color: #02A7F0;
}

.region-cascader-popper .el-cascader-node.in-active-path {
  background: rgba(2, 167, 240, 0.08);
  color: #02A7F0;
}

.region-cascader-popper .el-cascader-node__label {
  font-size: 13px;
}

.region-cascader-popper .el-cascader-menu {
  border-right-color: rgba(129, 211, 248, 0.08);
}

.region-cascader-popper .el-cascader-menu:last-child {
  border-right: none;
}

.region-cascader-popper .el-cascader-panel {
  background: #0f1e32;
}
</style>
