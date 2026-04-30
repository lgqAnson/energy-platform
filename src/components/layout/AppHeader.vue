<template>
  <header class="fixed top-0 right-0 h-[var(--header-height)] flex items-center justify-between z-40 transition-all duration-300"
    :style="{ left: sidebarWidth }">
    <!-- 顶部栏背景 -->
    <div class="absolute inset-0 flex">
      <div class="flex-1 h-full bg-cover bg-left" style="background-image: url('/images/资源关联/u23.png');" />
      <div class="hidden xl:block w-[643px] h-full bg-cover bg-right" style="background-image: url('/images/资源关联/u22.png');" />
    </div>

    <!-- 内容 -->
    <div class="relative z-10 flex items-center justify-between w-full h-full">
      <!-- 左侧：汉堡菜单 + 标题 -->
      <div class="flex items-center" style="padding-left: var(--header-padding-left);">
        <!-- 平板/手机端汉堡菜单 -->
        <button v-if="isTouch" @click="userStore.toggleSidebar()"
          class="mr-3 text-white/70 hover:text-white transition-colors">
          <Menu class="w-6 h-6" />
        </button>
        <h1 class="font-bold text-white whitespace-nowrap"
          style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; font-size: 36px;">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- 右侧信息 -->
      <div class="flex items-center" style="padding-right: var(--header-padding-right);">
        <!-- 时间 -->
        <div class="hidden md:flex items-center justify-center text-white font-bold text-center"
          style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; font-size: 28px; width: 113px;">
          {{ currentTime }}
        </div>

        <!-- 竖线分隔 -->
        <div class="hidden md:block w-[1px] h-[40px] mx-3" style="background-color: rgba(219, 231, 242, 1);" />

        <!-- 星期和日期 -->
        <div class="hidden sm:flex flex-col items-center justify-center text-white text-center mr-4" style="font-size: 14px; min-width: 71px;">
          <div>{{ currentWeekday }}</div>
          <div>{{ currentDate }}</div>
        </div>

        <!-- 用户头像 -->
        <img src="/images/资源关联/u29.svg" class="w-[30px] h-[30px] mr-1" alt="avatar" />

        <!-- 用户名 + 下拉箭头 -->
        <el-dropdown @command="handleCommand">
          <div class="flex items-center cursor-pointer">
            <div class="text-white text-sm" style="font-size: 14px;">
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
import { useResponsive } from '@/composables/useResponsive'
import { LogOut, Menu } from 'lucide-vue-next'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { isTouch } = useResponsive()

const pageTitle = '能源管理系统'

/** 根据响应式断点和侧边栏状态计算 header 左侧偏移量 */
const sidebarWidth = computed(() => {
  if (isTouch.value) return '0px'
  return userStore.sidebarCollapsed
    ? 'var(--sidebar-collapsed-width)'
    : 'var(--sidebar-expanded-width)'
})

const currentTime = ref('')
const currentDate = ref('')
const currentWeekday = ref('')

let timer: ReturnType<typeof setInterval>

const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

/**
 * 每秒更新顶部栏显示的时间、日期和星期
 * 使用 toLocaleTimeString / toLocaleDateString 格式化中文展示
 */
const updateTime = () => {
  const now = dayjs()
  currentTime.value = now.format('HH:mm:ss')
  currentDate.value = now.format('YYYY.MM.DD')
  currentWeekday.value = weekdays[now.day()]
}

/** 挂载时立刻更新时间并启动每秒刷新的定时器 */
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

/** 组件卸载时清除定时器 */
onUnmounted(() => {
  clearInterval(timer)
})

/**
 * 处理用户下拉菜单命令（退出登录）
 * @param command 命令标识
 */
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}
</script>
