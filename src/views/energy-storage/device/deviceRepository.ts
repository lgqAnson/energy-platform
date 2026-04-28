import { createMockDeviceTree } from './mockDeviceTree'
import type { DeviceCategoryNode } from './types'

export interface DeviceRepository {
  loadTree(): Promise<DeviceCategoryNode[]>
}

class MockDeviceRepository implements DeviceRepository {
  async loadTree(): Promise<DeviceCategoryNode[]> {
    return createMockDeviceTree()
  }
}

export const deviceRepository: DeviceRepository = new MockDeviceRepository()
