<template>
  <div class="maintenance-container">
    <!-- <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" /> -->
    <WorkOrderManager :orders="orders ?? []" />
  </div>
</template>

<script setup lang="ts">
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import WorkOrderManager from '@/components/business/WorkOrderManager.vue'
import type { WorkOrder } from '@/components/business/WorkOrderManager.vue'
import { useApiData } from '@/composables/useApiData'
import { getMockMaintenanceList } from '@/mocks/providers/energyStorage'
import { energyStorageApi } from '@/api/api'
import { energyStorageTabs } from '@/constants/navigation'

defineProps<{ embedded?: boolean }>()

const { data: orders } = useApiData<WorkOrder[]>(
  getMockMaintenanceList,
  () => energyStorageApi.getMaintenanceList().then(r => r.data as unknown as WorkOrder[])
)
</script>

<style scoped>
.maintenance-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
