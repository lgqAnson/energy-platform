<template>
  <div class="strategy-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />

    <div class="strategy-section-title">
      <img src="/images/登录日志/u79.png" class="section-title-bg" alt="" />
      <span class="section-title-text">策略运行情况</span>
    </div>

    <div class="strategy-main">
      <StrategyExecutionChart @manage="openStrategyDialog" />
      <StrategyEffectTable :data="effectData" />
    </div>

    <!-- 策略管理弹窗 -->
    <StrategyManageDialog
      v-model:visible="strategyDialogVisible"
      :list="strategyList"
      :trace="traceData"
      @add="onAddStrategy"
      @edit="onEditStrategy"
      @delete="onDeleteStrategy"
      @view="onViewStrategy"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { energyStorageTabs } from '@/constants/navigation'
import StrategyExecutionChart from './components/StrategyExecutionChart.vue'
import StrategyEffectTable from './components/StrategyEffectTable.vue'
import StrategyManageDialog from './components/StrategyManageDialog.vue'

defineProps<{ embedded?: boolean }>()

const effectData = ref([
  { time: '00:00 - 08:00', plan: '1,000 kWh', actual: '985 kWh', deviation: '-1.5%', suggestion: '放电时段可提前30分钟' },
  { time: '08:00 - 10:00', plan: '950 kWh', actual: '912 kWh', deviation: '-4.0%', suggestion: '需调整SOC下限设置' },
  { time: '10:00 - 11:00', plan: '1,100 kWh', actual: '1,089 kWh', deviation: '-1.0%', suggestion: '策略执行优秀' },
  { time: '11:00 - 12:00', plan: '800 kWh', actual: '752 kWh', deviation: '-6.0%', suggestion: '检查设备可用容量' },
  { time: '12:00 - 14:00', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
  { time: '14:00 - 19:00', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
  { time: '19:00 - 23:59', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' }
])

// WebSocket 实时数据订阅（5s）
useRealtimeChannel('strategy', (payload) => {
  if (payload.effectData) {
    payload.effectData.forEach((row: any, i: number) => {
      if (effectData.value[i]) {
        effectData.value[i].actual = row.actual
        effectData.value[i].deviation = row.deviation
        effectData.value[i].suggestion = row.suggestion
      }
    })
  }
})

// ===== 策略管理弹窗 =====
const strategyDialogVisible = ref(false)

/** 打开策略管理弹窗 */
function openStrategyDialog() {
  strategyDialogVisible.value = true
}

const strategyList = ref([
  { name: '峰谷策略V3', type: '日常策略', creator: '张工', createTime: '2024-03-10 14:20', status: 'enabled' as const },
  { name: '节假日模板', type: '节假日策略', creator: '系统', createTime: '2024-01-15 09:10', status: 'disabled' as const },
  { name: '需量控制', type: '特殊日策略', creator: '李工', createTime: '2024-03-01 11:30', status: 'enabled' as const },
  { name: '春节特别策略', type: '节假日策略', creator: '王工', createTime: '2024-02-05 16:45', status: 'enabled' as const },
  { name: '国庆保电策略', type: '特殊日策略', creator: '赵工', createTime: '2023-09-25 10:20', status: 'disabled' as const }
])

/** 新增策略（TODO: 打开新增策略表单） */
function onAddStrategy() {
  // TODO: 打开新增策略表单
}

/**
 * 编辑指定索引的策略
 * @param index 策略在列表中的索引
 */
function onEditStrategy(index: number) {
  // TODO: 打开编辑策略表单
  console.log('edit', index)
}

/**
 * 删除指定索引的策略
 * @param index 策略在列表中的索引
 */
function onDeleteStrategy(index: number) {
  strategyList.value.splice(index, 1)
}

/**
 * 查看指定索引的策略详情
 * @param index 策略在列表中的索引
 */
function onViewStrategy(index: number) {
  // TODO: 打开查看策略表单
  console.log('view', index)
}

const traceData = {
  name: '峰谷策略V3',
  currentVersion: 'V3 (2026-03-10 14:20)',
  versions: [
    {
      label: '版本3 (当前)',
      isCurrent: true,
      time: '2026-03-10 14:20',
      operator: '张工',
      changes: [
        '放电功率: 180kW → 200kW',
        '需量管理阈值: 750kW → 800kW'
      ]
    },
    {
      label: '版本2',
      isCurrent: false,
      operator: '王工',
      changes: [
        'SOC下限: 15% → 20%',
        '启用防逆流控制'
      ]
    }
  ]
}
</script>

<style scoped>
.strategy-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.strategy-section-title {
  position: relative;
  height: 28px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.section-title-bg {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 220px;
  object-fit: fill;
}

.section-title-text {
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

.strategy-main {
  display: flex;
  gap: 16px;
  height: calc(100vh - 200px);
  min-height: 480px;
}
</style>
