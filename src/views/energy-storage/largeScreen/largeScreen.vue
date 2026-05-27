<script setup lang="ts">
import { ref } from 'vue'

/** 大屏内嵌地址 */
const TARGET_URL = 'http://183.6.120.182:9902/'

/** iframe 是否加载完成 */
const loaded = ref(false)

/** iframe 加载完成后隐藏 loading */
function onLoad() {
  loaded.value = true
}
</script>

<template>
  <div class="w-full h-screen relative">
    <!-- 加载过渡效果 -->
    <Transition name="fade">
      <div v-if="!loaded" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0A1628]">
        <div class="loading-spinner mb-6" />
        <div class="text-white text-lg">正在加载大屏展示页面...</div>
        <div class="text-gray-400 text-sm mt-2">请稍候</div>
      </div>
    </Transition>

    <!-- iframe 内容 -->
    <iframe
      :src="TARGET_URL"
      class="w-full h-full border-0"
      frameborder="0"
      allowfullscreen
      @load="onLoad"
    />
  </div>
</template>

<style scoped>
/* 旋转加载动画 */
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(2, 167, 240, 0.2);
  border-top-color: #02a7f0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 淡入淡出过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
