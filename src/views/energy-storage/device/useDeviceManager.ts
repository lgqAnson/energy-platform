/**
 * 设备管理器 Composable
 *
 * 设备管理模块的核心状态管理，负责设备树的加载、搜索过滤、
 * 节点选择、CRUD 操作、表单数据转换以及视图模式切换。
 *
 * 设计要点：
 *  - 设备树为三层结构：分类（Category）→ 站点（Station）→ 设备（Device）
 *  - 支持五种设备/站点类型：储能设备、储能站点、光伏站点、光伏逆变器、光伏组件
 *  - 视图模式分为 view / edit / create 三种，通过 viewState 统一驱动
 *  - selectedNode 使用路径索引（categoryIndex / stationIndex / deviceIndex）定位
 */

import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getPanelByNode,
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

/** 生命周期状态筛选项：value 为显示文本，key 为内部标识 */
const statusFilters = [
  { value: '新建', key: 'created' },
  { value: '投运', key: 'commission' },
  { value: '变更', key: 'change' },
  { value: '迁移', key: 'migration' },
  { value: '检修', key: 'maintenance' },
  { value: '退役', key: 'retirement' },
  { value: '报废', key: 'scrap' }
] as const

/** 生命周期状态关键词匹配表，用于将筛选 key 映射到设备状态文本 */
const statusKeywords: Record<string, string[]> = {
  created: ['建档', '新建'],
  commission: ['投运', '运行中', '待机'],
  change: ['变更'],
  migration: ['迁移'],
  maintenance: ['检修', '维护'],
  retirement: ['退役'],
  scrap: ['报废']
}

/** 表单保存数据的联合类型 */
type SavePayload =
  | EnergyDeviceFormModel
  | EnergyStationFormModel
  | SolarStationFormModel
  | SolarInverterFormModel
  | SolarModuleFormModel

/**
 * 设备管理器 Composable
 *
 * @returns 设备树、过滤树、搜索/筛选状态、视图状态、
 *          当前节点/表单数据 computed、以及完整的 CRUD 操作方法集合
 */
export const useDeviceManager = () => {
  /** 完整的设备分类树 */
  const deviceTree = ref<Awaited<ReturnType<typeof deviceRepository.loadTree>>>([])
  /** 搜索关键词 */
  const searchKeyword = ref('')
  /** 已选中的生命周期状态筛选项 key 列表 */
  const selectedStatuses = ref<string[]>(statusFilters.map((item) => item.key))
  /** 当前视图状态（模式、面板、选中节点） */
  const viewState = ref<DeviceManagerViewState>({
    mode: 'view',
    panel: 'empty',
    selectedNode: null
  })
  /** 保存操作进行中 */
  const saving = ref(false)
  /** 删除操作进行中 */
  const deleting = ref(false)
  /** 设备树加载中 */
  const treeLoading = ref(false)

  onMounted(async () => {
    treeLoading.value = true
    try {
      deviceTree.value = await deviceRepository.loadTree()
    } catch {
      ElMessage.error('加载设备树失败')
    } finally {
      treeLoading.value = false
    }
  })

  // 订阅 WebSocket 实时更新设备状态
  useDeviceRealtimeSync(() => deviceTree.value)

  /** 重置视图状态至初始空面板 */
  const resetView = () => {
    viewState.value = {
      mode: 'view',
      panel: 'empty',
      selectedNode: null
    }
  }

  /** 当前选中的站点节点（用于详情面板渲染） */
  const currentStation = computed<DeviceStationNode | null>(() => {
    const selected = viewState.value.selectedNode
    if (!selected || selected.stationIndex === undefined) {
      return null
    }
    return deviceTree.value[selected.categoryIndex]?.children[selected.stationIndex] || null
  })

  /** 当前选中的设备叶子节点（用于详情面板渲染） */
  const currentDevice = computed<DeviceLeafNode | null>(() => {
    const selected = viewState.value.selectedNode
    if (!selected || selected.stationIndex === undefined || selected.deviceIndex === undefined) {
      return null
    }
    return deviceTree.value[selected.categoryIndex]?.children[selected.stationIndex]?.children[selected.deviceIndex] || null
  })

  /**
   * 当前面板所需的表单数据
   * 根据面板类型和当前选中节点，自动转换为对应的表单模型
   */
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

  /**
   * 过滤后的设备树
   *
   * 根据搜索关键词和生命周期状态筛选条件，
   * 对完整设备树进行递归过滤，保留匹配的分类、站点和设备节点。
   * 过滤后的节点附带 originalIndex 字段用于后续的增删操作定位。
   */
  const filteredTree = computed(() => {
    const keyword = searchKeyword.value.trim().toLowerCase()

    /** 判断设备状态是否匹配任一选中筛选项 */
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

  /**
   * 设置当前选中节点并切换视图模式
   * @param selection 节点选择信息，null 表示清空选择
   * @param mode      视图模式，默认为 'view'
   */
  const setSelection = (selection: DeviceNodeSelection | null, mode: DeviceManagerMode = 'view') => {
    viewState.value = {
      mode,
      panel: selection?.panel || 'empty',
      selectedNode: selection
    }
  }

  /** 选中分类节点 */
  const selectCategory = (categoryIndex: number) => {
    const category = deviceTree.value[categoryIndex]
    setSelection({
      categoryIndex,
      nodeType: 'category',
      categoryType: category.categoryType,
      panel: 'empty'
    })
  }

  /** 选中站点节点，自动打开对应的详情面板 */
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

  /** 选中设备叶子节点，自动打开对应的详情面板 */
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

  /**
   * 进入「新建站点」模式
   * 根据分类的类型自动确定是储能站点还是光伏站点面板
   */
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

  /**
   * 进入「新建设备」模式
   * @param panel 指定的设备面板类型
   */
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

  /** 从 view 模式切换至 edit 模式 */
  const startEdit = () => {
    if (viewState.value.panel !== 'empty') {
      viewState.value.mode = 'edit'
    }
  }

  /**
   * 取消编辑 / 取消新建
   *
   * edit 模式 → 退回 view 模式
   * create 模式 → 若无选中节点则重置为空面板，否则退回 view 并清空面板
   */
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

  /**
   * 保存当前表单数据（异步 API 调用）
   *
   * 根据当前模式（create / edit）和面板类型调用仓库方法：
   *  - create：调用 deviceRepository.createStation / createDevice → 插入本地树
   *  - edit：调用 deviceRepository.updateStation / updateDevice → 替换本地节点
   *
   * Mock 模式与 API 模式使用相同的仓库接口，行为由环境变量控制。
   *
   * @param payload 表单提交数据
   */
  const saveCurrent = async (payload: SavePayload) => {
    const selected = viewState.value.selectedNode
    if (!selected || saving.value) {
      return
    }

    saving.value = true
    try {
      if (viewState.value.mode === 'create') {
        // ----- 创建站点 -----
        if (viewState.value.panel === 'energyStation') {
          const category = deviceTree.value[selected.categoryIndex]
          const station = await deviceRepository.createStation(category.id, payload as EnergyStationFormModel)
          category.children.push(station)
          selectStation(selected.categoryIndex, category.children.length - 1)
          return
        }

        if (viewState.value.panel === 'solarStation') {
          const category = deviceTree.value[selected.categoryIndex]
          const station = await deviceRepository.createStation(category.id, payload as SolarStationFormModel)
          category.children.push(station)
          selectStation(selected.categoryIndex, category.children.length - 1)
          return
        }

        // ----- 创建设备 -----
        const station = currentStation.value
        if (!station) {
          return
        }

        if (viewState.value.panel === 'energyDevice') {
          const node = await deviceRepository.createDevice(station.id, payload as EnergyDeviceFormModel)
          station.children.push(node)
          selectDevice(selected.categoryIndex, selected.stationIndex!, station.children.length - 1)
          return
        }

        if (viewState.value.panel === 'solarInverter') {
          const node = await deviceRepository.createDevice(station.id, payload as SolarInverterFormModel)
          // 将逆变器插入到同类设备组的末尾
          const insertIndex = Math.max(station.children.map((child) => child.category === 'solar' && child.solarType === 'inverter').lastIndexOf(true) + 1, 0)
          station.children.splice(insertIndex, 0, node)
          selectDevice(selected.categoryIndex, selected.stationIndex!, insertIndex)
          return
        }

        if (viewState.value.panel === 'solarModule') {
          const node = await deviceRepository.createDevice(station.id, payload as SolarModuleFormModel)
          station.children.push(node)
          selectDevice(selected.categoryIndex, selected.stationIndex!, station.children.length - 1)
        }
        return
      }

      // ----- edit 模式：更新节点 -----
      if (selected.nodeType === 'station' && currentStation.value) {
        const updated = await deviceRepository.updateStation(currentStation.value.id, payload as EnergyStationFormModel | SolarStationFormModel)
        // 用后端返回的节点替换本地节点
        deviceTree.value[selected.categoryIndex].children.splice(selected.stationIndex!, 1, updated)
        selectStation(selected.categoryIndex, selected.stationIndex!)
        return
      }

      if (selected.nodeType === 'device' && currentDevice.value) {
        const updated = await deviceRepository.updateDevice(currentDevice.value.id, payload as EnergyDeviceFormModel | SolarInverterFormModel | SolarModuleFormModel)
        deviceTree.value[selected.categoryIndex].children[selected.stationIndex!].children.splice(selected.deviceIndex!, 1, updated)
        selectDevice(selected.categoryIndex, selected.stationIndex!, selected.deviceIndex!)
      }
    } catch {
      ElMessage.error('保存失败，请稍后重试')
    } finally {
      saving.value = false
    }
  }

  /**
   * 删除指定站点及其子设备（异步 API 调用）
   * 若当前选中的正是被删除节点，则重置视图
   */
  const removeStation = async (categoryIndex: number, stationIndex: number) => {
    if (deleting.value) {
      return
    }
    const station = deviceTree.value[categoryIndex]?.children[stationIndex]
    if (!station) {
      return
    }

    deleting.value = true
    try {
      await deviceRepository.deleteStation(station.id)
      deviceTree.value[categoryIndex].children.splice(stationIndex, 1)
      const selected = viewState.value.selectedNode
      if (selected?.categoryIndex === categoryIndex && selected.stationIndex === stationIndex) {
        resetView()
      }
    } catch {
      ElMessage.error('删除站点失败')
    } finally {
      deleting.value = false
    }
  }

  /**
   * 删除指定设备（异步 API 调用）
   * 若当前选中的正是被删除设备，则回退至站点详情面板
   */
  const removeDevice = async (categoryIndex: number, stationIndex: number, deviceIndex: number) => {
    if (deleting.value) {
      return
    }
    const station = deviceTree.value[categoryIndex]?.children[stationIndex]
    const device = station?.children[deviceIndex]
    if (!device) {
      return
    }

    deleting.value = true
    try {
      await deviceRepository.deleteDevice(device.id)
      const removed = station.children.splice(deviceIndex, 1)[0]
      const selected = viewState.value.selectedNode
      if (selected?.deviceId && removed && selected.deviceId === removed.id) {
        selectStation(categoryIndex, stationIndex)
      }
    } catch {
      ElMessage.error('删除设备失败')
    } finally {
      deleting.value = false
    }
  }

  /** 切换分类节点的展开/折叠状态 */
  const toggleCategory = (categoryIndex: number) => {
    deviceTree.value[categoryIndex].expanded = !deviceTree.value[categoryIndex].expanded
  }

  /** 切换站点节点的展开/折叠状态 */
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
  }
}
