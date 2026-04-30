/**
 * WebSocket 连接状态 Composable
 * 提供响应式连接状态，供组件使用
 */

import { realtimeGateway } from '@/gateway/RealtimeDataGateway'

export function useConnectionStatus() {
  return {
    status: realtimeGateway.status
  }
}
