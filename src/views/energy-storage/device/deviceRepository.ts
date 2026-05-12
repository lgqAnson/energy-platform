/**
 * 设备数据仓库
 *
 * 提供统一的设备树加载及站点/设备 CRUD 接口，支持 Mock / API 双模切换。
 * 通过 isApiMockMode 环境变量控制实现。
 *
 * Mock 模式：树数据来自 mockDeviceTree 内存生成，CRUD 由 useDeviceManager
 *           直接在本地树数组上操作（仓库仅提供占桩节点）。
 * API 模式：调用 deviceTreeApi 与后端交互，响应经 deviceApiAdapters 转换。
 */

import { createMockDeviceTree } from './mockDeviceTree'
import {
  createEnergyDeviceNode,
  createEnergyStationNode,
  createSolarInverterNode,
  createSolarModuleNode,
  createSolarStationNode
} from './deviceAdapters'
import type {
  DeviceCategoryNode,
  DeviceLeafNode,
  DeviceStationNode,
  EnergyDeviceFormModel,
  EnergyStationFormModel,
  SolarInverterFormModel,
  SolarModuleFormModel,
  SolarStationFormModel
} from './types'
import { isApiMockMode } from '@/utils/env'
import { deviceTreeApi } from '@/api/api'
import {
  convertDeviceTreeResponse,
  convertDeviceDtoToLeafNode,
  convertStationDtoToStationNode
} from './deviceApiAdapters'

/** 站点表单数据的联合类型 */
type StationPayload = EnergyStationFormModel | SolarStationFormModel

/** 设备表单数据的联合类型 */
type DevicePayload = EnergyDeviceFormModel | SolarInverterFormModel | SolarModuleFormModel

/** 设备树数据仓库接口 */
export interface DeviceRepository {
  /** 加载完整设备树 */
  loadTree(): Promise<DeviceCategoryNode[]>

  /** 创建站点（返回新节点供调用方插入树） */
  createStation(categoryId: string, data: StationPayload): Promise<DeviceStationNode>

  /** 更新站点（返回更新后节点供调用方替换） */
  updateStation(id: string, data: StationPayload): Promise<DeviceStationNode>

  /** 删除站点及其子设备 */
  deleteStation(id: string): Promise<void>

  /** 创建设备（返回新节点供调用方插入树） */
  createDevice(stationId: string, data: DevicePayload): Promise<DeviceLeafNode>

  /** 更新设备（返回更新后节点供调用方替换） */
  updateDevice(id: string, data: DevicePayload): Promise<DeviceLeafNode>

  /** 删除设备 */
  deleteDevice(id: string): Promise<void>
}

// ============================================================
// Mock 实现
// ============================================================

/**
 * Mock 设备仓库实现
 *
 * loadTree 从 mockDeviceTree 内存生成设备树。
 * CRUD 方法返回占桩节点——实际的树操作由 useDeviceManager 在本地完成，
 * 与对接 API 前的行为完全一致。
 */
class MockDeviceRepository implements DeviceRepository {
  async loadTree(): Promise<DeviceCategoryNode[]> {
    return createMockDeviceTree()
  }

  async createStation(categoryId: string, data: StationPayload): Promise<DeviceStationNode> {
    // 根据表单数据中的分类信息判断是储能站点还是光伏站点
    if ('stationName' in data) {
      return createSolarStationNode(data, categoryId, Date.now())
    }
    return createEnergyStationNode(data, categoryId, Date.now())
  }

  async updateStation(_id: string, data: StationPayload): Promise<DeviceStationNode> {
    // Mock 模式下原地修改由 useDeviceManager.patchStationNode 完成，
    // 此处返回一份带 id 的合并数据供调用方使用
    return { id: _id, ...('stationName' in data ? createSolarStationNode(data, '', 0) : createEnergyStationNode(data, '', 0)) } as DeviceStationNode
  }

  async deleteStation(_id: string): Promise<void> {
    // Mock 模式下 splice 由 useDeviceManager.removeStation 完成
  }

  async createDevice(_stationId: string, data: DevicePayload): Promise<DeviceLeafNode> {
    if ('cabinetCode' in data || 'cabinetType' in data) {
      return createEnergyDeviceNode(data as EnergyDeviceFormModel, { kind: 'station', id: _stationId, name: '', expanded: false, deletable: false, addable: false, addText: '', categoryType: 'energy-storage', detail: {}, children: [] }, Date.now())
    }
    if ('deviceName' in data) {
      return createSolarInverterNode(data as SolarInverterFormModel, { kind: 'station', id: _stationId, name: '', expanded: false, deletable: false, addable: false, addText: '', categoryType: 'solar', detail: {}, children: [] }, Date.now())
    }
    return createSolarModuleNode(data as SolarModuleFormModel, { kind: 'station', id: _stationId, name: '', expanded: false, deletable: false, addable: false, addText: '', categoryType: 'solar', detail: {}, children: [] }, Date.now())
  }

  async updateDevice(_id: string, data: DevicePayload): Promise<DeviceLeafNode> {
    // Mock 模式下原地修改由 useDeviceManager.patchDeviceNode 完成
    if ('cabinetCode' in data || 'cabinetType' in data) {
      return createEnergyDeviceNode(data as EnergyDeviceFormModel, { kind: 'station', id: '', name: '', expanded: false, deletable: false, addable: false, addText: '', categoryType: 'energy-storage', detail: {}, children: [] }, 0)
    }
    if ('deviceName' in data) {
      return createSolarInverterNode(data as SolarInverterFormModel, { kind: 'station', id: '', name: '', expanded: false, deletable: false, addable: false, addText: '', categoryType: 'solar', detail: {}, children: [] }, 0)
    }
    return createSolarModuleNode(data as SolarModuleFormModel, { kind: 'station', id: '', name: '', expanded: false, deletable: false, addable: false, addText: '', categoryType: 'solar', detail: {}, children: [] }, 0)
  }

  async deleteDevice(_id: string): Promise<void> {
    // Mock 模式下 splice 由 useDeviceManager.removeDevice 完成
  }
}

// ============================================================
// API 实现
// ============================================================

/**
 * API 设备仓库实现
 *
 * 所有方法均调用 deviceTreeApi 与后端交互，
 * 响应数据经 deviceApiAdapters 转换为前端类型。
 */
class ApiDeviceRepository implements DeviceRepository {
  async loadTree(): Promise<DeviceCategoryNode[]> {
    const res = await deviceTreeApi.getTree()
    return convertDeviceTreeResponse(res)
  }

  async createStation(categoryId: string, data: StationPayload): Promise<DeviceStationNode> {
    const res = await deviceTreeApi.createStation({
      categoryId,
      categoryType: 'stationName' in data ? 'solar' : 'energy-storage',
      name: 'dispatchCode' in data ? data.dispatchCode : (data.stationName || ''),
      detail: data as unknown as Record<string, unknown>
    })
    // API 返回的 data 是 DeviceStationDto，需要转换
    const dto = res.data as unknown as import('./deviceApiTypes').DeviceStationDto
    return convertStationDtoToStationNode(dto)
  }

  async updateStation(id: string, data: StationPayload): Promise<DeviceStationNode> {
    const res = await deviceTreeApi.updateStation(id, {
      name: 'dispatchCode' in data ? data.dispatchCode : (data.stationName || ''),
      detail: data as unknown as Record<string, unknown>
    })
    const dto = res.data as unknown as import('./deviceApiTypes').DeviceStationDto
    return convertStationDtoToStationNode(dto)
  }

  async deleteStation(id: string): Promise<void> {
    await deviceTreeApi.deleteStation(id)
  }

  async createDevice(stationId: string, data: DevicePayload): Promise<DeviceLeafNode> {
    const res = await deviceTreeApi.createDevice({
      stationId,
      name: data.deviceName || data.cabinetCode || data.moduleCode || '',
      code: data.deviceCode || data.factoryCode || data.moduleCode || '',
      category: 'cabinetCode' in data || 'cabinetType' in data ? 'energy-storage' : 'solar',
      type: 'deviceName' in data ? 'inverter' : ('moduleCode' in data ? 'module' : undefined),
      detail: data as unknown as Record<string, unknown>
    })
    const dto = res.data as unknown as import('./deviceApiTypes').DeviceDto
    return convertDeviceDtoToLeafNode(dto)
  }

  async updateDevice(id: string, data: DevicePayload): Promise<DeviceLeafNode> {
    const res = await deviceTreeApi.updateDevice(id, {
      name: data.deviceName || data.cabinetCode || data.moduleCode || '',
      code: data.deviceCode || data.factoryCode || data.moduleCode || '',
      detail: data as unknown as Record<string, unknown>
    })
    const dto = res.data as unknown as import('./deviceApiTypes').DeviceDto
    return convertDeviceDtoToLeafNode(dto)
  }

  async deleteDevice(id: string): Promise<void> {
    await deviceTreeApi.deleteDevice(id)
  }
}

/** 设备仓库单例（根据环境变量自动选择实现） */
export const deviceRepository: DeviceRepository = isApiMockMode
  ? new MockDeviceRepository()
  : new ApiDeviceRepository()
