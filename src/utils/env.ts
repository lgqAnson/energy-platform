/**
 * 运行时环境辅助
 * 所有由环境变量控制的行为集中在此处，联调时只需修改 .env 文件
 */

/** 当前是否处于 API mock 模式（客户端数据导出，不调用后端） */
export const isApiMockMode = import.meta.env.VITE_API_MOCK === 'true'

/** API 基础地址 */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/** WebSocket 地址 */
export const wsUrl = import.meta.env.VITE_WS_URL || 'ws://mock-local/energy-storage'

/** 是否生产环境 */
export const isProduction = import.meta.env.PROD
