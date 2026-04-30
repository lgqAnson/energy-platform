<template>
  <div
    v-if="visible"
    class="connection-status-bar"
    :class="`status-${status}`"
  >
    <span class="status-dot" />
    <span class="status-text">{{ statusText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionStatus } from '@/composables/useConnectionStatus'

const { status } = useConnectionStatus()

const visible = computed(() => status.value !== 'open')

const statusText = computed(() => {
  switch (status.value) {
    case 'connecting': return '正在连接实时数据...'
    case 'closed': return '实时数据连接已断开，正在重连...'
    case 'error': return '实时数据连接异常'
    default: return ''
  }
})
</script>

<style scoped>
.connection-status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 16px;
  font-size: 13px;
  color: #fff;
  transition: opacity 0.3s;
}

.status-connecting {
  background: rgba(250, 173, 20, 0.9);
}

.status-closed {
  background: rgba(250, 173, 20, 0.9);
}

.status-error {
  background: rgba(255, 77, 79, 0.9);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
