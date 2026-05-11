/**
 * 用户状态管理 Store
 *
 * 管理用户认证信息（token）、用户资料以及侧边栏折叠状态。
 * mock 模式使用本地账户校验，联调模式调用 authApi。
 *
 * 安全设计：
 * - role 仅存内存，不持久化到 localStorage，防止前端篡改提权
 * - token 带有过期时间，客户端可主动检测失效
 * - 页面刷新时通过 restoreSession() 从后端恢复会话
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/api'
import { isApiMockMode } from '@/utils/env'

/** 用户基本信息 */
export interface UserInfo {
  name: string
  avatar?: string
  role?: string
}

/** Token 存储结构（含过期时间） */
interface TokenData {
  value: string
  expiresAt: number
}

/** 登录接口响应 data 字段结构 */
interface LoginResponseData {
  token?: string
}

/** Token 有效期（小时） */
const TOKEN_EXPIRY_HOURS = 8

/** localStorage 中 token 的存储 key */
const TOKEN_KEY = 'token'

/**
 * 安全地存储 token（含过期时间）
 * @param tokenValue token 字符串
 */
function saveToken(tokenValue: string): void {
  const data: TokenData = {
    value: tokenValue,
    expiresAt: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data))
}

/**
 * 读取 token（自动检查过期，过期则清除并返回空字符串）
 * @returns 有效的 token 字符串，若不存在或已过期返回空字符串
 */
function loadToken(): string {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return ''
    const data: TokenData = JSON.parse(raw)
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(TOKEN_KEY)
      return ''
    }
    return data.value
  } catch {
    localStorage.removeItem(TOKEN_KEY)
    return ''
  }
}

/** mock 账号库（仅 mock 模式生效） */
const mockAccounts: Record<string, { password: string; role: string }> = {
  admin: { password: 'admin123', role: 'admin' },
  operator: { password: 'operator123', role: 'operator' },
  viewer: { password: 'viewer123', role: 'viewer' },
  engineer: { password: 'engineer123', role: 'engineer' }
}

export const useUserStore = defineStore('user', () => {
  /** 认证 token（从带过期的存储中加载） */
  const token = ref(loadToken())
  /**
   * 用户信息（role 仅存内存，不持久化到 localStorage）
   *
   * 安全原则：权限数据不应持久化到浏览器本地存储，
   * 否则用户可通过 DevTools 直接篡改角色实现提权。
   * 每次页面刷新后需通过 restoreSession() 从后端重新获取。
   */
  const userInfo = ref<UserInfo>({ name: '', role: undefined })
  /** 侧边栏是否收起 */
  const sidebarCollapsed = ref(false)

  /**
   * 用户登录（双模）
   *
   * mock 模式：校验本地硬编码账户
   * 联调模式：调用 authApi.login() 获取 token，再调用 authApi.getUserInfo() 获取用户信息
   *
   * @param credentials 登录凭证（用户名和密码）
   * @returns 登录是否成功
   */
  const login = async (credentials: { username: string; password: string }) => {
    if (isApiMockMode) {
      const account = mockAccounts[credentials.username]
      if (account && account.password === credentials.password) {
        const newToken = 'mock-token-' + dayjs().valueOf()
        token.value = newToken
        saveToken(newToken)
        // role 仅存入内存，不写 localStorage
        userInfo.value = { name: credentials.username, role: account.role }
        return true
      }
      return false
    }

    try {
      const loginRes = await authApi.login(credentials)
      const newToken = (loginRes.data as LoginResponseData)?.token ?? ''
      token.value = newToken
      saveToken(newToken)

      const infoRes = await authApi.getUserInfo()
      userInfo.value = {
        name: infoRes.data?.name ?? credentials.username,
        role: infoRes.data?.role ?? '',
        avatar: infoRes.data?.avatar ?? ''
      }
      // 不再将 role 写入 localStorage
      return true
    } catch {
      ElMessage.error('登录失败')
      return false
    }
  }

  /**
   * 用户登出
   * 清除 token、用户信息，联调模式下调用后端登出接口
   */
  const logout = async () => {
    if (!isApiMockMode) {
      try { await authApi.logout() } catch { /* 忽略登出接口错误 */ }
    }
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
    // 不再需要清除 localStorage 中的 role
    userInfo.value = { name: '', role: undefined }
  }

  /**
   * 恢复会话（页面刷新时调用）
   *
   * 使用已存储的 token 向后端请求用户信息，
   * 将 role 等权限数据重新填充到内存中。
   * 若 token 无效或已过期，自动执行登出流程。
   *
   * Mock 模式下因无法从 token 反推角色，
   * 降级为最低权限（viewer），避免权限丢失导致页面空白。
   */
  const restoreSession = async (): Promise<void> => {
    if (!token.value) return

    if (isApiMockMode) {
      // Mock 模式无法从后端获取用户信息，降级为 viewer
      userInfo.value = { name: '用户', role: 'viewer' }
      return
    }

    try {
      const infoRes = await authApi.getUserInfo()
      userInfo.value = {
        name: infoRes.data?.name ?? '',
        role: infoRes.data?.role ?? '',
        avatar: infoRes.data?.avatar ?? ''
      }
    } catch {
      // token 无效，强制登出
      await logout()
    }
  }

  /**
   * 检查 token 是否已过期（客户端侧检查）
   * @returns true 表示 token 仍有效，false 表示已过期或不存在
   */
  const isTokenValid = (): boolean => {
    return loadToken().length > 0
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (val: boolean) => {
    sidebarCollapsed.value = val
  }

  return {
    token,
    userInfo,
    sidebarCollapsed,
    login,
    logout,
    restoreSession,
    isTokenValid,
    toggleSidebar,
    setSidebarCollapsed
  }
})
