<template>
  <router-view />
</template>

<script setup lang="ts">
/**
 * 应用根组件
 *
 * 在应用挂载后自动调用 restoreSession() 恢复用户会话。
 * 这确保了页面刷新后 role 等权限数据能从后端重新获取，
 * 而非依赖于不安全的浏览器本地存储。
 */
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
  userStore.restoreSession()
})
</script>
