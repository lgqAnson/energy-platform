<template>
  <div
    class="panel-card"
    :class="customClass"
    :style="cardStyle"
  >
    <div v-if="title || $slots.header" class="panel-header-bar">
      <img
        v-if="headerBg"
        :src="headerBg"
        class="header-bg"
        alt=""
      />
      <div class="header-content">
        <slot name="header">
          <span class="header-title">{{ title }}</span>
        </slot>
      </div>
    </div>
    <div class="panel-body" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title?: string
    headerBg?: string
    customClass?: string
    height?: string
    minHeight?: string
    width?: string
    bgImage?: string
  }>(),
  {
    headerBg: '/images/登录日志/u79.png'
  }
)

const cardStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.height) style.height = props.height
  if (props.width) style.width = props.width
  return style
})

const bodyStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.minHeight) style.minHeight = props.minHeight
  if (props.bgImage) {
    style.backgroundImage = `url(${props.bgImage})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }
  return style
})
</script>

<style scoped>
.panel-card {
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
  box-shadow: 7px 5px 2.5px rgba(36, 71, 102, 0.6);
}

.panel-header-bar {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
  flex-shrink: 0;
}

.header-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
}

.header-content {
  position: relative;
  z-index: 1;
  padding-left: 16px;
}

.header-title {
  font-size: 15px;
  font-weight: 700;
  color: #02A7F0;
}

.panel-body {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>
