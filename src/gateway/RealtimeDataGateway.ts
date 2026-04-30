/**
 * 实时数据网关
 * 管理 WebSocket 连接、断线重连、心跳保活
 * 提供按频道订阅/取消订阅的消息分发能力
 */

import { ref, type Ref } from 'vue'
import { MockWebSocket } from '@/mocks/MockWebSocketServer'
import dayjs from 'dayjs'

// ============================================================
// 连接配置
// ============================================================

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://mock-local/energy-storage'

/** 是否使用 Mock WebSocket（URL 包含 'mock' 时启用） */
const IS_MOCK = WS_URL.includes('mock')

/** 心跳间隔（毫秒） */
const HEARTBEAT_INTERVAL = 30000

/** 重连初始延迟（毫秒） */
const RECONNECT_BASE_DELAY = 1000

/** 最大重连延迟（毫秒） */
const RECONNECT_MAX_DELAY = 30000

// ============================================================
// RealtimeDataGateway 类
// ============================================================

class RealtimeDataGateway {
  /** WebSocket 实例 */
  private ws: WebSocket | MockWebSocket | null = null

  /** 各频道订阅者映射 */
  private subscribers = new Map<string, Set<(data: unknown) => void>>()

  /** 心跳定时器 */
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null

  /** 重连定时器 */
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  /** 重连尝试次数 */
  private reconnectAttempts = 0

  /** 连接状态（响应式） */
  public status: Ref<'connecting' | 'open' | 'closed' | 'error'> = ref('connecting')

  constructor() {
    this.connect()
  }

  // ----------------------------------------------------------
  // 连接管理
  // ----------------------------------------------------------

  /**
   * 建立 WebSocket 连接
   * 若已有活跃连接则跳过，连接成功后重置重连计数并启动心跳。
   */
  private connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return
    }

    this.status.value = 'connecting'

    try {
      this.ws = IS_MOCK ? new MockWebSocket(WS_URL) : new WebSocket(WS_URL)

      this.ws.onopen = () => {
        this.status.value = 'open'
        this.reconnectAttempts = 0
        this.startHeartbeat()
        console.log('[RealtimeDataGateway] WebSocket connected')
      }

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data)
      }

      this.ws.onclose = () => {
        this.status.value = 'closed'
        this.stopHeartbeat()
        this.scheduleReconnect()
        console.log('[RealtimeDataGateway] WebSocket closed')
      }

      this.ws.onerror = () => {
        this.status.value = 'error'
        this.stopHeartbeat()
        console.error('[RealtimeDataGateway] WebSocket error')
      }
    } catch (e) {
      this.status.value = 'error'
      this.scheduleReconnect()
      console.error('[RealtimeDataGateway] Failed to create WebSocket:', e)
    }
  }

  /** 断开连接 */
  public disconnect(): void {
    this.stopHeartbeat()
    this.clearReconnect()
    this.ws?.close()
    this.ws = null
  }

  // ----------------------------------------------------------
  // 消息处理
  // ----------------------------------------------------------

  /**
   * 解析并分发收到的消息
   * 过滤心跳响应，将其余消息按 channel 路由到对应订阅者。
   * @param raw 原始 JSON 字符串
   */
  private handleMessage(raw: string): void {
    try {
      const msg = JSON.parse(raw)

      // 处理心跳响应
      if (msg.type === 'pong') return

      // 处理频道数据
      const { channel, payload } = msg
      if (channel && this.subscribers.has(channel)) {
        this.subscribers.get(channel)!.forEach((cb) => {
          try {
            cb(payload)
          } catch (e) {
            console.error(`[RealtimeDataGateway] Subscriber error on channel "${channel}":`, e)
          }
        })
      }
    } catch (e) {
      console.error('[RealtimeDataGateway] Message parse error:', e)
    }
  }

  // ----------------------------------------------------------
  // 订阅 / 取消订阅
  // ----------------------------------------------------------

  /**
   * 订阅指定频道的实时数据
   * @param channel 频道名称（如 'monitor', 'dashboard'）
   * @param callback 数据到达时的回调函数
   * @returns 取消订阅函数
   */
  public subscribe(channel: string, callback: (data: unknown) => void): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set())
    }
    this.subscribers.get(channel)!.add(callback)

    // 返回取消订阅函数
    return () => {
      const set = this.subscribers.get(channel)
      if (set) {
        set.delete(callback)
        if (set.size === 0) {
          this.subscribers.delete(channel)
        }
      }
    }
  }

  /**
   * 取消订阅指定频道的所有回调
   * @param channel 频道名称
   */
  public unsubscribeAll(channel: string): void {
    this.subscribers.delete(channel)
  }

  // ----------------------------------------------------------
  // 心跳保活
  // ----------------------------------------------------------

  /** 启动心跳定时器，每隔 HEARTBEAT_INTERVAL 发送 ping 消息 */
  private startHeartbeat(): void {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', ts: dayjs().valueOf() }))
      }
    }, HEARTBEAT_INTERVAL)
  }

  /** 停止心跳定时器 */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  // ----------------------------------------------------------
  // 断线重连（指数退避）
  // ----------------------------------------------------------

  /**
   * 调度断线重连（指数退避算法）
   * 重连延迟 = min(1s × 2^attempts, 30s)
   */
  private scheduleReconnect(): void {
    this.clearReconnect()
    const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts), RECONNECT_MAX_DELAY)
    this.reconnectAttempts++

    console.log(`[RealtimeDataGateway] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  /** 清除重连定时器 */
  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }
}

// ============================================================
// 单例导出
// ============================================================

export const realtimeGateway = new RealtimeDataGateway()
