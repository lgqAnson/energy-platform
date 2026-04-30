/**
 * 实时监控模块类型定义
 *
 * 定义能量组、能量块、电表、拓扑结构和实时曲线等
 * 监控频道的核心数据结构。
 */

/** 拓扑结构 — 能量组 */
export interface TopologyGroup {
  id: string
  power: string
  capacity: string
  config: string
  status: string
}

/** 拓扑结构 — 能量块 */
export interface TopologyBlock {
  id: string
  name: string
  power: string
  capacity: string
  group: string
  temperature: string
}

/** 能量组监控指标 */
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

/** 能量块监控指标 */
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

/** 电表一行数据 */
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

/** 实时充放电曲线数据 */
export interface RealtimeChartSeries {
  xData: string[]
  gatePower: number[]
  gridPower: number[]
  chargeDischargePower: number[]
}

/**
 * WebSocket monitor 频道推送的完整数据负载
 * 各字段按需可选，取决于服务端推送的具体内容
 */
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
