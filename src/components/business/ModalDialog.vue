<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :style="containerStyle" @click.stop>
          <!-- 标题栏 -->
          <div v-if="title || $slots.title" class="modal-header">
            <div class="modal-title">
              <slot name="title">
                <span>{{ title }}</span>
              </slot>
            </div>
            <button v-if="showClose" class="modal-close" @click="handleClose">
              <X />
            </button>
          </div>

          <!-- 主体 -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- 底部 -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    width?: string
    showClose?: boolean
    closeOnOverlay?: boolean
  }>(),
  {
    width: '720px',
    showClose: true,
    closeOnOverlay: true
  }
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  close: []
}>()

const containerStyle = computed(() => ({
  width: props.width,
  maxWidth: '90vw'
}))

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(180deg, rgba(16, 30, 50, 0.98) 0%, rgba(10, 22, 40, 0.98) 100%);
  border: 1px solid rgba(129, 211, 248, 0.15);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(129, 211, 248, 0.1);
  flex-shrink: 0;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(129, 211, 248, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.96);
  opacity: 0;
}
</style>
