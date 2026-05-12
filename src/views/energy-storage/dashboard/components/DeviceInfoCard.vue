<template>
  <div class="device-info-card">
    <div class="device-header">
      <span class="device-code">{{ deviceCode }}</span>
    </div>
    <div class="device-body">
      <div class="info-row">
        <span class="info-label">运行状态</span>
        <span class="info-value" :class="status === '正常' ? 'status-normal' : 'status-alert'">
          {{ status }}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">额定容量</span>
        <span class="info-value">{{ capacity }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">所属区域</span>
        <span class="info-value">{{ area }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">运行时间</span>
        <span class="info-value">{{ operateTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    deviceCode?: string
    status?: string
    capacity?: string
    area?: string
    operateTime?: string
  }>(),
  {
    deviceCode: 'R251205J0055',
    status: '正常',
    capacity: '200Wh',
    area: 'G12',
    operateTime: '2026年1月3日'
  }
)
</script>

<style scoped>
.device-info-card {
  background: linear-gradient(145deg, rgba(18, 34, 58, 0.9) 0%, rgba(10, 22, 40, 0.9) 100%);
  border: 1px solid rgba(2, 167, 240, 0.2);
  border-radius: 10px;
  overflow: hidden;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.03),
    0 2px 10px rgba(0, 0, 0, 0.35);
}

.device-header {
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  border-bottom: 1px solid rgba(245, 158, 11, 0.15);
}

.device-code {
  letter-spacing: 0.5px;
}

.device-body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.info-label {
  color: rgba(255, 255, 255, 0.45);
}

.info-value {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.status-normal {
  color: #22c55e;
}

.status-alert {
  color: #ef4444;
}
</style>
