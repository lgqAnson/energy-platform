import type {
  DeviceCategoryNode,
  DeviceStationNode,
  EnergyDeviceFormModel,
  EnergyStationFormModel,
  LifecycleRecords,
  SolarInverterFormModel,
  SolarModuleFormModel,
  SolarStationFormModel
} from './types'

const createEmptyLifecycle = (): LifecycleRecords => ({
  currentStage: '',
  filing: { completed: false, date: '', person: '' },
  commission: { completed: false, date: '', person: '', gridDate: '', commissionDate: '' },
  changes: [],
  migration: { completed: false, date: '', person: '', currentStation: '', targetStation: '', reason: '' },
  maintenance: { completed: false, date: '', person: '', type: '', content: '', items: [] },
  retirement: { completed: false, date: '', person: '', triggerCondition: '', operationYears: '', destination: '' },
  scrap: { completed: false, date: '', person: '' }
})

const createEnergyDeviceDetail = (overrides: Partial<EnergyDeviceFormModel> = {}): EnergyDeviceFormModel => ({
  cabinetCode: '',
  cabinetType: '储能柜',
  manufacturer: '',
  factoryCode: '',
  commissionDate: '',
  dimensions: '',
  protectionLevel: '',
  anticorrosionLevel: '',
  totalWeight: '',
  ratedCapacity: '',
  ratedVoltage: '',
  cellType: '',
  cellCount: '',
  seriesParallelConfig: '',
  energyEfficiency: '',
  ratedPower: '',
  ratedVoltage2: '',
  powerFactor: '',
  thd: '',
  communicationInterface: '',
  dcInterface: '',
  highVoltageBoxPosition: '',
  images: [],
  lifecycle: createEmptyLifecycle(),
  ...overrides
})

const createEnergyStationDetail = (overrides: Partial<EnergyStationFormModel> = {}): EnergyStationFormModel => ({
  filingNumber: '',
  commissionDate: '',
  dispatchCode: '',
  warrantyPeriod: '',
  stationType: '35kV',
  coordinates: '',
  manufacturer: '',
  address: '',
  operationUnit: '',
  ratedCapacity: '',
  ratedPower: '',
  duration: '',
  peakShavingCapacity: '',
  gridVoltage: '',
  substation: '',
  cabinetCode: '',
  filingDate: '',
  filingPerson: '',
  gridDate: '',
  commissionPerson: '',
  changeType: '',
  changeDetails: '',
  changeImpact: '',
  changePerson: '',
  changeDate: '',
  maintenanceStatus: '',
  lastMaintenanceDate: '',
  migrationCurrentStation: '',
  migrationTargetStation: '',
  migrationReason: '',
  migrationPerson: '',
  migrationDate: '',
  retirementTriggerCondition: '',
  retirementOperationYears: '',
  retirementDestination: '',
  retirementPerson: '',
  retirementDate: '',
  scrapPerson: '',
  scrapDate: '',
  uploadedFiles: [],
  boundCabinets: [],
  ...overrides
})

const createSolarStationDetail = (overrides: Partial<SolarStationFormModel> = {}): SolarStationFormModel => ({
  stationCode: '',
  commissionDate: '',
  stationName: '',
  constructionScale: '',
  stationType: '',
  gridCapacity: '',
  belongingGroup: '',
  gridConnectionType: '',
  operationUnit: '',
  gridVoltageLevel: '',
  address: '',
  gridDate: '',
  gridAgreement: '',
  installedCapacity: '',
  effectiveCapacity: '',
  moduleCount: '',
  overallEfficiency: '',
  inverterCount: '',
  inverterEfficiency: '',
  uploadedFiles: [],
  relatedInverters: [],
  relatedModules: [],
  lifecycle: createEmptyLifecycle(),
  ...overrides
})

const createSolarInverterDetail = (overrides: Partial<SolarInverterFormModel> = {}): SolarInverterFormModel => ({
  deviceCode: '',
  stationName: '',
  deviceName: '',
  modelSpec: '',
  deviceType: '',
  commissionDate: '',
  ratedPower: '',
  powerFactorRange: '',
  maxEfficiency: '',
  thd: '',
  maxInputCurrent: '',
  protectionLevel: '',
  ratedOutputVoltage: '',
  coolingMethod: '',
  ratedOutputFrequency: '',
  communicationAddress: '',
  gridNumber: '',
  communicationProtocol: '',
  gridTestDate: '',
  images: [],
  lifecycle: createEmptyLifecycle(),
  ...overrides
})

const createSolarModuleDetail = (overrides: Partial<SolarModuleFormModel> = {}): SolarModuleFormModel => ({
  moduleCode: '',
  voltageTest: '',
  moduleType: '',
  dampHeatTest: '',
  iecCertification: '',
  mechanicalLoadTest: '',
  commissionDate: '',
  ratedPower: '',
  weight: '',
  openCircuitVoltage: '',
  optimalVoltage: '',
  shortCircuitCurrent: '',
  optimalCurrent: '',
  conversionEfficiency: '',
  tempCoefficient: '',
  dimensions: '',
  images: [],
  lifecycle: createEmptyLifecycle(),
  ...overrides
})

const createEnergyStation = (): DeviceStationNode => ({
  kind: 'station',
  id: 'energy-station-a',
  name: '储能站点A',
  expanded: true,
  deletable: true,
  addable: true,
  addText: '新增设备',
  categoryType: 'energy-storage',
  detail: createEnergyStationDetail({
    dispatchCode: '储能站点A',
    stationType: '35kV',
    ratedCapacity: '10',
    ratedPower: '5',
    operationUnit: '平台运维部'
  }),
  children: [
    {
      id: 'ess-a-1',
      name: '储能柜01',
      code: 'ESS-A-01',
      status: '运行中',
      type: '储能柜',
      station: '储能站点A',
      category: 'energy-storage',
      detail: createEnergyDeviceDetail({
        cabinetCode: '储能柜01',
        factoryCode: 'ESS-A-01',
        cabinetType: '储能柜',
        station: '储能站点A',
        ratedCapacity: '2.5'
      })
    },
    {
      id: 'ess-a-2',
      name: '储能柜02',
      code: 'ESS-A-02',
      status: '待机',
      type: '储能柜',
      station: '储能站点A',
      category: 'energy-storage',
      detail: createEnergyDeviceDetail({
        cabinetCode: '储能柜02',
        factoryCode: 'ESS-A-02',
        cabinetType: '储能柜',
        station: '储能站点A',
        ratedCapacity: '2.5'
      })
    }
  ]
})

const createSolarStation = (): DeviceStationNode => ({
  kind: 'station',
  id: 'solar-station-g5',
  name: '光伏站点-G5',
  expanded: true,
  deletable: true,
  addable: true,
  addText: '新增设备',
  categoryType: 'solar',
  detail: createSolarStationDetail({
    stationCode: 'SOL-G5',
    stationName: '光伏站点-G5',
    installedCapacity: '50000',
    gridCapacity: '50000',
    moduleCount: '1200',
    inverterCount: '10',
    relatedInverters: ['逆变器#1'],
    relatedModules: ['光伏组件#1']
  }),
  children: [
    {
      id: 'solar-g5-inv1',
      name: '逆变器#1',
      code: 'INV-G5-01',
      status: '运行中',
      category: 'solar',
      solarType: 'inverter',
      station: '光伏站点-G5',
      detail: createSolarInverterDetail({
        deviceCode: 'R251205J0054',
        stationName: '光伏站点-G5',
        deviceName: '逆变器#1',
        modelSpec: 'Factory SN',
        deviceType: '集中式',
        commissionDate: '2026-03-15',
        ratedPower: '50000',
        powerFactorRange: '250',
        maxEfficiency: '234',
        thd: '20000',
        maxInputCurrent: '1P48S×8（簇级）',
        protectionLevel: 'IP65',
        ratedOutputVoltage: '2500kW',
        coolingMethod: '风冷',
        ratedOutputFrequency: '+0.8',
        communicationAddress: '121.24.289',
        gridNumber: 'C5FDR24556',
        communicationProtocol: 'IP67',
        gridTestDate: '2026-03-15'
      })
    },
    {
      id: 'solar-g5-mod1',
      name: '光伏组件#1',
      code: 'MOD-G5-01',
      status: '运行中',
      category: 'solar',
      solarType: 'module',
      station: '光伏站点-G5',
      detail: createSolarModuleDetail({
        moduleCode: 'R251205J0054',
        voltageTest: '合格',
        moduleType: '单晶',
        dampHeatTest: '合格',
        iecCertification: '通过',
        mechanicalLoadTest: '合格',
        commissionDate: '2026-03-15',
        ratedPower: '50000',
        weight: '250',
        openCircuitVoltage: '234',
        optimalVoltage: '200',
        shortCircuitCurrent: '18',
        optimalCurrent: '16',
        conversionEfficiency: '25',
        tempCoefficient: '0.3',
        dimensions: '16*22*11'
      })
    }
  ]
})

export const createMockDeviceTree = (): DeviceCategoryNode[] => [
  {
    kind: 'category',
    id: 'category-energy-storage',
    name: '储能设备',
    expanded: true,
    addable: true,
    addText: '新增站点',
    categoryType: 'energy-storage',
    children: [createEnergyStation()]
  },
  {
    kind: 'category',
    id: 'category-solar',
    name: '光伏',
    expanded: true,
    addable: true,
    addText: '新增光伏站点',
    categoryType: 'solar',
    children: [createSolarStation()]
  },
  {
    kind: 'category',
    id: 'category-charging',
    name: '充电站',
    expanded: false,
    addable: false,
    addText: '新增站点',
    categoryType: 'charging',
    children: []
  },
  {
    kind: 'category',
    id: 'category-commercial',
    name: '工商业负荷',
    expanded: false,
    addable: false,
    addText: '新增站点',
    categoryType: 'commercial',
    children: []
  }
]
