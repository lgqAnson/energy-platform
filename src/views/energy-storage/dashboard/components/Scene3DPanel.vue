<template>
  <div class="panel scene3d-panel">
    <div class="panel-body scene-panel-body" @click="handleSceneClick">
      <img src="/images/储能-可视看板/u3492.svg" class="panel-bg-img" alt="" />
      <div class="scene-overlay">
        <div
          v-for="anchor in anchors"
          :key="anchor.id"
          class="scene-anchor"
          :class="{ active: activeAnchorId === anchor.id }"
          :style="{ top: anchor.top, left: anchor.left }"
          @click.stop="handleAnchorClick(anchor.id)"
        >
          <div class="anchor-pin" :class="{ active: activeAnchorId === anchor.id }">
            <img
              class="anchor-icon"
              :src="anchor.status === '正常' ? '/icons/normal.png' : '/icons/alert.png'"
              alt=""
            />
            <div class="anchor-pulse"></div>
          </div>
          <transition name="popup">
            <div v-if="activeAnchorId === anchor.id" class="anchor-popup">
              <div class="popup-header">{{ anchor.deviceCode }}</div>
              <div class="popup-body">
                <div class="popup-row">
                  <span class="popup-label">运行状态</span>
                  <span class="popup-value" :class="anchor.status === '正常' ? 'status-normal' : 'status-alert'">
                    {{ anchor.status }}
                  </span>
                </div>
                <div class="popup-row">
                  <span class="popup-label">额定容量</span>
                  <span class="popup-value">{{ anchor.capacity }}</span>
                </div>
                <div class="popup-row">
                  <span class="popup-label">所属区域</span>
                  <span class="popup-value">{{ anchor.area }}</span>
                </div>
                <div class="popup-row">
                  <span class="popup-label">运行时间</span>
                  <span class="popup-value">{{ anchor.operateTime }}</span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface AnchorInfo {
  id: string
  top: string
  left: string
  deviceCode: string
  status: string
  capacity: string
  area: string
  operateTime: string
}

const anchors = ref<AnchorInfo[]>([
  { id: '1', top: '32%', left: '23%', deviceCode: 'R251205J0055', status: '正常', capacity: '200Wh', area: 'G12', operateTime: '2026年1月3日' },
  { id: '2', top: '44%', left: '30%', deviceCode: 'R251205J0056', status: '正常', capacity: '300Wh', area: 'G13', operateTime: '2026年1月5日' },
  { id: '3', top: '60%', left: '39%', deviceCode: 'R251205J0057', status: '告警', capacity: '150Wh', area: 'G14', operateTime: '2026年1月8日' },
  { id: '4', top: '53%', left: '54%', deviceCode: 'R251205J0058', status: '告警', capacity: '150Wh', area: 'G15', operateTime: '2026年1月9日' },
  { id: '5', top: '46%', left: '66%', deviceCode: 'R251205J0059', status: '告警', capacity: '150Wh', area: 'G16', operateTime: '2026年1月13日' },
  { id: '6', top: '48%', left: '81%', deviceCode: 'R251205J0060', status: '告警', capacity: '150Wh', area: 'G17', operateTime: '2026年1月21日' }
])

const activeAnchorId = ref<string | null>(null)

/**
 * 点击场景锚点切换弹窗显示
 * 同一锚点再次点击关闭弹窗，不同锚点切换弹窗
 * @param id 锚点 ID
 */
const handleAnchorClick = (id: string) => {
  activeAnchorId.value = activeAnchorId.value === id ? null : id
}

/**
 * 点击非锚点区域时关闭所有弹窗
 * @param e 鼠标点击事件
 */
const handleSceneClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.scene-anchor') && !target.closest('.anchor-popup')) {
    activeAnchorId.value = null
  }
}
</script>

<style scoped>
.panel {
  background: linear-gradient(180deg, rgba(22, 43, 131, 0) 0%, rgba(22, 43, 131, 0.15) 100%);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}
.panel::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #106AFF;
  border-radius: 0 0 8px 8px;
  pointer-events: none;
}
.scene3d-panel {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  min-height: 0;
}

.panel-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scene-panel-body {
  position: relative;
  overflow: hidden;
  width: 100%;
  flex: 1;
  min-height: 0;
  cursor: pointer;
}

.scene-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.scene-anchor {
  position: absolute;
  transform: translate(-50%, -100%);
  cursor: pointer;
  z-index: 3;
}

.scene-anchor.active {
  z-index: 10;
}

.anchor-pin {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.6));
  transition: transform 0.2s ease;
}

.anchor-pin:hover,
.anchor-pin.active {
  transform: scale(1.2);
}

.anchor-icon {
  width: 46px;
  height: 46px;
  position: relative;
  z-index: 2;
  object-fit: contain;
}

.anchor-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.25);
  animation: anchorPulse 2s ease-out infinite;
  z-index: 1;
}

@keyframes anchorPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.anchor-popup {
  position: absolute;
  bottom: auto;
  left: 70%;
  transform: translateY(-50%);
  margin-left: 12px;
  min-width: 190px;
  background: rgba(10, 22, 40, 0.6);
  /* border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 8px rgba(245, 158, 11, 0.15); */
  overflow: hidden;
  z-index: 10;
}

.anchor-popup::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/CoordinatePop-up@2x .png') no-repeat center / cover;
  opacity: 0.65;
  z-index: -1;
}

.popup-header {
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.popup-body {
  padding: 0 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.popup-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.popup-label {
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
}

.popup-value {
  color: #ffffff;
  font-weight: 600;
}

.status-normal {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #22c55e;
  font-size: 11px;
  font-weight: 600;
}

.status-alert {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  font-size: 11px;
  font-weight: 600;
}

.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
}
</style>
