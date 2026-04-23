import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  name: string
  avatar?: string
  role?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo>({ name: '管理员' })
  const sidebarCollapsed = ref(false)

  const login = async (credentials: { username: string; password: string }) => {
    if (credentials.username && credentials.password) {
      token.value = 'mock-token-' + Date.now()
      localStorage.setItem('token', token.value)
      userInfo.value = { name: credentials.username }
      return true
    }
    return false
  }

  const logout = () => {
    token.value = ''
    localStorage.removeItem('token')
    userInfo.value = { name: '' }
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    token,
    userInfo,
    sidebarCollapsed,
    login,
    logout,
    toggleSidebar
  }
})
