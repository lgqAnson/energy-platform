/**
 * 设备树类型定义
 *
 * 定义能源管理平台的设备分类、站点、设备三层树形数据模型，
 * 以及表单模型、视图状态、节点选择等辅助类型。
 */

import type { LifecycleRecords } from '@/components/common/LifecycleManager.vue'

/** 设备大类 */
export type DeviceCategory = 'energy-storage' | 'solar' | 'charging' | 'commercial'
/** 光伏设备子类型 */
export type SolarDeviceType = 'inverter' | 'module'
/** 设备管理面板操作模式 */
export type DeviceManagerMode = 'create' | 'edit' | 'view'
/** 右侧详情面板类型 */
export type DeviceManagerPanel =
  | 'empty'
  | 'energyDevice'
  | 'energyStation'
  | 'solarStation'
  | 'solarInverter'
  | 'solarModule'

/** 上传图片元数据 */
export interface UploadedImage {
  name: string
  size: number
  type: string
  url: string
}

// ──────────────────────────────────────────────
// 表单模型（各类型设备的完整字段定义）
// ──────────────────────────────────────────────

/** 储能设备（储能柜）表单模型 */
export interface EnergyDeviceFormModel {
  cabinetCode: string
  cabinetType: string
  manufacturer: string
  factoryCode: string
  commissionDate: string
  dimensions: string
  protectionLevel: string
  anticorrosionLevel: string
  totalWeight: string
  ratedCapacity: string
  ratedVoltage: string
  cellType: string
  cellCount: string
  seriesParallelConfig: string
  energyEfficiency: string
  ratedPower: string
  ratedVoltage2: string
  powerFactor: string
  thd: string
  communicationInterface: string
  dcInterface: string
  highVoltageBoxPosition: string
  station?: string
  images?: UploadedImage[]
  image?: string
  lifecycle?: LifecycleRecords
}

/** 储能站点表单模型 */
export interface EnergyStationFormModel {
  filingNumber: string
  commissionDate: string
  dispatchCode: string
  warrantyPeriod: string
  stationType: string
  coordinates: string
  manufacturer: string
  address: string
  operationUnit: string
  ratedCapacity: string
  ratedPower: string
  duration: string
  peakShavingCapacity: string
  gridVoltage: string
  substation: string
  cabinetCode: string
  filingDate: string
  filingPerson: string
  gridDate: string
  commissionPerson: string
  changeType: string
  changeDetails: string
  changeImpact: string
  changePerson: string
  changeDate: string
  maintenanceStatus: string
  lastMaintenanceDate: string
  migrationCurrentStation: string
  migrationTargetStation: string
  migrationReason: string
  migrationPerson: string
  migrationDate: string
  retirementTriggerCondition: string
  retirementOperationYears: string
  retirementDestination: string
  retirementPerson: string
  retirementDate: string
  scrapPerson: string
  scrapDate: string
  uploadedFiles?: UploadedImage[]
  boundCabinets?: Array<{ id: string; name: string; code: string; status?: string }>
}

/** 光伏站点表单模型 */
export interface SolarStationFormModel {
  stationCode: string
  commissionDate: string
  stationName: string
  constructionScale: string
  stationType: string
  gridCapacity: string
  belongingGroup: string
  gridConnectionType: string
  operationUnit: string
  gridVoltageLevel: string
  address: string
  gridDate: string
  gridAgreement: string
  installedCapacity: string
  effectiveCapacity: string
  moduleCount: string
  overallEfficiency: string
  inverterCount: string
  inverterEfficiency: string
  uploadedFiles?: UploadedImage[]
  relatedInverters?: string[]
  relatedModules?: string[]
  lifecycle?: LifecycleRecords
}

/** 光伏逆变器表单模型 */
export interface SolarInverterFormModel {
  deviceCode: string
  stationName: string
  deviceName: string
  modelSpec: string
  deviceType: string
  commissionDate: string
  ratedPower: string
  powerFactorRange: string
  maxEfficiency: string
  thd: string
  maxInputCurrent: string
  protectionLevel: string
  ratedOutputVoltage: string
  coolingMethod: string
  ratedOutputFrequency: string
  communicationAddress: string
  gridNumber: string
  communicationProtocol: string
  gridTestDate: string
  images?: UploadedImage[]
  image?: string
  lifecycle?: LifecycleRecords
}

/** 光伏组件表单模型 */
export interface SolarModuleFormModel {
  moduleCode: string
  voltageTest: string
  moduleType: string
  dampHeatTest: string
  iecCertification: string
  mechanicalLoadTest: string
  commissionDate: string
  ratedPower: string
  weight: string
  openCircuitVoltage: string
  optimalVoltage: string
  shortCircuitCurrent: string
  optimalCurrent: string
  conversionEfficiency: string
  tempCoefficient: string
  dimensions: string
  images?: UploadedImage[]
  image?: string
  lifecycle?: LifecycleRecords
}

// ──────────────────────────────────────────────
// 设备树节点类型
// ──────────────────────────────────────────────

/** 设备树节点基础字段 */
export interface BaseDeviceNode {
  id: string
  name: string
  code: string
  status: string
  station?: string
  category: DeviceCategory
}

/** 储能设备叶子节点 */
export interface EnergyStorageDeviceNode extends BaseDeviceNode {
  category: 'energy-storage'
  type?: string
  detail: EnergyDeviceFormModel
}

/** 光伏逆变器叶子节点 */
export interface SolarInverterNode extends BaseDeviceNode {
  category: 'solar'
  solarType: 'inverter'
  detail: SolarInverterFormModel
}

/** 光伏组件叶子节点 */
export interface SolarModuleNode extends BaseDeviceNode {
  category: 'solar'
  solarType: 'module'
  detail: SolarModuleFormModel
}

/** 设备叶子节点联合类型 */
export type DeviceLeafNode = EnergyStorageDeviceNode | SolarInverterNode | SolarModuleNode

/** 站点中间节点 */
export interface DeviceStationNode {
  kind: 'station'
  id: string
  name: string
  expanded: boolean
  deletable: boolean
  addable: boolean
  addText: string
  categoryType: DeviceCategory
  detail: EnergyStationFormModel | SolarStationFormModel
  children: DeviceLeafNode[]
}

/** 分类根节点 */
export interface DeviceCategoryNode {
  kind: 'category'
  id: string
  name: string
  expanded: boolean
  addable: boolean
  addText: string
  categoryType: DeviceCategory
  children: DeviceStationNode[]
}

/** 设备树节点联合类型 */
export type DeviceTreeNode = DeviceCategoryNode | DeviceStationNode | DeviceLeafNode

// ──────────────────────────────────────────────
// 交互状态类型
// ──────────────────────────────────────────────

/** 当前选中节点定位信息 */
export interface DeviceNodeSelection {
  categoryIndex: number
  stationIndex?: number
  deviceIndex?: number
  nodeType: 'category' | 'station' | 'device'
  categoryType: DeviceCategory
  panel: DeviceManagerPanel
  deviceId?: string
}

/** 设备管理面板视图状态 */
export interface DeviceManagerViewState {
  mode: DeviceManagerMode
  panel: DeviceManagerPanel
  selectedNode: DeviceNodeSelection | null
}

// ──────────────────────────────────────────────
// 过滤后带原始索引的节点类型
// ──────────────────────────────────────────────

/** 过滤后的设备叶子节点（附加原始索引） */
export type FilteredDeviceLeafNode = DeviceLeafNode & {
  originalDeviceIndex: number
  /** 显式声明以辅助 vue-tsc 模板类型检查 */
  id: string
  name: string
}

/** 过滤后的站点节点（附加原始索引） */
export interface FilteredDeviceStationNode extends Omit<DeviceStationNode, 'children'> {
  originalStationIndex: number
  children: FilteredDeviceLeafNode[]
}

/** 过滤后的分类节点（附加原始索引） */
export interface FilteredDeviceCategoryNode extends Omit<DeviceCategoryNode, 'children'> {
  originalCategoryIndex: number
  children: FilteredDeviceStationNode[]
}
