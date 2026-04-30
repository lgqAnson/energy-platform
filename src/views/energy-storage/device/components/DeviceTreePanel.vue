<template>
  <div
    class="w-[300px] flex-shrink-0 rounded-lg overflow-hidden"
    style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.08) 0%, rgba(85, 85, 85, 0.05) 100%);"
  >
    <div class="px-4 py-3 border-b border-white/10">
      <h3 class="text-primary font-bold text-lg">设备列表</h3>
    </div>

    <div class="p-3 border-b border-white/10">
      <div class="flex gap-2">
        <input
          :value="searchKeyword"
          type="text"
          placeholder="请输入设备名称/编号"
          class="flex-1 px-3 py-1.5 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary"
          @input="$emit('update:searchKeyword', ($event.target as HTMLInputElement).value)"
        />
        <button
          class="px-4 py-1.5 text-sm bg-primary/30 hover:bg-primary/50 text-white rounded transition-colors"
        >
          查询
        </button>
      </div>
    </div>

    <div class="px-3 py-2 border-b border-white/10">
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <label
          v-for="status in statusFilters"
          :key="status.key"
          class="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white text-xs"
        >
          <input
            type="checkbox"
            :checked="selectedStatuses.includes(status.key)"
            class="w-3.5 h-3.5 rounded border-white/30 bg-white/10 text-primary focus:ring-primary"
            @change="toggleStatus(status.key)"
          />
          {{ status.value }}
        </label>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-2" style="max-height: calc(100% - 140px);">
      <div v-for="category in tree" :key="category.id" class="mb-2">
        <div class="flex items-center gap-1 py-1.5 cursor-pointer">
          <ChevronDown
            v-if="category.expanded"
            class="w-3.5 h-3.5 text-primary flex-shrink-0 cursor-pointer"
            @click.stop="$emit('toggle-category', category.originalCategoryIndex)"
          />
          <ChevronRight
            v-else
            class="w-3.5 h-3.5 text-white/50 flex-shrink-0 cursor-pointer"
            @click.stop="$emit('toggle-category', category.originalCategoryIndex)"
          />
          <span class="text-sm text-primary font-medium underline cursor-pointer" @click="$emit('select-category', category.originalCategoryIndex)">
            {{ category.name }}
          </span>
        </div>

        <div v-if="category.expanded" class="ml-4">
          <div v-for="station in category.children" :key="station.id" class="mb-1">
            <div class="flex items-center gap-1 py-1 cursor-pointer">
              <ChevronDown
                v-if="station.expanded"
                class="w-3 h-3 text-primary flex-shrink-0 cursor-pointer"
                @click.stop="$emit('toggle-station', category.originalCategoryIndex, station.originalStationIndex)"
              />
              <ChevronRight
                v-else
                class="w-3 h-3 text-white/50 flex-shrink-0 cursor-pointer"
                @click.stop="$emit('toggle-station', category.originalCategoryIndex, station.originalStationIndex)"
              />
              <span class="text-sm text-white/80 cursor-pointer" @click="$emit('select-station', category.originalCategoryIndex, station.originalStationIndex)">
                {{ station.name }}
              </span>
              <button
                v-if="station.deletable"
                class="ml-auto text-xs text-red-400 hover:text-red-300"
                @click.stop="$emit('delete-station', category.originalCategoryIndex, station.originalStationIndex)"
              >
                删除
              </button>
            </div>

            <div v-if="station.expanded" class="ml-4">
              <div
                v-for="device in station.children"
                :key="device.id"
                class="flex items-center py-1 px-2 cursor-pointer rounded hover:bg-white/10"
                :class="{ 'bg-primary/20': selectedDeviceId === device.id }"
                @click="$emit('select-device', category.originalCategoryIndex, station.originalStationIndex, device.originalDeviceIndex)"
              >
                <span class="text-sm text-white/70">{{ device.name }}</span>
                <button
                  class="ml-auto text-xs text-red-400 hover:text-red-300"
                  @click.stop="$emit('delete-device', category.originalCategoryIndex, station.originalStationIndex, device.originalDeviceIndex)"
                >
                  删除
                </button>
              </div>

              <template v-if="station.addable">
                <div
                  v-if="category.categoryType === 'solar'"
                  class="py-1 px-2 cursor-pointer text-xs text-green-400 hover:text-green-300"
                  @click="$emit('create-device', category.originalCategoryIndex, station.originalStationIndex, 'solarInverter')"
                >
                  +新增逆变器
                </div>
                <div
                  v-if="category.categoryType === 'solar'"
                  class="py-1 px-2 cursor-pointer text-xs text-green-400 hover:text-green-300"
                  @click="$emit('create-device', category.originalCategoryIndex, station.originalStationIndex, 'solarModule')"
                >
                  +新增光伏组件
                </div>
                <div
                  v-else
                  class="py-1 px-2 cursor-pointer text-xs text-green-400 hover:text-green-300"
                  @click="$emit('create-device', category.originalCategoryIndex, station.originalStationIndex, 'energyDevice')"
                >
                  +{{ station.addText }}
                </div>
              </template>
            </div>
          </div>

          <div
            v-if="category.addable"
            class="py-1 px-2 ml-4 cursor-pointer text-xs text-green-400 hover:text-green-300"
            @click="$emit('create-station', category.originalCategoryIndex)"
          >
            +{{ category.addText }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import type { DeviceManagerPanel, FilteredDeviceCategoryNode } from '../types'

interface StatusFilter {
  value: string
  key: string
}

const props = defineProps<{
  tree: FilteredDeviceCategoryNode[]
  searchKeyword: string
  selectedStatuses: string[]
  statusFilters: readonly StatusFilter[]
  selectedDeviceId?: string
}>()

const emit = defineEmits<{
  'update:searchKeyword': [value: string]
  'update:selectedStatuses': [value: string[]]
  'toggle-category': [categoryIndex: number]
  'toggle-station': [categoryIndex: number, stationIndex: number]
  'select-category': [categoryIndex: number]
  'select-station': [categoryIndex: number, stationIndex: number]
  'select-device': [categoryIndex: number, stationIndex: number, deviceIndex: number]
  'delete-station': [categoryIndex: number, stationIndex: number]
  'delete-device': [categoryIndex: number, stationIndex: number, deviceIndex: number]
  'create-station': [categoryIndex: number]
  'create-device': [categoryIndex: number, stationIndex: number, panel: DeviceManagerPanel]
}>()

/**
 * 切换设备状态筛选的选中/取消
 * @param status 状态标识
 */
const toggleStatus = (status: string) => {
  const next = props.selectedStatuses.includes(status)
    ? props.selectedStatuses.filter((item) => item !== status)
    : [...props.selectedStatuses, status]
  emit('update:selectedStatuses', next)
}
</script>
