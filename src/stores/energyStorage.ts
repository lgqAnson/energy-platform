/**
 * 储能模块状态管理 Store
 *
 * 集中管理储能各子页面共享的实时数据。
 * WebSocket 订阅在 store 中统一管理，数据在页面切换时持久保留。
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { realtimeGateway } from '@/gateway/RealtimeDataGateway'
import type {
  EnergyGroupItem,
  EnergyBlockItem,
  MeterRow,
  TopologyGroup,
  TopologyBlock,
  RealtimeChartSeries,
  MonitorRealtimePayload
} from '@/views/energy-storage/monitor/types'

const MAX_SERIES_POINTS = 50

export const useEnergyStorageStore = defineStore('energyStorage', () => {
  // ============================================================
  // 实时监控数据
  // ============================================================

  const energyGroups = ref<EnergyGroupItem[]>([
    { id: 'a', name: '能量组 A', power: 856, soc: 78.5, maxTemp: 28.3, minTemp: 25.3, voltage: 382.5, current: 1245, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: 'b', name: '能量组 B', power: 912, soc: 65.2, maxTemp: 36.7, minTemp: 26.1, voltage: 381.8, current: 1320, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
    { id: 'c', name: '能量组 C', power: 798, soc: 82.1, maxTemp: 27.9, minTemp: 25.3, voltage: 383.1, current: 1185, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
  ])

  const energyBlockMonitors = ref<EnergyBlockItem[]>([
    { id: '01', name: '能量块 #01', power: 198, soc: 82.3, maxTemp: 25.3, voltage: 382.5, totalVoltage: 615.2, current: 325, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: '02', name: '能量块 #02', power: 201, soc: 79.8, maxTemp: 26.1, voltage: 382.3, totalVoltage: 614.8, current: 328, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: '03', name: '能量块 #03', power: 195, soc: 76.5, maxTemp: 36.7, voltage: 381.5, totalVoltage: 608.7, current: 322, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
    { id: '04', name: '能量块 #04', power: 197, soc: 74.2, maxTemp: 24.2, voltage: 381.2, totalVoltage: 607.5, current: 320, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: '05', name: '能量块 #05', power: 199, soc: 81.1, maxTemp: 25.5, voltage: 382.8, totalVoltage: 616.0, current: 326, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
  ])

  const topologyData = ref<{ groups: TopologyGroup[]; blocks: TopologyBlock[] }>({
    groups: [
      { id: 'G5', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
      { id: 'G8', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
      { id: 'G12', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' }
    ],
    blocks: [
      { id: '01', name: '#1', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '25.3°C' },
      { id: '02', name: '#2', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '26.1°C' },
      { id: '03', name: '#3', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.8°C' },
      { id: '04', name: '#4', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.2°C' },
      { id: '05', name: '#5', power: '200kW', capacity: '400kWh', group: 'G12', temperature: '25.5°C' }
    ]
  })

  const meterData = ref<MeterRow[]>([
    { name: '电压', phaseA: '221.5', phaseB: '220.8', phaseC: '222.3', avg: '221.5', unit: 'V', status: '正常', statusType: 'normal' },
    { name: '电流', phaseA: '156.8', phaseB: '158.2', phaseC: '155.7', avg: '156.9', unit: 'A', status: '正常', statusType: 'normal' },
    { name: '有功功率', phaseA: '32.5', phaseB: '33.1', phaseC: '32.8', avg: '98.4', unit: 'kW', status: '正常', statusType: 'normal' }
  ])

  const realtimeSeries = ref<RealtimeChartSeries>({
    xData: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
    gatePower: [0, 0, 0, 200, 800, 1200, 1400, 1300, 1100, 900, 600, 200, 0],
    gridPower: [0, 0, 0, 150, 600, 1000, 1200, 1100, 900, 700, 400, 150, 0],
    chargeDischargePower: [0, 0, 0, 100, 400, 800, 1000, 900, 700, 500, 300, 100, 0]
  })

  // ============================================================
  // 看板数据
  // ============================================================

  const stationStats = ref([
    { label: '累计装机容量', value: 15280, unit: 'MWh', trend: '+8.5%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
    { label: '累计装机功率', value: 2500, unit: 'MW', trend: '+6.2%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
    { label: '累计总充电量', value: 85600, unit: 'MWh', desc: '历史累计充电总量', color: '#22c55e', borderColor: '#22c55e' },
    { label: '累计总放电量', value: 78300, unit: 'MWh', desc: null as string | null, color: '#f59e0b', borderColor: '#f59e0b' },
    { label: '安全运行天数', value: 1250, unit: '天', desc: '历史无安全事故总天数', color: '#22c55e', borderColor: '#22c55e' },
    { label: '总电站数', value: 328, unit: '站', desc: null as string | null, color: '#a855f7', borderColor: '#a855f7' },
    { label: '总储能柜数', value: 1850, unit: '台', desc: null as string | null, color: '#ec4899', borderColor: '#ec4899' }
  ])

  // ============================================================
  // WebSocket 订阅管理
  // ============================================================

  /** 已激活的频道取消订阅函数映射 */
  const activeChannels = new Map<string, () => void>()

  /** 已订阅频道计数（用于引用计数） */
  const channelRefCount = new Map<string, number>()

  /**
   * 激活实时数据频道（引用计数）
   * 首次订阅时建立 WebSocket 连接，后续调用仅递增计数。
   * @param channel 频道名称
   * @param handler 数据处理回调
   */
  function activateChannel(channel: string, handler: (data: unknown) => void) {
    const count = channelRefCount.get(channel) || 0
    channelRefCount.set(channel, count + 1)

    if (!activeChannels.has(channel)) {
      const unsub = realtimeGateway.subscribe(channel, handler)
      activeChannels.set(channel, unsub)
    }
  }

  /**
   * 停用实时数据频道（引用计数）
   * 计数归零时取消 WebSocket 订阅。
   * @param channel 频道名称
   */
  function deactivateChannel(channel: string) {
    const count = channelRefCount.get(channel) || 1
    if (count <= 1) {
      activeChannels.get(channel)?.()
      activeChannels.delete(channel)
      channelRefCount.delete(channel)
    } else {
      channelRefCount.set(channel, count - 1)
    }
  }

  /**
   * 处理监控频道实时数据
   */
  const handleMonitorData = (payload: MonitorRealtimePayload) => {
    if (payload.groups) {
      payload.groups.forEach((g, i) => {
        if (energyGroups.value[i]) Object.assign(energyGroups.value[i], g)
      })
    }
    if (payload.blocks) {
      payload.blocks.forEach((b, i) => {
        if (energyBlockMonitors.value[i]) Object.assign(energyBlockMonitors.value[i], b)
      })
    }
    if (payload.topology) {
      Object.assign(topologyData.value, payload.topology)
    }
    if (payload.meter) {
      payload.meter.forEach((m, i) => {
        if (meterData.value[i]) Object.assign(meterData.value[i], m)
      })
    }
    if (payload.realtimePoint) {
      const pt = payload.realtimePoint
      const rts = realtimeSeries.value
      rts.xData.push(pt.time)
      rts.gatePower.push(pt.gatePower)
      rts.gridPower.push(pt.gridPower)
      rts.chargeDischargePower.push(pt.chargeDischargePower)
      if (rts.xData.length > MAX_SERIES_POINTS) {
        rts.xData.shift()
        rts.gatePower.shift()
        rts.gridPower.shift()
        rts.chargeDischargePower.shift()
      }
    }
  }

  /** 启动监控实时数据订阅 */
  function startMonitorRealtime() {
    activateChannel('monitor', handleMonitorData as (data: unknown) => void)
  }

  /** 停止监控实时数据订阅 */
  function stopMonitorRealtime() {
    deactivateChannel('monitor')
  }

  return {
    // 监控数据
    energyGroups,
    energyBlockMonitors,
    topologyData,
    meterData,
    realtimeSeries,
    // 看板数据
    stationStats,
    // 操作
    startMonitorRealtime,
    stopMonitorRealtime
  }
})
