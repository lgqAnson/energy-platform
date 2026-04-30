/**
 * 设备数据仓库
 *
 * 提供统一的设备树加载接口。
 * 当前使用 Mock 实现，未来可替换为真实 API 实现。
 */

import { createMockDeviceTree } from './mockDeviceTree'
import type { DeviceCategoryNode } from './types'

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

/** 设备仓库单例 */
export const deviceRepository: DeviceRepository = new MockDeviceRepository()
