/**
 * 设备数据适配器
 *
 * 提供树节点 ↔ 表单模型的双向转换、节点工厂函数、
 * 以及根据节点类型确定详情面板的映射逻辑。
 */

import type {
  DeviceLeafNode,
  DeviceManagerPanel,
  DeviceStationNode,
  EnergyDeviceFormModel,
  EnergyStorageDeviceNode,
  EnergyStationFormModel,
  SolarInverterFormModel,
  SolarInverterNode,
  SolarModuleFormModel,
  SolarModuleNode,
  SolarStationFormModel,
  UploadedImage
} from './types'

/**
 * 将储能设备叶子节点转换为表单模型
 * @param node 储能设备节点
 * @returns 扁平化表单模型
 */
export const toEnergyDeviceFormModel = (node: EnergyStorageDeviceNode): EnergyDeviceFormModel => ({
  ...node.detail,
  cabinetCode: node.detail.cabinetCode || node.name,
  factoryCode: node.detail.factoryCode || node.code,
  cabinetType: node.detail.cabinetType || node.type || '储能柜',
  station: node.detail.station || node.station
})

/**
 * 将储能站点节点转换为表单模型
 * @param node 站点节点
 * @returns 扁平化表单模型
 */
export const toEnergyStationFormModel = (node: DeviceStationNode): EnergyStationFormModel => {
  const detail = node.detail as EnergyStationFormModel
  return {
    ...detail,
    dispatchCode: detail.dispatchCode || node.name
  }
}

/**
 * 将光伏站点节点转换为表单模型
 * 自动从子节点中提取关联的逆变器与组件名称列表
 * @param node 光伏站点节点
 * @returns 包含关联设备信息的表单模型
 */
export const toSolarStationFormModel = (node: DeviceStationNode): SolarStationFormModel => {
  const detail = node.detail as SolarStationFormModel
  const relatedInverters = node.children
    .filter((child) => child.category === 'solar' && child.solarType === 'inverter')
    .map((child) => child.name)
  const relatedModules = node.children
    .filter((child) => child.category === 'solar' && child.solarType === 'module')
    .map((child) => child.name)

  return {
    ...detail,
    stationName: detail.stationName || node.name,
    relatedInverters,
    relatedModules,
    inverterCount: detail.inverterCount || String(relatedInverters.length || ''),
    moduleCount: detail.moduleCount || String(relatedModules.length || '')
  }
}

/**
 * 将光伏逆变器叶子节点转换为表单模型
 * @param node 逆变器节点
 * @returns 扁平化表单模型
 */
export const toSolarInverterFormModel = (node: SolarInverterNode): SolarInverterFormModel => ({
  ...node.detail,
  deviceName: node.detail.deviceName || node.name,
  deviceCode: node.detail.deviceCode || node.code,
  stationName: node.detail.stationName || node.station || ''
})

/**
 * 将光伏组件叶子节点转换为表单模型
 * @param node 组件节点
 * @returns 扁平化表单模型
 */
export const toSolarModuleFormModel = (node: SolarModuleNode): SolarModuleFormModel => ({
  ...node.detail,
  moduleCode: node.detail.moduleCode || node.code
})

/** 从表单数据中提取已上传图片列表 */
const getUploadedImages = (data: { images?: UploadedImage[]; uploadedFiles?: UploadedImage[] }) =>
  data.images || data.uploadedFiles || []

/**
 * 创建储能设备叶子节点
 * @param data    表单数据
 * @param station 所属站点节点
 * @param index   设备序号
 * @returns 新的储能设备节点
 */
export const createEnergyDeviceNode = (
  data: EnergyDeviceFormModel,
  station: DeviceStationNode,
  index: number
): EnergyStorageDeviceNode => ({
  id: `${station.id}-energy-device-${index}`,
  name: data.cabinetCode || `储能柜${index}`,
  code: (data.factoryCode || data.cabinetCode || `ENERGY-${index}`).toUpperCase(),
  status: '建档',
  type: data.cabinetType || '储能柜',
  station: station.name,
  category: 'energy-storage',
  detail: {
    ...data,
    station: station.name,
    images: getUploadedImages(data)
  }
})

/**
 * 创建储能站点节点
 * @param data       表单数据
 * @param categoryId 所属分类 ID
 * @param index      站点序号
 * @returns 新的储能站点节点
 */
export const createEnergyStationNode = (
  data: EnergyStationFormModel,
  categoryId: string,
  index: number
): DeviceStationNode => ({
  kind: 'station',
  id: `${categoryId}-station-${index}`,
  name: data.dispatchCode || `新站点${index}`,
  expanded: true,
  deletable: true,
  addable: true,
  addText: '新增设备',
  categoryType: 'energy-storage',
  detail: {
    ...data,
    uploadedFiles: data.uploadedFiles || [],
    boundCabinets: data.boundCabinets || []
  },
  children: []
})

/**
 * 创建光伏站点节点
 * @param data       表单数据
 * @param categoryId 所属分类 ID
 * @param index      站点序号
 * @returns 新的光伏站点节点
 */
export const createSolarStationNode = (
  data: SolarStationFormModel,
  categoryId: string,
  index: number
): DeviceStationNode => ({
  kind: 'station',
  id: `${categoryId}-station-${index}`,
  name: data.stationName || `光伏站点${index}`,
  expanded: true,
  deletable: true,
  addable: true,
  addText: '新增设备',
  categoryType: 'solar',
  detail: {
    ...data,
    uploadedFiles: data.uploadedFiles || [],
    relatedInverters: data.relatedInverters || [],
    relatedModules: data.relatedModules || []
  },
  children: []
})

/**
 * 创建光伏逆变器叶子节点
 * @param data    表单数据
 * @param station 所属站点节点
 * @param index   设备序号
 * @returns 新的逆变器节点
 */
export const createSolarInverterNode = (
  data: SolarInverterFormModel,
  station: DeviceStationNode,
  index: number
): SolarInverterNode => ({
  id: `${station.id}-inverter-${index}`,
  name: data.deviceName || `逆变器#${index}`,
  code: data.deviceCode || `INV-${index}`,
  status: '建档',
  category: 'solar',
  solarType: 'inverter',
  station: station.name,
  detail: {
    ...data,
    stationName: station.name,
    images: getUploadedImages(data)
  }
})

/**
 * 创建光伏组件叶子节点
 * @param data    表单数据
 * @param station 所属站点节点
 * @param index   设备序号
 * @returns 新的组件节点
 */
export const createSolarModuleNode = (
  data: SolarModuleFormModel,
  station: DeviceStationNode,
  index: number
): SolarModuleNode => ({
  id: `${station.id}-module-${index}`,
  name: data.moduleCode || `光伏组件#${index}`,
  code: data.moduleCode || `MOD-${index}`,
  status: '建档',
  category: 'solar',
  solarType: 'module',
  station: station.name,
  detail: {
    ...data,
    images: getUploadedImages(data)
  }
})

/**
 * 将表单数据写回设备叶子节点（原地修改）
 * 根据节点分类自动选择对应的字段映射逻辑
 * @param node 目标设备节点
 * @param data 表单提交数据
 */
export const patchDeviceNode = (node: DeviceLeafNode, data: EnergyDeviceFormModel | SolarInverterFormModel | SolarModuleFormModel) => {
  if (node.category === 'energy-storage') {
    const detail = data as EnergyDeviceFormModel
    node.name = detail.cabinetCode || node.name
    node.code = (detail.factoryCode || node.code).toUpperCase()
    node.status = detail.lifecycle?.currentStage || node.status
    node.type = detail.cabinetType || node.type
    node.detail = {
      ...node.detail,
      ...detail,
      station: detail.station || node.station,
      images: getUploadedImages(detail)
    }
    return
  }

  if (node.solarType === 'inverter') {
    const detail = data as SolarInverterFormModel
    node.name = detail.deviceName || node.name
    node.code = detail.deviceCode || node.code
    node.detail = {
      ...node.detail,
      ...detail,
      stationName: detail.stationName || node.station || '',
      images: getUploadedImages(detail)
    }
    return
  }

  const detail = data as SolarModuleFormModel
  node.name = detail.moduleCode || node.name
  node.code = detail.moduleCode || node.code
  node.detail = {
    ...node.detail,
    ...detail,
    images: getUploadedImages(detail)
  }
}

/**
 * 将表单数据写回站点节点（原地修改）
 * @param node 目标站点节点
 * @param data 表单提交数据
 */
export const patchStationNode = (
  node: DeviceStationNode,
  data: EnergyStationFormModel | SolarStationFormModel
) => {
  if (node.categoryType === 'solar') {
    const detail = data as SolarStationFormModel
    node.name = detail.stationName || node.name
    node.detail = {
      ...node.detail,
      ...detail
    }
    return
  }

  const detail = data as EnergyStationFormModel
  node.name = detail.dispatchCode || node.name
  node.detail = {
    ...node.detail,
    ...detail
  }
}

/**
 * 根据节点类型返回对应的详情面板标识
 * @param node 站点节点或设备叶子节点
 * @returns 面板标识
 */
export const getPanelByNode = (node: DeviceStationNode | DeviceLeafNode): DeviceManagerPanel => {
  if ('kind' in node) {
    return node.categoryType === 'solar' ? 'solarStation' : 'energyStation'
  }
  if (node.category === 'energy-storage') {
    return 'energyDevice'
  }
  return node.solarType === 'inverter' ? 'solarInverter' : 'solarModule'
}
