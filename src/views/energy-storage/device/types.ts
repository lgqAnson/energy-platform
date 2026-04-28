import type { LifecycleRecords } from '@/components/common/LifecycleManager.vue'

export type DeviceCategory = 'energy-storage' | 'solar' | 'charging' | 'commercial'
export type SolarDeviceType = 'inverter' | 'module'
export type DeviceManagerMode = 'create' | 'edit' | 'view'
export type DeviceManagerPanel =
  | 'empty'
  | 'energyDevice'
  | 'energyStation'
  | 'solarStation'
  | 'solarInverter'
  | 'solarModule'

export interface UploadedImage {
  name: string
  size: number
  type: string
  url: string
}

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

export interface BaseDeviceNode {
  id: string
  name: string
  code: string
  status: string
  station?: string
  category: DeviceCategory
}

export interface EnergyStorageDeviceNode extends BaseDeviceNode {
  category: 'energy-storage'
  type?: string
  detail: EnergyDeviceFormModel
}

export interface SolarInverterNode extends BaseDeviceNode {
  category: 'solar'
  solarType: 'inverter'
  detail: SolarInverterFormModel
}

export interface SolarModuleNode extends BaseDeviceNode {
  category: 'solar'
  solarType: 'module'
  detail: SolarModuleFormModel
}

export type DeviceLeafNode = EnergyStorageDeviceNode | SolarInverterNode | SolarModuleNode

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

export type DeviceTreeNode = DeviceCategoryNode | DeviceStationNode | DeviceLeafNode

export interface DeviceNodeSelection {
  categoryIndex: number
  stationIndex?: number
  deviceIndex?: number
  nodeType: 'category' | 'station' | 'device'
  categoryType: DeviceCategory
  panel: DeviceManagerPanel
  deviceId?: string
}

export interface DeviceTreeContext {
  categoryIndex: number
  stationIndex: number
}

export interface DeviceManagerViewState {
  mode: DeviceManagerMode
  panel: DeviceManagerPanel
  selectedNode: DeviceNodeSelection | null
}

export interface FilteredDeviceLeafNode extends DeviceLeafNode {
  originalDeviceIndex: number
}

export interface FilteredDeviceStationNode extends Omit<DeviceStationNode, 'children'> {
  originalStationIndex: number
  children: FilteredDeviceLeafNode[]
}

export interface FilteredDeviceCategoryNode extends Omit<DeviceCategoryNode, 'children'> {
  originalCategoryIndex: number
  children: FilteredDeviceStationNode[]
}
