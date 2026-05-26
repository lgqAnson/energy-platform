<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :style="containerStyle" @click.stop>
          <!-- 标题栏 -->
          <div v-if="title || $slots.title" class="modal-header">
            <div class="modal-title">
              <span class="title-bar-icon"></span>
              <slot name="title">
                <span>{{ title }}</span>
              </slot>
            </div>
            <button v-if="showClose" class="modal-close" @click="handleClose">
              <img src="/icons/close.png" alt="关闭" class="modal-close-icon" />
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
    closeOnOverlay: false
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

/** 关闭弹窗并触发 update:visible 和 close 事件 */
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

/** 点击遮罩层时关闭弹窗（受 closeOnOverlay 属性控制） */
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
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: rgba(21, 20, 20, 0.4);
  border: 1px solid rgba(2, 167, 240, 0.25);
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  flex-shrink: 0;
  background-image: url('/images/popUpsTitleBg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.modal-title {
  font-size: 16px;
  font-weight: 400;
  color: #ffffff;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-bar-icon {
  display: inline-block;
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #FAAD14 0%, #F59E0B 100%);
  border-radius: 1px;
  flex-shrink: 0;
}

.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  opacity: 0.7;
}

.modal-close-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
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
