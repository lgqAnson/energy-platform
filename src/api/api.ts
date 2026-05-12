/**
 * 后端接口对接文件
 * 统一封装 axios 实例、拦截器及各业务模块 API
 */

import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { apiBaseUrl } from '@/utils/env'

// ============================================================
// 通用类型定义
// ============================================================

/** 分页查询参数 */
export interface PageParams {
  page?: number
  pageSize?: number
  [key: string]: unknown
}

/** 分页响应 */
export interface PaginatedResponse<T = unknown> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  msg?: string
}

// ============================================================
// 基础配置
// ============================================================

/** axios 实例 */
const request = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// ============================================================
// 请求拦截器
// ============================================================

request.interceptors.request.use(
  (config) => {
    // 兼容新旧两种 token 存储格式：
    // 新格式：JSON { value, expiresAt } — 需解析并检查过期
    // 旧格式：纯字符串 — 直接使用（向后兼容）
    const raw = localStorage.getItem('token')
    if (raw) {
      let tokenValue: string | null = null
      try {
        const parsed = JSON.parse(raw)
        tokenValue = typeof parsed === 'object' && parsed.value ? parsed.value : raw
      } catch {
        tokenValue = raw
      }
      if (tokenValue) {
        config.headers.Authorization = `Bearer ${tokenValue}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ============================================================
// 响应拦截器
// ============================================================

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response

    if (data && typeof data.code === 'number' && data.code !== 200) {
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg || '请求失败'))
    }

    return data
  },
  async (error) => {
    const { response } = error

    if (response) {
      const status = response.status
      const msg = response.data?.msg || response.data?.message

      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          // 清除 token（兼容新旧格式）
          localStorage.removeItem('token')
          localStorage.removeItem('role') // 清除可能残留的旧 role 数据
          // 使用动态 import 获取 router 实例，避免循环依赖
          const { default: router } = await import('@/router/index')
          // 同时重置 userStore 中的状态
          const { useUserStore } = await import('@/stores/user')
          const userStore = useUserStore()
          userStore.token = ''
          userStore.userInfo = { name: '', role: undefined }
          router.push('/login')
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error(msg || '服务器内部错误')
          break
        default:
          ElMessage.error(msg || `请求失败: ${status}`)
      }
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }

    return Promise.reject(error)
  }
)

// ============================================================
// 通用请求方法
// ============================================================

/**
 * GET 请求
 */
export function get<T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.get(url, { params, ...config })
}

/**
 * POST 请求
 */
export function post<T = unknown>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.post(url, data, config)
}

/**
 * PUT 请求
 */
export function put<T = unknown>(url: string, data?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.put(url, data, config)
}

/**
 * DELETE 请求
 */
export function del<T = unknown>(url: string, params?: Record<string, unknown>, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  return request.delete(url, { params, ...config })
}

// ============================================================
// 模块数据类型
// ============================================================

/** 登录凭证 */
export interface LoginCredentials {
  username: string
  password: string
}

/** 用户信息 */
export interface UserInfo {
  id?: string
  name: string
  avatar?: string
  role?: string
}

/** 用户查询参数 */
export interface UserQueryParams extends PageParams {
  name?: string
  role?: string
}

// ============================================================
// 认证模块
// ============================================================

export const authApi = {
  login: (credentials: LoginCredentials) => post('/auth/login', credentials as unknown as Record<string, unknown>),
  logout: () => post('/auth/logout'),
  getUserInfo: () => get<UserInfo>('/auth/info'),
  changePassword: (data: { oldPassword: string; newPassword: string }) => post('/auth/change-password', data as unknown as Record<string, unknown>)
}

// ============================================================
// 用户管理模块
// ============================================================

export const userApi = {
  getList: (params: UserQueryParams) => get<PaginatedResponse<UserInfo>>('/user/list', params as unknown as Record<string, unknown>),
  getDetail: (id: string) => get<UserInfo>(`/user/${id}`),
  create: (data: Partial<UserInfo>) => post('/user', data as unknown as Record<string, unknown>),
  update: (id: string, data: Partial<UserInfo>) => put(`/user/${id}`, data as unknown as Record<string, unknown>),
  remove: (id: string) => del(`/user/${id}`)
}

// ============================================================
// 储能管理模块
// ============================================================

export const energyStorageApi = {
  // ----- 可视看板 -----
  getDashboardData: () => get('/energy-storage/dashboard'),

  // ----- 实时监控 -----
  getMonitorOverview: () => get('/energy-storage/monitor/overview'),
  getMonitorRealTime: (params?: Record<string, unknown>) => get('/energy-storage/monitor/realtime', params),
  getMeterData: (params?: Record<string, unknown>) => get('/energy-storage/monitor/meter', params),

  // ----- 策略控制 -----
  getStrategyList: (params?: PageParams) => get('/energy-storage/strategy/list', params as unknown as Record<string, unknown>),
  getStrategyDetail: (id: string) => get(`/energy-storage/strategy/${id}`),
  createStrategy: (data: Record<string, unknown>) => post('/energy-storage/strategy', data),
  updateStrategy: (id: string, data: Record<string, unknown>) => put(`/energy-storage/strategy/${id}`, data),
  deleteStrategy: (id: string) => del(`/energy-storage/strategy/${id}`),
  executeStrategy: (id: string) => post(`/energy-storage/strategy/${id}/execute`),
  getStrategyHistory: (params?: PageParams) => get('/energy-storage/strategy/history', params as unknown as Record<string, unknown>),
  getStrategyEffect: (params?: Record<string, unknown>) => get('/energy-storage/strategy/effect', params),

  // ----- 电价管理 -----
  getPriceList: (params?: PageParams) => get('/energy-storage/price/list', params as unknown as Record<string, unknown>),
  getCurrentPrice: () => get('/energy-storage/price/current'),
  setPrice: (data: Record<string, unknown>) => post('/energy-storage/price', data),
  updatePrice: (id: string, data: Record<string, unknown>) => put(`/energy-storage/price/${id}`, data),
  getPriceHistory: (params?: PageParams) => get('/energy-storage/price/history', params as unknown as Record<string, unknown>),

  // ----- 抄表结算 -----
  getMeterReadingList: (params?: PageParams) => get('/energy-storage/settlement/meter/list', params as unknown as Record<string, unknown>),
  getSettlementList: (params?: PageParams) => get('/energy-storage/settlement/list', params as unknown as Record<string, unknown>),
  exportSettlement: (params?: Record<string, unknown>) => get('/energy-storage/settlement/export', params, { responseType: 'blob' }),

  // ----- 收益管理 -----
  getRevenueOverview: (params?: Record<string, unknown>) => get('/energy-storage/revenue/overview', params),
  getRevenueList: (params?: PageParams) => get('/energy-storage/revenue/list', params as unknown as Record<string, unknown>),
  getRevenueChart: (params?: Record<string, unknown>) => get('/energy-storage/revenue/chart', params),
  exportRevenue: (params?: Record<string, unknown>) => get('/energy-storage/revenue/export', params, { responseType: 'blob' }),

  // ----- 设备管理 -----
  getDeviceList: (params?: PageParams) => get('/energy-storage/device/list', params as unknown as Record<string, unknown>),
  getDeviceDetail: (id: string) => get(`/energy-storage/device/${id}`),
  createDevice: (data: Record<string, unknown>) => post('/energy-storage/device', data),
  updateDevice: (id: string, data: Record<string, unknown>) => put(`/energy-storage/device/${id}`, data),
  deleteDevice: (id: string) => del(`/energy-storage/device/${id}`),
  getDeviceStatus: () => get('/energy-storage/device/status'),

  // ----- 运维管理 -----
  getMaintenanceList: (params?: PageParams) => get('/energy-storage/maintenance/list', params as unknown as Record<string, unknown>),
  getMaintenanceDetail: (id: string) => get(`/energy-storage/maintenance/${id}`),
  createMaintenance: (data: Record<string, unknown>) => post('/energy-storage/maintenance', data),
  updateMaintenance: (id: string, data: Record<string, unknown>) => put(`/energy-storage/maintenance/${id}`, data),
  deleteMaintenance: (id: string) => del(`/energy-storage/maintenance/${id}`)
}

// ============================================================
// 光伏管理模块
// ============================================================

export const solarApi = {
  // ----- 实时监控 -----
  getMonitorData: (params?: Record<string, unknown>) => get('/solar/monitor', params),

  // ----- 计量与能效 -----
  getMeteringList: (params?: PageParams) => get('/solar/metering/list', params as unknown as Record<string, unknown>),
  getEnergyEfficiency: (params?: Record<string, unknown>) => get('/solar/metering/efficiency', params),

  // ----- 设备管理 -----
  getDeviceList: (params?: PageParams) => get('/solar/device/list', params as unknown as Record<string, unknown>),
  getDeviceDetail: (id: string) => get(`/solar/device/${id}`),
  createDevice: (data: Record<string, unknown>) => post('/solar/device', data),
  updateDevice: (id: string, data: Record<string, unknown>) => put(`/solar/device/${id}`, data),
  deleteDevice: (id: string) => del(`/solar/device/${id}`),

  // ----- 运维管理 -----
  getMaintenanceList: (params?: PageParams) => get('/solar/maintenance/list', params as unknown as Record<string, unknown>),
  createMaintenance: (data: Record<string, unknown>) => post('/solar/maintenance', data),
  updateMaintenance: (id: string, data: Record<string, unknown>) => put(`/solar/maintenance/${id}`, data),
  deleteMaintenance: (id: string) => del(`/solar/maintenance/${id}`)
}

// ============================================================
// 充电桩模块
// ============================================================

export const chargingStationApi = {
  getList: (params?: PageParams) => get('/charging-station/list', params as unknown as Record<string, unknown>),
  getDetail: (id: string) => get(`/charging-station/${id}`),
  getRealTimeData: (params?: Record<string, unknown>) => get('/charging-station/realtime', params),
  getRecordList: (params?: PageParams) => get('/charging-station/record/list', params as unknown as Record<string, unknown>)
}

// ============================================================
// 工商业负荷模块
// ============================================================

export const commercialLoadApi = {
  getLoadData: (params?: Record<string, unknown>) => get('/commercial-load/data', params),
  getForecast: (params?: Record<string, unknown>) => get('/commercial-load/forecast', params),
  getLoadCurve: (params?: Record<string, unknown>) => get('/commercial-load/curve', params)
}

// ============================================================
// 告警中心模块
// ============================================================

export const alarmApi = {
  getList: (params?: PageParams) => get('/alarm/list', params as unknown as Record<string, unknown>),
  getStatistics: (params?: Record<string, unknown>) => get('/alarm/statistics', params),
  confirm: (id: string) => post(`/alarm/${id}/confirm`),
  clear: (id: string) => post(`/alarm/${id}/clear`),
  getRuleList: (params?: PageParams) => get('/alarm/rule/list', params as unknown as Record<string, unknown>),
  updateRule: (id: string, data: Record<string, unknown>) => put(`/alarm/rule/${id}`, data)
}

// ============================================================
// 设备管理模块（设备树 / 站点 / 设备统一端点）
// ============================================================

/**
 * 设备树 API
 *
 * 统一管理三层设备树（分类 → 站点 → 设备）的 CRUD 操作，
 * 以及设备图片的上传/删除。路由前缀统一为 `/device/`。
 */
export const deviceTreeApi = {
  // ----- 设备树 -----
  /** 加载完整设备树（分类→站点→设备三层嵌套结构） */
  getTree: () => get('/device/tree'),

  // ----- 站点 CRUD -----
  /** 获取站点分页列表，支持按分类过滤 */
  getStationList: (params?: PageParams) => get('/device/station/list', params as unknown as Record<string, unknown>),
  /** 获取站点详情 */
  getStationDetail: (id: string) => get(`/device/station/${id}`),
  /** 创建站点（储能或光伏） */
  createStation: (data: Record<string, unknown>) => post('/device/station', data),
  /** 更新站点 */
  updateStation: (id: string, data: Record<string, unknown>) => put(`/device/station/${id}`, data),
  /** 删除站点及其子设备 */
  deleteStation: (id: string) => del(`/device/station/${id}`),

  // ----- 设备 CRUD -----
  /** 获取设备分页列表，支持按站点过滤 */
  getDeviceList: (params?: PageParams) => get('/device/device/list', params as unknown as Record<string, unknown>),
  /** 获取设备详情 */
  getDeviceDetail: (id: string) => get(`/device/device/${id}`),
  /** 创建设备（储能设备/光伏逆变器/光伏组件） */
  createDevice: (data: Record<string, unknown>) => post('/device/device', data),
  /** 更新设备 */
  updateDevice: (id: string, data: Record<string, unknown>) => put(`/device/device/${id}`, data),
  /** 删除设备 */
  deleteDevice: (id: string) => del(`/device/device/${id}`),

  // ----- 图片上传 -----
  /**
   * 上传设备/站点图片
   * @param file 图片文件
   * @returns 上传后的图片 URL 信息
   */
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/device/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }) as Promise<ApiResponse<{ url: string; key: string }>>
  },

  /**
   * 删除已上传的图片
   * @param key 图片标识 key
   */
  deleteImage: (key: string) => del(`/device/upload/${key}`)
}

// ============================================================
// 系统管理模块
// ============================================================

export const systemApi = {
  // ----- 登录日志 -----
  getLoginLogList: (params?: PageParams) => get('/system/login-log/list', params as unknown as Record<string, unknown>),
  exportLoginLog: (params?: Record<string, unknown>) => get('/system/login-log/export', params, { responseType: 'blob' }),

  // ----- 资源关联 -----
  getResourceRelation: () => get('/system/resource-relation'),

  // ----- 园区管理 -----
  getParkList: () => get('/system/park/list'),
  getParkDetail: (id: string) => get(`/system/park/${id}`)
}

// ============================================================
// 统一导出
// ============================================================

export default {
  request,
  get,
  post,
  put,
  del,
  authApi,
  userApi,
  energyStorageApi,
  solarApi,
  chargingStationApi,
  commercialLoadApi,
  alarmApi,
  systemApi,
  deviceTreeApi
}
