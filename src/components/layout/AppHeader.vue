<template>
  <header class="fixed top-0 right-0 h-[74px] flex items-center justify-between z-40 transition-all duration-300"
    :style="{ left: sidebarWidth }">
    <!-- 顶部栏背景 -->
    <div class="absolute inset-0 flex">
      <div class="flex-1 h-full bg-cover bg-left" style="background-image: url('/images/资源关联/u23.png');" />
      <div class="w-[643px] h-full bg-cover bg-right" style="background-image: url('/images/资源关联/u22.png');" />
    </div>

    <!-- 内容 -->
    <div class="relative z-10 flex items-center justify-between w-full h-full">
      <!-- 左侧标题 -->
      <div class="flex items-center" style="padding-left: 178px;">
        <h1 class="font-bold text-white whitespace-nowrap"
          style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; font-size: 36px;">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- 右侧信息 -->
      <div class="flex items-center" style="padding-right: 83px;">
        <!-- 时间 -->
        <div class="flex items-center justify-center text-white font-bold text-center"
          style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; font-size: 28px; width: 113px;">
          {{ currentTime }}
        </div>

        <!-- 竖线分隔 -->
        <div class="w-[1px] h-[40px] mx-3" style="background-color: rgba(219, 231, 242, 1);" />

        <!-- 星期和日期 -->
        <div class="flex flex-col items-center justify-center text-white text-center mr-4" style="font-size: 14px; min-width: 71px;">
          <div>{{ currentWeekday }}</div>
          <div>{{ currentDate }}</div>
        </div>

        <!-- 用户头像 -->
        <img src="/images/资源关联/u29.svg" class="w-[30px] h-[30px] mr-1" alt="avatar" />

        <!-- 用户名 + 下拉箭头 -->
        <el-dropdown @command="handleCommand">
          <div class="flex items-center cursor-pointer">
            <div class="text-white" style="font-size: 14px;">
              {{ userStore.userInfo.name }}
            </div>
            <img src="/images/资源关联/u37.svg" class="w-[14px] h-[12px] ml-1" alt="dropdown" />
          </div>
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
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { LogOut } from 'lucide-vue-next'

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
const currentDate = ref('')
const currentWeekday = ref('')

let timer: ReturnType<typeof setInterval>

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '.')

  currentWeekday.value = weekdays[now.getDay()]
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
