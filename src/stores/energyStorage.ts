/**
 * 储能模块状态管理 Store
 *
 * 集中管理储能各子页面共享的实时数据。
 * mock 模式使用本地数据初始化，联调模式调用后端 API。
 * WebSocket 实时推送在两种模式下均可工作。
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { realtimeGateway } from '@/gateway/RealtimeDataGateway'
import { isApiMockMode } from '@/utils/env'
import { energyStorageApi } from '@/api/api'
import {
  getMockStationStats,
  getMockEnergyGroups,
  getMockEnergyBlocks,
  getMockTopologyData,
  getMockMeterData,
  getMockRealtimeSeries
} from '@/mocks/providers/energyStorage'
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
  // 实时监控数据（mock 模式用本地数据初始化，API 模式初始为空）
  // ============================================================

  const energyGroups = ref<EnergyGroupItem[]>(
    isApiMockMode ? getMockEnergyGroups() : []
  )

  const energyBlockMonitors = ref<EnergyBlockItem[]>(
    isApiMockMode ? getMockEnergyBlocks() : []
  )

  const topologyData = ref<{ groups: TopologyGroup[]; blocks: TopologyBlock[] }>(
    isApiMockMode ? getMockTopologyData() : { groups: [], blocks: [] }
  )

  const meterData = ref<MeterRow[]>(
    isApiMockMode ? getMockMeterData() : []
  )

  const realtimeSeries = ref<RealtimeChartSeries>(
    isApiMockMode ? getMockRealtimeSeries() : {
      xData: [], gatePower: [], gridPower: [], chargeDischargePower: []
    }
  )

  // ============================================================
  // 看板数据
  // ============================================================

  const stationStats = ref(isApiMockMode ? getMockStationStats() : [])

  // ============================================================
  // 双模数据加载方法（联调时调用后端 API）
  // ============================================================

  const loading = ref(false)

  /**
   * 加载看板统计数据
   * mock 模式无操作（已用本地数据初始化），联调模式调用 API
   */
  async function loadStationStats() {
    if (isApiMockMode) return
    loading.value = true
    try {
      const res = await energyStorageApi.getDashboardData()
      stationStats.value = res.data as unknown as typeof stationStats.value
    } catch {
      // 保持当前数据不变
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载监控初始数据（组、块、拓扑、电表）
   * mock 模式无操作，联调模式调用 API
   */
  async function loadMonitorInitData() {
    if (isApiMockMode) return
    loading.value = true
    try {
      const [overviewRes] = await Promise.all([
        energyStorageApi.getMonitorOverview()
      ])
      const overview = overviewRes.data as Record<string, unknown>
      if (overview) {
        if (overview.groups) energyGroups.value = overview.groups as EnergyGroupItem[]
        if (overview.blocks) energyBlockMonitors.value = overview.blocks as EnergyBlockItem[]
        if (overview.topology) topologyData.value = overview.topology as { groups: TopologyGroup[]; blocks: TopologyBlock[] }
        if (overview.meter) meterData.value = overview.meter as MeterRow[]
      }
    } catch {
      // 保持当前数据不变
    } finally {
      loading.value = false
    }
  }

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
    // 加载状态
    loading,
    // 双模数据加载
    loadStationStats,
    loadMonitorInitData,
    // WebSocket 操作
    startMonitorRealtime,
    stopMonitorRealtime
  }
})
