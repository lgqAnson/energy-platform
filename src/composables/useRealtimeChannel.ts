/**
 * 实时数据频道订阅 Composable
 * 自动在组件挂载时订阅，卸载时取消订阅
 */

import { onMounted, onUnmounted } from 'vue'
import { realtimeGateway } from '@/gateway/RealtimeDataGateway'

/**
 * 订阅 WebSocket 实时数据频道
 * @param channel 频道名称（如 'monitor', 'dashboard'）
 * @param callback 数据到达时的回调函数
 */
export function useRealtimeChannel(channel: string, callback: (data: unknown) => void) {
  let unsub: (() => void) | null = null

  onMounted(() => {
    unsub = realtimeGateway.subscribe(channel, callback)
  })

  onUnmounted(() => {
    unsub?.()
  })
}
