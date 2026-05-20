<template>
  <div class="panel topology-panel">
    <div class="panel-header">
      <img src='' class="panel-header-bg" alt="" />
      <span class="panel-header-text">拓扑结构图</span>
    </div>
    <div class="topology-body">
      <div class="topo-level" v-for="(level, index) in levels" :key="level.name">
        <div class="topo-card" :class="level.className">
          <div class="topo-glow-border" :class="level.glowColor"></div>
          <div class="topo-card-inner">
            <div class="topo-icon-wrap">
              <component :is="level.icon" class="topo-icon" :class="level.iconSize" />
            </div>
            <div class="topo-name">{{ level.name }}</div>
            <div class="topo-value" v-if="level.value">{{ level.value }}</div>
            <div class="topo-desc" v-if="level.desc">{{ level.desc }}</div>
            <div class="topo-status" v-if="level.status">
              <span class="status-dot green"></span>
              <span>{{ level.status }}</span>
            </div>
          </div>
        </div>
        <!-- 连接线（除了最后一个层级） -->
        <div v-if="index < levels.length - 1" class="topo-conn-wrap">
          <div class="topo-conn-line purple-glow">
            <div class="conn-arrow"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Zap,
  ShieldCheck,
  Server,
  Cpu,
  Layers,
  Sun
} from 'lucide-vue-next'

const levels = [
  { name: '电网并网点', value: '10kV', desc: '市电接入', status: '运行正常', icon: Zap, iconSize: 'topo-icon-lg', className: 'top-level', glowColor: 'purple' },
  { name: '站内高压设备', value: '35kV', desc: '高压配电', status: '运行正常', icon: ShieldCheck, iconSize: 'topo-icon-lg', className: 'top-level', glowColor: 'cyan' },
  { name: '箱变', value: '2.5MVA', desc: '箱式变压器', status: '运行正常', icon: Server, iconSize: 'topo-icon-md', className: 'mid-level', glowColor: 'blue' },
  { name: '逆变器', value: '1250kW', desc: '光伏逆变器', status: '运行正常', icon: Cpu, iconSize: 'topo-icon-md', className: 'mid-level', glowColor: 'blue' },
  { name: '汇流箱', value: '16进1出', desc: '直流汇流', status: '运行正常', icon: Layers, iconSize: 'topo-icon-sm', className: 'low-level', glowColor: 'dim' },
  { name: '光伏组串', value: '28组', desc: '组件阵列', status: '运行正常', icon: Sun, iconSize: 'topo-icon-sm', className: 'low-level', glowColor: 'dim' }
]
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
  padding: 12px 0;
  background-image:
    linear-gradient(rgba(2, 167, 240, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(2, 167, 240, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 8px;
}

.topo-level {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

.mid-level {
  width: 130px;
}

.low-level {
  width: 110px;
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

.topo-value {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.topo-desc {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
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
  height: 20px;
}

.topo-conn-line {
  position: relative;
  width: 2px;
  height: 20px;
  background: linear-gradient(180deg, #a855f7, #8b5cf6);
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
</style>
