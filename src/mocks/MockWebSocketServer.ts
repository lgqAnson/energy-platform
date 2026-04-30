/**
 * 浏览器内 Mock WebSocket 服务端
 * 模拟真实 WebSocket 连接，定时向客户端推送各模块实时数据
 */

import dayjs from 'dayjs'
import { genMonitorData, genDashboardData, genStrategyData, genRevenueData, genPriceData, genSettlementData, genDeviceData, genMaintenanceData } from './energyStorageDataStream'

// ============================================================
// MockWebSocket - 模拟原生 WebSocket API
// ============================================================

export class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  binaryType: BinaryType = 'blob'
  bufferedAmount = 0
  extensions = ''
  protocol = ''

  onopen: ((this: MockWebSocket, ev: Event) => void) | null = null
  onmessage: ((this: MockWebSocket, ev: MessageEvent) => void) | null = null
  onclose: ((this: MockWebSocket, ev: CloseEvent) => void) | null = null
  onerror: ((this: MockWebSocket, ev: Event) => void) | null = null

  constructor(url: string | URL, _protocols?: string | string[]) {
    this.url = url.toString()
    // 异步触发连接成功
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      MockWebSocketServer.registerClient(this)
      this.onopen?.(new Event('open'))
    }, 50)
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    // Mock 服务端可处理前端发送的订阅/心跳消息
    if (typeof data === 'string') {
      try {
        const msg = JSON.parse(data)
        if (msg.type === 'ping') {
          this._dispatchMessage(JSON.stringify({ type: 'pong', ts: dayjs().valueOf() }))
        }
      } catch {
        // ignore
      }
    }
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED
    MockWebSocketServer.unregisterClient(this)
    this.onclose?.(new CloseEvent('close', { code, reason }))
  }

  /**
   * 服务端调用此方法向客户端推送消息
   * 仅在连接状态为 OPEN 时触发 onmessage 回调
   * @param data JSON 字符串消息
   */
  _dispatchMessage(data: string): void {
    if (this.readyState === MockWebSocket.OPEN) {
      this.onmessage?.(new MessageEvent('message', { data }))
    }
  }
}

// ============================================================
// MockWebSocketServer - 管理所有 Mock 连接，定时推送数据
// ============================================================

class MockWebSocketServer {
  private static clients = new Set<MockWebSocket>()
  private static timers: ReturnType<typeof setInterval>[] = []
  private static started = false

  /**
   * 注册客户端连接
   * 首次注册时自动启动所有频道的定时推送
   */
  static registerClient(ws: MockWebSocket): void {
    this.clients.add(ws)
    if (!this.started) {
      this.start()
    }
  }

  /** 取消注册客户端连接 */
  static unregisterClient(ws: MockWebSocket): void {
    this.clients.delete(ws)
  }

  /** 启动所有频道的数据推送定时器 */
  static start(): void {
    if (this.started) return
    this.started = true

    // monitor 频道：100ms 高频推送（功率/SOC/温度/电压/电流/电表/实时曲线）
    this.registerChannel('monitor', 100, genMonitorData)

    // dashboard 频道：1s 推送（统计卡片/锚点状态）
    this.registerChannel('dashboard', 1000, genDashboardData)

    // strategy 频道：5s 推送
    this.registerChannel('strategy', 5000, genStrategyData)

    // revenue 频道：5s 推送
    this.registerChannel('revenue', 5000, genRevenueData)

    // price 频道：10s 推送
    this.registerChannel('price', 10000, genPriceData)

    // settlement 频道：5s 推送
    this.registerChannel('settlement', 5000, genSettlementData)

    // device 频道：5s 推送
    this.registerChannel('device', 5000, genDeviceData)

    // maintenance 频道：10s 推送
    this.registerChannel('maintenance', 10000, genMaintenanceData)
  }

  /**
   * 注册一个数据推送频道
   * @param channel   频道名称
   * @param interval  推送间隔（毫秒）
   * @param generator 数据生成器函数
   */
  static registerChannel(
    channel: string,
    interval: number,
    generator: () => unknown
  ): void {
    const timer = setInterval(() => {
      if (this.clients.size === 0) return
      const payload = generator()
      const msg = JSON.stringify({ channel, payload, ts: dayjs().valueOf() })
      this.clients.forEach((ws) => ws._dispatchMessage(msg))
    }, interval)
    this.timers.push(timer)
  }
}
