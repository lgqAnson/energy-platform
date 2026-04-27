/**
 * 后端接口对接文件
 * 统一封装 axios 实例、拦截器及各业务模块 API
 */

import axios from 'axios'
import { ElMessage } from 'element-plus'

// ============================================================
// 基础配置
// ============================================================

/** API 基础地址（根据实际部署环境修改） */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

/** 请求超时时间（毫秒） */
const TIMEOUT = 30000

/** axios 实例 */
const request = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// ============================================================
// 请求拦截器
// ============================================================

request.interceptors.request.use(
  (config) => {
    // 从 localStorage 读取 token 并附加到请求头
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
  (response) => {
    const { data } = response

    // 若后端统一返回 code + data + msg 结构，可在此做统一处理
    if (data && typeof data.code === 'number' && data.code !== 200) {
      ElMessage.error(data.msg || '请求失败')
      return Promise.reject(new Error(data.msg || '请求失败'))
    }

    // 直接返回 data（若后端已包装，可改为返回 data.data）
    return data
  },
  (error) => {
    const { response } = error

    if (response) {
      const status = response.status
      const msg = response.data?.msg || response.data?.message

      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
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
// 通用请求方法（可选封装）
// ============================================================

/**
 * GET 请求
 * @param {string} url
 * @param {object} params
 * @param {object} config
 */
export function get(url, params = {}, config = {}) {
  return request.get(url, { params, ...config })
}

/**
 * POST 请求
 * @param {string} url
 * @param {object} data
 * @param {object} config
 */
export function post(url, data = {}, config = {}) {
  return request.post(url, data, config)
}

/**
 * PUT 请求
 * @param {string} url
 * @param {object} data
 * @param {object} config
 */
export function put(url, data = {}, config = {}) {
  return request.put(url, data, config)
}

/**
 * DELETE 请求
 * @param {string} url
 * @param {object} params
 * @param {object} config
 */
export function del(url, params = {}, config = {}) {
  return request.delete(url, { params, ...config })
}

// ============================================================
// 认证模块
// ============================================================

export const authApi = {
  /** 用户登录 */
  login: (credentials) => post('/auth/login', credentials),

  /** 用户登出 */
  logout: () => post('/auth/logout'),

  /** 获取当前登录用户信息 */
  getUserInfo: () => get('/auth/info'),

  /** 修改密码 */
  changePassword: (data) => post('/auth/change-password', data)
}

// ============================================================
// 用户管理模块
// ============================================================

export const userApi = {
  /** 获取用户列表 */
  getList: (params) => get('/user/list', params),

  /** 获取用户详情 */
  getDetail: (id) => get(`/user/${id}`),

  /** 新增用户 */
  create: (data) => post('/user', data),

  /** 编辑用户 */
  update: (id, data) => put(`/user/${id}`, data),

  /** 删除用户 */
  remove: (id) => del(`/user/${id}`)
}

// ============================================================
// 储能管理模块
// ============================================================

export const energyStorageApi = {
  // ----- 可视看板 -----
  getDashboardData: () => get('/energy-storage/dashboard'),

  // ----- 实时监控 -----
  getMonitorOverview: () => get('/energy-storage/monitor/overview'),
  getMonitorRealTime: (params) => get('/energy-storage/monitor/realtime', params),
  getMeterData: (params) => get('/energy-storage/monitor/meter', params),

  // ----- 策略控制 -----
  getStrategyList: (params) => get('/energy-storage/strategy/list', params),
  getStrategyDetail: (id) => get(`/energy-storage/strategy/${id}`),
  createStrategy: (data) => post('/energy-storage/strategy', data),
  updateStrategy: (id, data) => put(`/energy-storage/strategy/${id}`, data),
  deleteStrategy: (id) => del(`/energy-storage/strategy/${id}`),
  executeStrategy: (id) => post(`/energy-storage/strategy/${id}/execute`),
  getStrategyHistory: (params) => get('/energy-storage/strategy/history', params),
  getStrategyEffect: (params) => get('/energy-storage/strategy/effect', params),

  // ----- 电价管理 -----
  getPriceList: (params) => get('/energy-storage/price/list', params),
  getCurrentPrice: () => get('/energy-storage/price/current'),
  setPrice: (data) => post('/energy-storage/price', data),
  updatePrice: (id, data) => put(`/energy-storage/price/${id}`, data),
  getPriceHistory: (params) => get('/energy-storage/price/history', params),

  // ----- 抄表结算 -----
  getMeterReadingList: (params) => get('/energy-storage/settlement/meter/list', params),
  getSettlementList: (params) => get('/energy-storage/settlement/list', params),
  exportSettlement: (params) => get('/energy-storage/settlement/export', params, { responseType: 'blob' }),

  // ----- 收益管理 -----
  getRevenueOverview: (params) => get('/energy-storage/revenue/overview', params),
  getRevenueList: (params) => get('/energy-storage/revenue/list', params),
  getRevenueChart: (params) => get('/energy-storage/revenue/chart', params),
  exportRevenue: (params) => get('/energy-storage/revenue/export', params, { responseType: 'blob' }),

  // ----- 设备管理 -----
  getDeviceList: (params) => get('/energy-storage/device/list', params),
  getDeviceDetail: (id) => get(`/energy-storage/device/${id}`),
  createDevice: (data) => post('/energy-storage/device', data),
  updateDevice: (id, data) => put(`/energy-storage/device/${id}`, data),
  deleteDevice: (id) => del(`/energy-storage/device/${id}`),
  getDeviceStatus: () => get('/energy-storage/device/status'),

  // ----- 运维管理 -----
  getMaintenanceList: (params) => get('/energy-storage/maintenance/list', params),
  getMaintenanceDetail: (id) => get(`/energy-storage/maintenance/${id}`),
  createMaintenance: (data) => post('/energy-storage/maintenance', data),
  updateMaintenance: (id, data) => put(`/energy-storage/maintenance/${id}`, data),
  deleteMaintenance: (id) => del(`/energy-storage/maintenance/${id}`)
}

// ============================================================
// 光伏管理模块
// ============================================================

export const solarApi = {
  // ----- 实时监控 -----
  getMonitorData: (params) => get('/solar/monitor', params),

  // ----- 计量与能效 -----
  getMeteringList: (params) => get('/solar/metering/list', params),
  getEnergyEfficiency: (params) => get('/solar/metering/efficiency', params),

  // ----- 设备管理 -----
  getDeviceList: (params) => get('/solar/device/list', params),
  getDeviceDetail: (id) => get(`/solar/device/${id}`),
  createDevice: (data) => post('/solar/device', data),
  updateDevice: (id, data) => put(`/solar/device/${id}`, data),
  deleteDevice: (id) => del(`/solar/device/${id}`),

  // ----- 运维管理 -----
  getMaintenanceList: (params) => get('/solar/maintenance/list', params),
  createMaintenance: (data) => post('/solar/maintenance', data),
  updateMaintenance: (id, data) => put(`/solar/maintenance/${id}`, data),
  deleteMaintenance: (id) => del(`/solar/maintenance/${id}`)
}

// ============================================================
// 充电桩模块
// ============================================================

export const chargingStationApi = {
  /** 获取充电桩列表 */
  getList: (params) => get('/charging-station/list', params),

  /** 获取充电桩详情 */
  getDetail: (id) => get(`/charging-station/${id}`),

  /** 获取实时充电数据 */
  getRealTimeData: (params) => get('/charging-station/realtime', params),

  /** 获取充电记录 */
  getRecordList: (params) => get('/charging-station/record/list', params)
}

// ============================================================
// 工商业负荷模块
// ============================================================

export const commercialLoadApi = {
  /** 获取负荷数据 */
  getLoadData: (params) => get('/commercial-load/data', params),

  /** 获取负荷预测 */
  getForecast: (params) => get('/commercial-load/forecast', params),

  /** 获取负荷曲线 */
  getLoadCurve: (params) => get('/commercial-load/curve', params)
}

// ============================================================
// 告警中心模块
// ============================================================

export const alarmApi = {
  /** 获取告警列表 */
  getList: (params) => get('/alarm/list', params),

  /** 获取告警统计 */
  getStatistics: (params) => get('/alarm/statistics', params),

  /** 确认告警 */
  confirm: (id) => post(`/alarm/${id}/confirm`),

  /** 清除告警 */
  clear: (id) => post(`/alarm/${id}/clear`),

  /** 获取告警规则列表 */
  getRuleList: (params) => get('/alarm/rule/list', params),

  /** 更新告警规则 */
  updateRule: (id, data) => put(`/alarm/rule/${id}`, data)
}

// ============================================================
// 系统管理模块
// ============================================================

export const systemApi = {
  // ----- 登录日志 -----
  getLoginLogList: (params) => get('/system/login-log/list', params),
  exportLoginLog: (params) => get('/system/login-log/export', params, { responseType: 'blob' }),

  // ----- 资源关联 -----
  getResourceRelation: () => get('/system/resource-relation'),

  // ----- 园区管理 -----
  getParkList: () => get('/system/park/list'),
  getParkDetail: (id) => get(`/system/park/${id}`)
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
  systemApi
}
