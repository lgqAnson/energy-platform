<template>
  <div class="space-y-5">
    <CardPanel title="设备管理">
      <div class="flex gap-4 h-[calc(100vh-280px)] min-h-[600px]">
        <DeviceTreePanel
          :tree="filteredTree"
          :search-keyword="searchKeyword"
          :selected-statuses="selectedStatuses"
          :status-filters="statusFilters"
          :selected-device-id="viewState.selectedNode?.deviceId"
          :tree-loading="treeLoading"
          :deleting="deleting"
          @update:search-keyword="searchKeyword = $event"
          @update:selected-statuses="selectedStatuses = $event"
          @toggle-category="toggleCategory"
          @toggle-station="toggleStation"
          @select-category="selectCategory"
          @select-station="selectStation"
          @select-device="selectDevice"
          @delete-station="removeStation"
          @delete-device="removeDevice"
          @create-station="startCreateStation"
          @create-device="startCreateDevice"
        />

        <DeviceDetailPanel
          :panel="viewState.panel"
          :mode="viewState.mode"
          :form-data="currentFormData"
          :saving="saving"
          @save="(v: any) => saveCurrent(v)"
          @cancel="cancelEdit"
          @edit="startEdit"
        />
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import CardPanel from '@/components/common/CardPanel.vue'
import DeviceDetailPanel from './components/DeviceDetailPanel.vue'
import DeviceTreePanel from './components/DeviceTreePanel.vue'
import { useDeviceManager } from './useDeviceManager'

const {
  filteredTree,
  searchKeyword,
  selectedStatuses,
  statusFilters,
  viewState,
  currentFormData,
  saving,
  deleting,
  treeLoading,
  selectCategory,
  selectStation,
  selectDevice,
  startCreateStation,
  startCreateDevice,
  startEdit,
  cancelEdit,
  saveCurrent,
  removeStation,
  removeDevice,
  toggleCategory,
  toggleStation
} = useDeviceManager()
</script>
