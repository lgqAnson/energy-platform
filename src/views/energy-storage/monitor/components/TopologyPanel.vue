<template>
  <div class="panel topology-panel">
    <div class="panel-header">
      <img src="" class="panel-header-bg" alt="" />
      <span class="panel-header-text">系统拓扑结构图</span>
    </div>
    <div class="topology-body">
      <div class="topo-level">
        <div class="topo-card top-level">
          <div class="topo-glow-border purple"></div>
          <div class="topo-card-inner">
            <div class="topo-icon-wrap">
              <CloudLightning class="topo-icon-lg" />
            </div>
            <div class="topo-name">电网关口点</div>
            <div class="topo-value">10kV</div>
            <div class="topo-desc">市电输入</div>
            <div class="topo-status"><span class="status-dot green"></span><span>运行正常</span></div>
          </div>
        </div>
      </div>
      <div class="topo-conn-wrap">
        <div class="topo-conn-line purple-glow">
          <div class="conn-arrow"></div>
        </div>
      </div>
      <div class="topo-level">
        <div class="topo-card top-level">
          <div class="topo-glow-border cyan"></div>
          <div class="topo-card-inner">
            <div class="topo-icon-wrap">
              <Zap class="topo-icon-lg" />
            </div>
            <div class="topo-name">站内并网点</div>
            <div class="topo-value">3.5MW</div>
            <div class="topo-desc">PCS并网柜</div>
            <div class="topo-status"><span class="status-dot green"></span><span>运行正常</span></div>
          </div>
        </div>
      </div>
      <div class="topo-conn-wrap branch">
        <div class="branch-horizontal">
          <div class="branch-segment group" v-for="n in 3" :key="n">
            <div class="topo-conn-line purple-glow short">
              <div class="conn-arrow"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="topo-level group-row">
        <div v-for="group in groups" :key="group.id" class="topo-card group-level">
          <div class="topo-glow-border blue"></div>
          <div class="topo-card-inner">
            <div class="topo-icon-wrap">
              <Plug class="topo-icon-md" />
            </div>
            <div class="topo-name">{{ group.id }}</div>
            <div class="topo-value-blue">{{ group.power }} / {{ group.capacity }}</div>
            <div class="topo-desc">{{ group.config }}</div>
            <div class="topo-status"><span class="status-dot green"></span><span>{{ group.status }}</span></div>
          </div>
        </div>
      </div>
      <div class="topo-conn-wrap branch-5">
        <div class="branch-horizontal-5">
          <div class="branch-segment block" v-for="n in 5" :key="n">
            <div class="topo-conn-line purple-glow short">
              <div class="conn-arrow"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="topo-level block-row">
        <div v-for="block in blocks" :key="block.id" class="topo-card block-level">
          <div class="topo-glow-border dim"></div>
          <div class="topo-card-inner">
            <div class="topo-icon-wrap">
              <Server class="topo-icon-sm" />
            </div>
            <div class="topo-name-sm">{{ block.name }}</div>
            <div class="topo-value-sm">{{ block.power }} / {{ block.capacity }}</div>
            <div class="topo-desc-xs">#{{ block.id }}-{{ block.group }}</div>
            <div class="topo-status"><span class="status-dot green"></span><span>{{ block.temperature }}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CloudLightning, Zap, Plug, Server } from 'lucide-vue-next'

defineProps<{
  groups: Array<{ id: string; power: string; capacity: string; config: string; status: string }>
  blocks: Array<{ id: string; name: string; power: string; capacity: string; group: string; temperature: string }>
}>()
</script>

<style scoped>
.panel {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%);
}

.panel-header {
  position: relative;
  height: 24px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.panel-header-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 200px;
  object-fit: fill;
}

.panel-header-text {
  position: relative;
  z-index: 10;
  font-size: 18px;
  font-weight: 700;
  padding-left: 12px;
  padding-right: 12px;
  font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif;
  color: #02A7F0;
  line-height: 23px;
}

.topology-panel {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topology-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  overflow-y: auto;
  overflow-x: auto;
  padding: 12px 0;
  background-image:
    linear-gradient(rgba(2, 167, 240, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(2, 167, 240, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 8px;
}

.topo-level {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.group-row {
  gap: 16px;
}

.block-row {
  gap: 10px;
  flex-wrap: wrap;
}

.topo-card {
  position: relative;
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.95) 0%, rgba(8, 18, 32, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.topo-glow-border {
  height: 3px;
  width: 100%;
  flex-shrink: 0;
}

.topo-glow-border.purple {
  background: linear-gradient(90deg, transparent, #a855f7, transparent);
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
}

.topo-glow-border.cyan {
  background: linear-gradient(90deg, transparent, #06b6d4, transparent);
  box-shadow: 0 0 8px rgba(6, 182, 212, 0.4);
}

.topo-glow-border.blue {
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.3);
}

.topo-glow-border.dim {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.topo-card-inner {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.top-level {
  width: 150px;
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 0 16px rgba(168, 85, 247, 0.1), 0 2px 10px rgba(0, 0, 0, 0.3);
}

.group-level {
  width: 110px;
}

.block-level {
  width: 95px;
  background: linear-gradient(145deg, rgba(15, 30, 52, 0.9) 0%, rgba(8, 18, 32, 0.9) 100%);
}

.topo-icon-wrap {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2px;
}

.topo-icon-lg {
  width: 22px;
  height: 22px;
}

.topo-icon-md {
  width: 18px;
  height: 18px;
}

.topo-icon-sm {
  width: 14px;
  height: 14px;
}

.topo-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.topo-name-sm {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.topo-value {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.topo-value-blue {
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
  line-height: 1.2;
}

.topo-value-sm {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}

.topo-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.topo-desc-xs {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.35);
}

.topo-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.green {
  background: #22c55e;
  box-shadow: 0 0 4px rgba(34, 197, 94, 0.5);
}

.topo-conn-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 28px;
}

.topo-conn-wrap.branch {
  height: 32px;
  width: 100%;
}

.topo-conn-wrap.branch-5 {
  height: 32px;
  width: 100%;
}

.topo-conn-line {
  position: relative;
  width: 2px;
  height: 28px;
  background: linear-gradient(180deg, #a855f7, #8b5cf6);
}

.topo-conn-line.short {
  height: 16px;
}

.topo-conn-line.purple-glow {
  box-shadow: 0 0 6px rgba(168, 85, 247, 0.5);
}

.conn-arrow {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #8b5cf6;
}

.branch-horizontal {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
}

.branch-horizontal-5 {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
}

.branch-segment {
  display: flex;
  justify-content: center;
}

.branch-segment.group {
  width: 110px;
}

.branch-segment.block {
  width: 95px;
}
</style>
