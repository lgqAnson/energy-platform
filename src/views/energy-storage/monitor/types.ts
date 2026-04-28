export interface TopologyGroup {
  id: string
  power: string
  capacity: string
  config: string
  status: string
}

export interface TopologyBlock {
  id: string
  name: string
  power: string
  capacity: string
  group: string
  temperature: string
}

export interface EnergyGroupItem {
  id: string
  name: string
  power: number
  soc: number
  maxTemp: number
  minTemp: number
  voltage: number
  current: number
  status: string
  statusType: string
  socColor: string
  hasWarning: boolean
}

export interface EnergyBlockItem {
  id: string
  name: string
  power: number
  soc: number
  maxTemp: number
  voltage: number
  totalVoltage: number
  current: number
  status: string
  statusType: string
  socColor: string
  hasWarning: boolean
}

export interface MeterRow {
  name: string
  phaseA: string
  phaseB: string
  phaseC: string
  avg: string
  unit: string
  status: string
  statusType: string
}

export interface RealtimeChartSeries {
  xData: string[]
  gatePower: number[]
  gridPower: number[]
  chargeDischargePower: number[]
}

export interface MonitorRealtimePayload {
  groups?: EnergyGroupItem[]
  blocks?: EnergyBlockItem[]
  meter?: Array<Pick<MeterRow, 'phaseA' | 'phaseB' | 'phaseC' | 'avg'>>
  topology?: {
    groups: TopologyGroup[]
    blocks: TopologyBlock[]
  }
  realtimePoint?: {
    time: string
    gatePower: number
    gridPower: number
    chargeDischargePower: number
  }
}
