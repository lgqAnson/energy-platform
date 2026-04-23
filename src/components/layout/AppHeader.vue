<template>
  <header class="fixed top-0 right-0 h-[74px] flex items-center justify-between z-40 transition-all duration-300"
    :style="{ left: sidebarWidth }">
    <!-- 顶部栏背景 -->
    <div class="absolute inset-0 flex">
      <div class="flex-1 h-full bg-cover bg-left" style="background-image: url('/images/资源关联/u22.png');" />
      <div class="w-[643px] h-full bg-cover bg-right" style="background-image: url('/images/资源关联/u22.png');" />
    </div>

    <!-- 内容 -->
    <div class="relative z-10 flex items-center justify-between w-full px-6 h-full">
      <!-- 左侧标题 -->
      <div class="flex items-center">
        <h1 class="font-bold text-white whitespace-nowrap"
          style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; font-size: 36px;">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- 右侧信息 -->
      <div class="flex items-center gap-6">
        <!-- 时间 -->
        <div class="flex items-center gap-2 text-white text-sm">
          <Clock class="w-4 h-4" />
          <span>{{ currentTime }}</span>
        </div>

        <!-- 分隔线 -->
        <div class="w-px h-5 bg-white/30 rotate-90" />

        <!-- 用户信息 -->
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-white font-bold"
              style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; font-size: 28px;">
              {{ userStore.userInfo.name }}
            </div>
            <div class="text-white text-sm text-center">管理员</div>
          </div>
          <el-dropdown @command="handleCommand">
            <ChevronDown class="w-4 h-4 text-white cursor-pointer hover:text-primary transition-colors" />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <LogOut class="w-4 h-4 mr-2" />
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { Clock, ChevronDown, LogOut } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const pageTitle = computed(() => {
  return '能源管理系统'
})

const sidebarWidth = computed(() => {
  return userStore.sidebarCollapsed ? '64px' : '64px'
})

const currentTime = ref('')
let timer: ReturnType<typeof setInterval>

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>
