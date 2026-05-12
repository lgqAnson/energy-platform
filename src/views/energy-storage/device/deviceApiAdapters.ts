/**
 * 设备管理 API 适配器
 *
 * 负责后端 DTO 类型 ↔ 前端树节点类型的双向转换。
 * 后端返回扁平 DTO 结构，前端使用三层嵌套树结构（分类→站点→设备），
 * 本文件提供 convert* 函数完成转换。
 */

import type {
  DeviceTreeResponse,
  DeviceCategoryDto,
  DeviceStationDto,
  DeviceDto
} from './deviceApiTypes'
import type {
  DeviceCategoryNode,
  DeviceStationNode,
  DeviceLeafNode,
  EnergyStorageDeviceNode,
  SolarInverterNode,
  SolarModuleNode,
  EnergyStationFormModel,
  SolarStationFormModel
} from './types'

/**
 * 将后端设备树响应转换为前端分类节点数组
 *
 * 为每个分类/站点/设备节点补充 UI 状态默认值：
 *  - expanded: 第一个分类默认展开，其余折叠
 *  - deletable: 站点节点允许删除（分类节点不支持删除）
 *  - addable: 有子节点的分类允许新增站点，有分类类型的站点允许新建设备
 *  - addText: 根据分类类型自动设置
 *
 * @param response 后端设备树 API 响应
 * @returns 前端设备分类节点数组
 */
export const convertDeviceTreeResponse = (response: DeviceTreeResponse): DeviceCategoryNode[] => {
  return response.categories.map((catDto, catIndex) => convertCategoryDto(catDto, catIndex === 0))
}

/**
 * 将单个设备分类 DTO 转换为前端分类节点
 *
 * @param dto        后端分类 DTO
 * @param isExpanded 是否默认展开（第一个分类为 true）
 * @returns 前端分类节点
 */
const convertCategoryDto = (dto: DeviceCategoryDto, isExpanded: boolean): DeviceCategoryNode => {
  /** 根据分类类型确定新增按钮文案 */
  const addText = dto.categoryType === 'solar' ? '新增站点' : '新增设备'
  /** 是否有子站点（非叶子分类） */
  const hasStations = dto.stations.length > 0

  return {
    kind: 'category',
    id: dto.id,
    name: dto.name,
    expanded: isExpanded,
    addable: hasStations,
    addText,
    categoryType: dto.categoryType,
    children: dto.stations.map((stationDto) => convertStationDto(stationDto, true))
  }
}

/**
 * 将站点 DTO 转换为前端站点节点
 *
 * @param dto        后端站点 DTO
 * @param isExpanded 是否默认展开
 * @returns 前端站点节点
 */
const convertStationDto = (dto: DeviceStationDto, isExpanded: boolean): DeviceStationNode => {
  return {
    kind: 'station',
    id: dto.id,
    name: dto.name,
    expanded: isExpanded,
    deletable: true,
    addable: true,
    addText: dto.categoryType === 'solar' ? '新增设备' : '新增设备',
    categoryType: dto.categoryType,
    detail: dto.categoryType === 'energy-storage'
      ? (dto.detail as unknown as EnergyStationFormModel)
      : (dto.detail as unknown as SolarStationFormModel),
    children: dto.devices.map((deviceDto) => convertDeviceDtoToLeafNode(deviceDto))
  }
}

/**
 * 将设备 DTO 转换为前端设备叶子节点
 *
 * 根据设备的 category 和 type 字段自动判断节点类型：
 *  - category='energy-storage' → EnergyStorageDeviceNode
 *  - category='solar' + type='inverter' → SolarInverterNode
 *  - category='solar' + type='module' → SolarModuleNode
 *
 * @param dto 后端设备 DTO
 * @returns 前端设备叶子节点
 */
export const convertDeviceDtoToLeafNode = (dto: DeviceDto): DeviceLeafNode => {
  if (dto.category === 'energy-storage') {
    const node: EnergyStorageDeviceNode = {
      id: dto.id,
      name: dto.name,
      code: dto.code,
      status: dto.status,
      type: dto.type || '储能柜',
      station: dto.station,
      category: 'energy-storage',
      detail: dto.detail as unknown as EnergyStorageDeviceNode['detail']
    }
    return node
  }

  if (dto.type === 'inverter') {
    const node: SolarInverterNode = {
      id: dto.id,
      name: dto.name,
      code: dto.code,
      status: dto.status,
      category: 'solar',
      solarType: 'inverter',
      station: dto.station,
      detail: dto.detail as unknown as SolarInverterNode['detail']
    }
    return node
  }

  const node: SolarModuleNode = {
    id: dto.id,
    name: dto.name,
    code: dto.code,
    status: dto.status,
    category: 'solar',
    solarType: 'module',
    station: dto.station,
    detail: dto.detail as unknown as SolarModuleNode['detail']
  }
  return node
}

/**
 * 将站点 DTO 转换为前端站点节点（公开导出，供 deviceRepository API 实现使用）
 *
 * @param dto 后端站点 DTO
 * @returns 前端站点节点（默认展开）
 */
export const convertStationDtoToStationNode = (dto: DeviceStationDto): DeviceStationNode =>
  convertStationDto(dto, true)
