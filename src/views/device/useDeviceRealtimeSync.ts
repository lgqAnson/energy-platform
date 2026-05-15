/**
 * 设备实时数据同步 Composable
 *
 * 订阅 WebSocket 'device' 频道，当收到设备状态更新时，
 * 通过设备 ID 在树中定位对应节点并原地修改其状态字段。
 */

import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import type { DeviceCategoryNode, DeviceLeafNode } from './types'

/**
 * 构建设备 ID → 节点的快速索引 Map
 * 遍历所有分类 → 站点 → 设备，将每个叶子节点的 id 映射到节点对象
 * @param tree 设备分类树
 * @returns 设备 ID 到节点的映射
 */
const buildDeviceIndex = (tree: DeviceCategoryNode[]) => {
  const index = new Map<string, DeviceLeafNode>()
  tree.forEach((category) => {
    category.children.forEach((station) => {
      station.children.forEach((device) => {
        index.set(device.id, device)
      })
    })
  })
  return index
}

/**
 * 设备实时状态同步
 *
 * 在组件挂载时自动订阅 'device' 频道，接收 WebSocket 推送的设备状态更新
 * 并通过设备索引在树中定位节点进行原地更新。
 *
 * @param getTree 返回当前设备树的 getter 函数（需为响应式数据源）
 */
export const useDeviceRealtimeSync = (getTree: () => DeviceCategoryNode[]) => {
  useRealtimeChannel('device', (payload) => {
    if (!payload?.deviceUpdates?.length) {
      return
    }

    const deviceIndex = buildDeviceIndex(getTree())
    payload.deviceUpdates.forEach((update: { id: string; status: string }) => {
      const device = deviceIndex.get(update.id)
      if (device) {
        device.status = update.status
      }
    })
  })
}
