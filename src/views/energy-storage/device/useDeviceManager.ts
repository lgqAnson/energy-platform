import { computed, onMounted, ref } from 'vue'
import {
  createEnergyDeviceNode,
  createEnergyStationNode,
  createSolarInverterNode,
  createSolarModuleNode,
  createSolarStationNode,
  getPanelByNode,
  patchDeviceNode,
  patchStationNode,
  toEnergyDeviceFormModel,
  toEnergyStationFormModel,
  toSolarInverterFormModel,
  toSolarModuleFormModel,
  toSolarStationFormModel
} from './deviceAdapters'
import { deviceRepository } from './deviceRepository'
import { useDeviceRealtimeSync } from './useDeviceRealtimeSync'
import type {
  DeviceLeafNode,
  DeviceManagerMode,
  DeviceManagerPanel,
  DeviceManagerViewState,
  DeviceNodeSelection,
  DeviceStationNode,
  EnergyDeviceFormModel,
  EnergyStationFormModel,
  FilteredDeviceCategoryNode,
  FilteredDeviceLeafNode,
  FilteredDeviceStationNode,
  SolarInverterFormModel,
  SolarModuleFormModel,
  SolarStationFormModel
} from './types'

const statusFilters = [
  { value: '新建', key: 'created' },
  { value: '投运', key: 'commission' },
  { value: '变更', key: 'change' },
  { value: '迁移', key: 'migration' },
  { value: '检修', key: 'maintenance' },
  { value: '退役', key: 'retirement' },
  { value: '报废', key: 'scrap' }
] as const

const statusKeywords: Record<string, string[]> = {
  created: ['建档', '新建'],
  commission: ['投运', '运行中', '待机'],
  change: ['变更'],
  migration: ['迁移'],
  maintenance: ['检修', '维护'],
  retirement: ['退役'],
  scrap: ['报废']
}

type SavePayload =
  | EnergyDeviceFormModel
  | EnergyStationFormModel
  | SolarStationFormModel
  | SolarInverterFormModel
  | SolarModuleFormModel

export const useDeviceManager = () => {
  const deviceTree = ref<Awaited<ReturnType<typeof deviceRepository.loadTree>>>([])
  const searchKeyword = ref('')
  const selectedStatuses = ref<string[]>(statusFilters.map((item) => item.key))
  const viewState = ref<DeviceManagerViewState>({
    mode: 'view',
    panel: 'empty',
    selectedNode: null
  })

  onMounted(async () => {
    deviceTree.value = await deviceRepository.loadTree()
  })

  useDeviceRealtimeSync(() => deviceTree.value)

  const resetView = () => {
    viewState.value = {
      mode: 'view',
      panel: 'empty',
      selectedNode: null
    }
  }

  const currentStation = computed<DeviceStationNode | null>(() => {
    const selected = viewState.value.selectedNode
    if (!selected || selected.stationIndex === undefined) {
      return null
    }
    return deviceTree.value[selected.categoryIndex]?.children[selected.stationIndex] || null
  })

  const currentDevice = computed<DeviceLeafNode | null>(() => {
    const selected = viewState.value.selectedNode
    if (!selected || selected.stationIndex === undefined || selected.deviceIndex === undefined) {
      return null
    }
    return deviceTree.value[selected.categoryIndex]?.children[selected.stationIndex]?.children[selected.deviceIndex] || null
  })

  const currentFormData = computed(() => {
    const panel = viewState.value.panel
    if (panel === 'energyDevice' && currentDevice.value?.category === 'energy-storage') {
      return toEnergyDeviceFormModel(currentDevice.value)
    }
    if (panel === 'energyStation' && currentStation.value) {
      return toEnergyStationFormModel(currentStation.value)
    }
    if (panel === 'solarStation' && currentStation.value) {
      return toSolarStationFormModel(currentStation.value)
    }
    if (panel === 'solarInverter' && currentDevice.value?.category === 'solar' && currentDevice.value.solarType === 'inverter') {
      return toSolarInverterFormModel(currentDevice.value)
    }
    if (panel === 'solarModule' && currentDevice.value?.category === 'solar' && currentDevice.value.solarType === 'module') {
      return toSolarModuleFormModel(currentDevice.value)
    }
    return null
  })

  const filteredTree = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()

    const matchesStatus = (status: string) => {
      if (selectedStatuses.value.length === 0) {
        return true
      }
      const normalized = status.toLowerCase()
      return selectedStatuses.value.some((selected) =>
        (statusKeywords[selected] || [selected]).some((keyword) => normalized.includes(keyword.toLowerCase()))
      )
    }

    return deviceTree.value
      .map((category, originalCategoryIndex): FilteredDeviceCategoryNode | null => {
        const categoryMatched = keyword ? category.name.toLowerCase().includes(keyword) : true

        const stations = category.children
          .map((station, originalStationIndex): FilteredDeviceStationNode | null => {
            const stationMatched = keyword ? station.name.toLowerCase().includes(keyword) : true

            const devices = station.children
              .map((device, originalDeviceIndex): FilteredDeviceLeafNode | null => {
                const textMatched = keyword
                  ? [device.name, device.code, device.status].some((value) => value.toLowerCase().includes(keyword))
                  : true
                if (!textMatched || !matchesStatus(device.status)) {
                  return null
                }
                return {
                  ...device,
                  originalDeviceIndex
                }
              })
              .filter((device): device is FilteredDeviceLeafNode => device !== null)

            if (!stationMatched && devices.length === 0 && !categoryMatched) {
              return null
            }

            return {
              ...station,
              originalStationIndex,
              children: stationMatched || categoryMatched ? station.children.map((device, originalDeviceIndex) => ({
                ...device,
                originalDeviceIndex
              })) : devices
            }
          })
          .filter((station): station is FilteredDeviceStationNode => station !== null)

        if (!categoryMatched && stations.length === 0) {
          return null
        }

        return {
          ...category,
          originalCategoryIndex,
          children: categoryMatched ? category.children.map((station, originalStationIndex) => ({
            ...station,
            originalStationIndex,
            children: station.children.map((device, originalDeviceIndex) => ({
              ...device,
              originalDeviceIndex
            }))
          })) : stations
        }
      })
      .filter((category): category is FilteredDeviceCategoryNode => category !== null)
  })

  const setSelection = (selection: DeviceNodeSelection | null, mode: DeviceManagerMode = 'view') => {
    viewState.value = {
      mode,
      panel: selection?.panel || 'empty',
      selectedNode: selection
    }
  }

  const selectCategory = (categoryIndex: number) => {
    const category = deviceTree.value[categoryIndex]
    setSelection({
      categoryIndex,
      nodeType: 'category',
      categoryType: category.categoryType,
      panel: 'empty'
    })
  }

  const selectStation = (categoryIndex: number, stationIndex: number) => {
    const station = deviceTree.value[categoryIndex].children[stationIndex]
    setSelection({
      categoryIndex,
      stationIndex,
      nodeType: 'station',
      categoryType: station.categoryType,
      panel: getPanelByNode(station)
    })
  }

  const selectDevice = (categoryIndex: number, stationIndex: number, deviceIndex: number) => {
    const device = deviceTree.value[categoryIndex].children[stationIndex].children[deviceIndex]
    setSelection({
      categoryIndex,
      stationIndex,
      deviceIndex,
      nodeType: 'device',
      categoryType: device.category,
      panel: getPanelByNode(device),
      deviceId: device.id
    })
  }

  const startCreateStation = (categoryIndex: number) => {
    const category = deviceTree.value[categoryIndex]
    setSelection(
      {
        categoryIndex,
        nodeType: 'category',
        categoryType: category.categoryType,
        panel: category.categoryType === 'solar' ? 'solarStation' : 'energyStation'
      },
      'create'
    )
  }

  const startCreateDevice = (categoryIndex: number, stationIndex: number, panel: DeviceManagerPanel) => {
    const category = deviceTree.value[categoryIndex]
    setSelection(
      {
        categoryIndex,
        stationIndex,
        nodeType: 'station',
        categoryType: category.categoryType,
        panel
      },
      'create'
    )
  }

  const startEdit = () => {
    if (viewState.value.panel !== 'empty') {
      viewState.value.mode = 'edit'
    }
  }

  const cancelEdit = () => {
    if (!viewState.value.selectedNode && viewState.value.mode === 'create') {
      resetView()
      return
    }
    viewState.value.mode = 'view'
    if (viewState.value.panel === 'empty') {
      resetView()
    }
  }

  const saveCurrent = (payload: SavePayload) => {
    const selected = viewState.value.selectedNode
    if (!selected) {
      return
    }

    if (viewState.value.mode === 'create') {
      if (viewState.value.panel === 'energyStation') {
        const category = deviceTree.value[selected.categoryIndex]
        const station = createEnergyStationNode(payload as EnergyStationFormModel, category.id, category.children.length + 1)
        category.children.push(station)
        selectStation(selected.categoryIndex, category.children.length - 1)
        return
      }

      if (viewState.value.panel === 'solarStation') {
        const category = deviceTree.value[selected.categoryIndex]
        const station = createSolarStationNode(payload as SolarStationFormModel, category.id, category.children.length + 1)
        category.children.push(station)
        selectStation(selected.categoryIndex, category.children.length - 1)
        return
      }

      const station = currentStation.value
      if (!station) {
        return
      }

      if (viewState.value.panel === 'energyDevice') {
        const node = createEnergyDeviceNode(payload as EnergyDeviceFormModel, station, station.children.length + 1)
        station.children.push(node)
        selectDevice(selected.categoryIndex, selected.stationIndex!, station.children.length - 1)
        return
      }

      if (viewState.value.panel === 'solarInverter') {
        const node = createSolarInverterNode(payload as SolarInverterFormModel, station, station.children.length + 1)
        const insertIndex = Math.max(station.children.map((child) => child.category === 'solar' && child.solarType === 'inverter').lastIndexOf(true) + 1, 0)
        station.children.splice(insertIndex, 0, node)
        selectDevice(selected.categoryIndex, selected.stationIndex!, insertIndex)
        return
      }

      if (viewState.value.panel === 'solarModule') {
        const node = createSolarModuleNode(payload as SolarModuleFormModel, station, station.children.length + 1)
        station.children.push(node)
        selectDevice(selected.categoryIndex, selected.stationIndex!, station.children.length - 1)
      }
      return
    }

    if (selected.nodeType === 'station' && currentStation.value) {
      patchStationNode(currentStation.value, payload as EnergyStationFormModel | SolarStationFormModel)
      selectStation(selected.categoryIndex, selected.stationIndex!)
      return
    }

    if (selected.nodeType === 'device' && currentDevice.value) {
      patchDeviceNode(currentDevice.value, payload as EnergyDeviceFormModel | SolarInverterFormModel | SolarModuleFormModel)
      selectDevice(selected.categoryIndex, selected.stationIndex!, selected.deviceIndex!)
    }
  }

  const removeStation = (categoryIndex: number, stationIndex: number) => {
    deviceTree.value[categoryIndex].children.splice(stationIndex, 1)
    const selected = viewState.value.selectedNode
    if (selected?.categoryIndex === categoryIndex && selected.stationIndex === stationIndex) {
      resetView()
    }
  }

  const removeDevice = (categoryIndex: number, stationIndex: number, deviceIndex: number) => {
    const station = deviceTree.value[categoryIndex].children[stationIndex]
    const removed = station.children.splice(deviceIndex, 1)[0]
    const selected = viewState.value.selectedNode
    if (selected?.deviceId && removed && selected.deviceId === removed.id) {
      selectStation(categoryIndex, stationIndex)
    }
  }

  const toggleCategory = (categoryIndex: number) => {
    deviceTree.value[categoryIndex].expanded = !deviceTree.value[categoryIndex].expanded
  }

  const toggleStation = (categoryIndex: number, stationIndex: number) => {
    deviceTree.value[categoryIndex].children[stationIndex].expanded = !deviceTree.value[categoryIndex].children[stationIndex].expanded
  }

  return {
    deviceTree,
    filteredTree,
    searchKeyword,
    selectedStatuses,
    statusFilters,
    viewState,
    currentFormData,
    currentStation,
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
  }
}
