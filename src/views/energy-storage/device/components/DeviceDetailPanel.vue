<template>
  <div
    class="flex-1 rounded-lg overflow-hidden relative"
    style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.06) 0%, rgba(85, 85, 85, 0.04) 100%);"
  >
    <DeviceForm
      v-if="panel === 'energyDevice'"
      :mode="mode"
      :device-data="formData"
      :saving="saving"
      @save="$emit('save', $event)"
      @cancel="$emit('cancel')"
      @edit="$emit('edit')"
    />

    <StationForm
      v-else-if="panel === 'energyStation'"
      :mode="mode"
      :device-data="formData"
      :saving="saving"
      @save="$emit('save', $event)"
      @cancel="$emit('cancel')"
      @edit="$emit('edit')"
    />

    <SolarStationForm
      v-else-if="panel === 'solarStation'"
      :mode="mode"
      :device-data="formData"
      :saving="saving"
      @save="$emit('save', $event)"
      @cancel="$emit('cancel')"
      @edit="$emit('edit')"
    />

    <SolarInverterForm
      v-else-if="panel === 'solarInverter'"
      :mode="mode"
      :device-data="formData"
      :saving="saving"
      @save="$emit('save', $event)"
      @cancel="$emit('cancel')"
      @edit="$emit('edit')"
    />

    <SolarModuleForm
      v-else-if="panel === 'solarModule'"
      :mode="mode"
      :device-data="formData"
      :saving="saving"
      @save="$emit('save', $event)"
      @cancel="$emit('cancel')"
      @edit="$emit('edit')"
    />

    <div v-else class="h-full">
      <EmptyState />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeviceForm from '../DeviceForm.vue'
import StationForm from '../StationForm.vue'
import SolarStationForm from '../SolarStationForm.vue'
import SolarInverterForm from '../SolarInverterForm.vue'
import SolarModuleForm from '../SolarModuleForm.vue'
import EmptyState from './EmptyState.vue'
import type { DeviceManagerMode, DeviceManagerPanel } from '../types'

defineProps<{
  panel: DeviceManagerPanel
  mode: DeviceManagerMode
  formData: unknown
  /** 保存操作进行中（由父组件 useDeviceManager 驱动） */
  saving?: boolean
}>()

defineEmits<{
  save: [data: unknown]
  cancel: []
  edit: []
}>()
</script>
