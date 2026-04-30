/**
 * 用户状态管理 Store
 *
 * 管理用户认证信息（token）、用户资料以及侧边栏折叠状态。
 * 使用 Pinia setup 语法定义 state、getters 与 actions。
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import dayjs from 'dayjs'

/** 用户基本信息 */
export interface UserInfo {
  name: string
  avatar?: string
  role?: string
}

export const useUserStore = defineStore('user', () => {
  /** 认证令牌（从 localStorage 恢复） */
  const token = ref(localStorage.getItem('token') || '')
  /** 当前登录用户信息 */
  const userInfo = ref<UserInfo>({ name: '管理员' })
  /** 侧边栏是否折叠 */
  const sidebarCollapsed = ref(false)

  /**
   * 用户登录
   *
   * 校验用户名和密码后生成模拟 token 并持久化到 localStorage。
   *
   * @param credentials 包含用户名和密码的对象
   * @returns 登录成功返回 true，否则返回 false
   */
  const login = async (credentials: { username: string; password: string }) => {
    // TODO: 替换为真实后端认证接口
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      token.value = 'mock-token-' + dayjs().valueOf()
      localStorage.setItem('token', token.value)
      userInfo.value = { name: credentials.username }
      return true
    }
    return false
  }

  /**
   * 用户登出
   *
   * 清除 token 与用户信息，移除 localStorage 中的持久化数据。
   */
  const logout = () => {
    token.value = ''
    localStorage.removeItem('token')
    userInfo.value = { name: '' }
  }

  /** 切换侧边栏折叠状态 */
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * 设置侧边栏折叠状态
   * @param val true 表示折叠，false 表示展开
   */
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
