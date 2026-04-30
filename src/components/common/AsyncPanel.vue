<template>
  <div class="async-panel">
    <!-- Loading -->
    <div v-if="loading" class="async-state flex items-center justify-center py-16">
      <div class="text-center space-y-3">
        <div class="async-spinner" />
        <p class="text-sm text-white/40">{{ loadingText }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="async-state flex items-center justify-center py-16">
      <div class="text-center space-y-3">
        <div class="text-3xl text-red-400/60">!</div>
        <p class="text-sm text-red-400">{{ error }}</p>
        <el-button v-if="retryable" size="small" type="primary" plain @click="$emit('retry')">
          重试
        </el-button>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="isEmpty" class="async-state flex items-center justify-center py-16">
      <div class="text-center space-y-3">
        <div class="text-3xl text-white/20">—</div>
        <p class="text-sm text-white/40">{{ emptyText }}</p>
      </div>
    </div>

    <!-- Content -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  loading?: boolean
  error?: string | null
  isEmpty?: boolean
  loadingText?: string
  emptyText?: string
  retryable?: boolean
}>(), {
  loading: false,
  error: null,
  isEmpty: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  retryable: true
})

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.async-spinner {
  width: 32px;
  height: 32px;
  margin: 0 auto;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #02A7F0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
