/**
 * 设备数据仓库
 *
 * 提供统一的设备树加载接口，支持 Mock / API 双模切换。
 * 通过 isApiMockMode 环境变量控制实现。
 */

import { createMockDeviceTree } from './mockDeviceTree'
import type { DeviceCategoryNode } from './types'
import { isApiMockMode } from '@/utils/env'
import { energyStorageApi } from '@/api/api'

/** 设备树数据仓库接口 */
export interface DeviceRepository {
  /** 加载设备树 */
  loadTree(): Promise<DeviceCategoryNode[]>
}

/** Mock 实现：从内存中构建设备树 */
class MockDeviceRepository implements DeviceRepository {
  async loadTree(): Promise<DeviceCategoryNode[]> {
    return createMockDeviceTree()
  }
}

/** API 实现：从后端加载设备树 */
class ApiDeviceRepository implements DeviceRepository {
  async loadTree(): Promise<DeviceCategoryNode[]> {
    const res = await energyStorageApi.getDeviceList()
    return (res.data as unknown as DeviceCategoryNode[]) ?? []
  }
}

/** 设备仓库单例（根据环境变量自动选择实现） */
export const deviceRepository: DeviceRepository = isApiMockMode
  ? new MockDeviceRepository()
  : new ApiDeviceRepository()
