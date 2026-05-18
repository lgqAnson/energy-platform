<template>
  <div class="strategy-container">
    <div class="strategy-main">
      <StrategyExecutionChart @manage="openStrategyDialog" />
      <StrategyEffectTable :data="effectData ?? []" />
    </div>

    <!-- 策略管理弹窗 -->
    <StrategyManageDialog
      v-model:visible="strategyDialogVisible"
      :list="strategyList ?? []"
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
import { useApiData } from '@/composables/useApiData'
import { getMockStrategyEffectData, getMockStrategyList } from '@/mocks/providers/energyStorage'
import { energyStorageApi } from '@/api/api'
import { ElMessage } from 'element-plus'
import StrategyExecutionChart from './components/StrategyExecutionChart.vue'
import StrategyEffectTable from './components/StrategyEffectTable.vue'
import type { EffectRow } from './components/StrategyEffectTable.vue'
import StrategyManageDialog from './components/StrategyManageDialog.vue'

defineProps<{ embedded?: boolean }>()

const { data: effectData } = useApiData<EffectRow[]>(
  getMockStrategyEffectData,
  () => energyStorageApi.getStrategyEffect().then(r => r.data as unknown as EffectRow[])
)

useRealtimeChannel('strategy', (payload) => {
  const data = payload as Record<string, unknown>
  if (data.effectData && effectData.value) {
    (data.effectData as EffectRow[]).forEach((row, i) => {
      if (effectData.value![i]) {
        effectData.value![i].planCharge = row.planCharge
        effectData.value![i].actualCharge = row.actualCharge
        effectData.value![i].planDischarge = row.planDischarge
        effectData.value![i].actualDischarge = row.actualDischarge
        effectData.value![i].deviation = row.deviation
        effectData.value![i].suggestion = row.suggestion
      }
    })
  }
})

const strategyDialogVisible = ref(false)

function openStrategyDialog() {
  strategyDialogVisible.value = true
}

/** 策略列表项类型 */
interface StrategyItem {
  id?: string
  name: string
  type: string
  creator: string
  createTime: string
  status: 'enabled' | 'disabled'
}

const { data: strategyList, execute: refreshStrategyList } = useApiData<StrategyItem[]>(
  getMockStrategyList,
  () => energyStorageApi.getStrategyList().then(r => r.data as unknown as StrategyItem[])
)

function onAddStrategy() {
  ElMessage.info('新增策略功能开发中')
}

function onEditStrategy(index: number) {
  ElMessage.info('编辑策略功能开发中')
}

async function onDeleteStrategy(index: number) {
  const item = strategyList.value?.[index]
  if (!item) return
  try {
    await energyStorageApi.deleteStrategy(item.id ?? item.name)
    strategyList.value!.splice(index, 1)
    ElMessage.success('策略已删除')
  } catch {
    strategyList.value!.splice(index, 1)
  }
}

function onViewStrategy(index: number) {
  const item = strategyList.value?.[index]
  if (item?.id) {
    energyStorageApi.getStrategyDetail(item.id)
  }
}

const traceData = {
  name: '峰谷策略V3',
  currentVersion: 'V3 (2026-03-10 14:20)',
  versions: [
    {
      label: '版本3（当前）',
      isCurrent: true,
      time: '2026-03-10 14:20',
      operator: '张工',
      changeItems: [
        '放电功率: 1800KW → 2000KW',
        '需量管理阈值: 750KW → 800KW'
      ]
    },
    {
      label: '版本2',
      time: '2025-12-05 09:15',
      operator: '王工',
      changeItems: [
        'SOC下限: 15% → 20%',
        '启用防逆流控制'
      ]
    },
    {
      label: '版本1.5',
      time: '2025-08-18 16:40',
      operator: '李工',
      changeItems: [
        '充电功率上限调整至 1500KW',
        '新增谷时段优先策略'
      ]
    },
    {
      label: '版本1',
      time: '2024-06-22 11:00',
      operator: '陈工',
      changeItems: [
        '放电功率: 160kW → 180kW',
        '优化峰谷时段划分'
      ]
    },
    {
      label: '版本1（初始）',
      isInitial: true,
      createTime: '2024-01-10 11:30',
      creator: '系统',
      changeItems: [
        '初始策略配置',
        '充电功率: 150kW / 放电功率: 180kW',
        'SOC范围: 20% ~ 95%'
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

.strategy-main {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
  min-height: 520px;
}
</style>
