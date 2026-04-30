<template>
        <div class="panel scene3d-panel">
          <!-- <div class="panel-header-bar">
            <img src="/images/登录日志/u79.png" class="header-bg" alt="" />
            <span class="header-title">3D 园区场景</span>
          </div> -->
          <div class="panel-body scene-panel-body" @click="handleSceneClick">
            <img src="/images/储能-可视看板/u3492.svg" class="panel-bg-img" alt="" />
            <div class="scene-overlay">
              <div
                v-for="anchor in anchors"
                :key="anchor.id"
                class="scene-anchor"
                :style="{ top: anchor.top, left: anchor.left }"
                @click.stop="handleAnchorClick(anchor.id)"
              >
                <div class="anchor-pin" :class="{ active: activeAnchorId === anchor.id }">
                  <MapPin class="anchor-icon" />
                  <div class="anchor-pulse"></div>
                </div>
                <transition name="popup">
                  <div
                    v-if="activeAnchorId === anchor.id"
                    class="anchor-popup"
                  >
                    <div class="popup-header">{{ anchor.deviceCode }}</div>
                    <div class="popup-body">
                      <div class="popup-row">
                        <span class="popup-label">运行状态:</span>
                        <span class="popup-value" :class="anchor.status === '正常' ? 'status-normal' : 'status-alert'">
                          {{ anchor.status }}
                        </span>
                      </div>
                      <div class="popup-row">
                        <span class="popup-label">装机容量:</span>
                        <span class="popup-value">{{ anchor.capacity }}</span>
                      </div>
                      <div class="popup-row">
                        <span class="popup-label">所属区域:</span>
                        <span class="popup-value">{{ anchor.area }}</span>
                      </div>
                      <div class="popup-row">
                        <span class="popup-label">投运时间:</span>
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
import { MapPin } from 'lucide-vue-next'

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
  { id: '1', top: '28%', left: '42%', deviceCode: 'R251205J0055', status: '正常', capacity: '200Wh', area: 'G12', operateTime: '2026年1月3日' },
  { id: '2', top: '35%', left: '52%', deviceCode: 'R251205J0056', status: '正常', capacity: '300Wh', area: 'G13', operateTime: '2026年1月5日' },
  { id: '3', top: '22%', left: '58%', deviceCode: 'R251205J0057', status: '告警', capacity: '150Wh', area: 'G14', operateTime: '2026年1月8日' }
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
.panel-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.scene3d-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
}
.scene-panel-body {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1470 / 632;
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
.anchor-pin {
  position: relative;
  width: 28px;
  height: 28px;
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
  width: 24px;
  height: 24px;
  position: relative;
  z-index: 2;
}
.anchor-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.25);
  animation: anchorPulse 2s ease-out infinite;
  z-index: 1;
}
.anchor-popup {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  min-width: 180px;
  background: linear-gradient(145deg, rgba(20, 36, 60, 0.96) 0%, rgba(10, 22, 40, 0.96) 100%);
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 8px rgba(245, 158, 11, 0.15);
  overflow: hidden;
  z-index: 10;
}
.anchor-popup::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #f59e0b, transparent);
}
.popup-header {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  border-bottom: 1px solid rgba(245, 158, 11, 0.15);
}
.popup-body {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.popup-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.popup-label {
  color: rgba(255, 255, 255, 0.45);
  white-space: nowrap;
}
.popup-value {
  color: rgba(255, 255, 255, 0.85);
}
.status-normal {
  color: #22c55e;
}
.status-alert {
  color: #ef4444;
}
</style>
