/**
 * 用户状态管理 Store
 *
 * 管理用户认证信息（token）、用户资料以及侧边栏折叠状态。
 * mock 模式使用本地账户校验，联调模式调用 authApi。
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

/** mock 账号库（仅 mock 模式生效） */
const mockAccounts: Record<string, { password: string; role: string }> = {
  admin: { password: 'admin123', role: 'admin' },
  operator: { password: 'operator123', role: 'operator' },
  viewer: { password: 'viewer123', role: 'viewer' },
  engineer: { password: 'engineer123', role: 'engineer' }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>({ name: '管理员' })
  const sidebarCollapsed = ref(false)

  /**
   * 用户登录（双模）
   *
   * mock 模式：校验本地硬编码账户
   * 联调模式：调用 authApi.login() 获取 token，再调用 authApi.getUserInfo() 获取用户信息
   */
  const login = async (credentials: { username: string; password: string }) => {
    if (isApiMockMode) {
      const account = mockAccounts[credentials.username]
      if (account && account.password === credentials.password) {
        token.value = 'mock-token-' + dayjs().valueOf()
        localStorage.setItem('token', token.value)
        userInfo.value = { name: credentials.username, role: account.role }
        return true
      }
      return false
    }

    try {
      const loginRes = await authApi.login(credentials)
      token.value = loginRes.data?.token ?? ''
      localStorage.setItem('token', token.value)

      const infoRes = await authApi.getUserInfo()
      userInfo.value = {
        name: infoRes.data?.name ?? credentials.username,
        role: infoRes.data?.role ?? '',
        avatar: infoRes.data?.avatar ?? ''
      }
      return true
    } catch {
      ElMessage.error('登录失败')
      return false
    }
  }

  const logout = async () => {
    if (!isApiMockMode) {
      try { await authApi.logout() } catch { /* 忽略登出接口错误 */ }
    }
    token.value = ''
    localStorage.removeItem('token')
    userInfo.value = { name: '' }
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
    toggleSidebar,
    setSidebarCollapsed
  }
})
