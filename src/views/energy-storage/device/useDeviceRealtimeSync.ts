import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import type { DeviceCategoryNode, DeviceLeafNode } from './types'

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
