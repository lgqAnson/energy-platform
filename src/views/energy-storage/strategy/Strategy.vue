<template>
  <div class="strategy-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />

    <div class="strategy-section-title">
      <img src="/images/登录日志/u79.png" class="section-title-bg" alt="" />
      <span class="section-title-text">策略运行情况</span>
    </div>

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
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import { energyStorageTabs } from '@/constants/navigation'
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
        effectData.value![i].actual = row.actual
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
