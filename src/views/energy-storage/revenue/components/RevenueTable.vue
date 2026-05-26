<template>
  <div class="revenue-table-section">
    <div class="table-tabs">
      <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }}</button>
    </div>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>时段</th>
            <th>充电电价(元/kWh)</th>
            <th>充电电量(kWh)</th>
            <th>充电成本(元)</th>
            <th>放电电价(元/kWh)</th>
            <th>放电电量(kWh)</th>
            <th>放电收益(元)</th>
            <th>净收益</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in currentData" :key="idx">
            <td>
              <div class="time-cell">
                <span class="time-tag" :style="{ background: row.tagBg, color: row.tagColor }">{{ row.tag }}</span>
                <span class="time-range">{{ row.time }}</span>
              </div>
            </td>
            <td>{{ row.chargePrice }}</td>
            <td>{{ row.chargeQty }}</td>
            <td class="text-red">{{'¥ '+row.chargeCost }}</td>
            <td>{{ row.dischargePrice }}</td>
            <td>{{ row.dischargeQty }}</td>
            <td class="text-green">{{ '¥ '+row.dischargeIncome }}</td>
            <td class="text-purple">{{ '¥ '+row.netProfit }}</td>
          </tr>
          <tr class="total-row">
            <td><strong>合计</strong></td>
            <td>-</td>
            <td><strong>{{ totals.chargeQty }}</strong></td>
            <td class="text-red"><strong>{{ '¥ '+totals.chargeCost }}</strong></td>
            <td>-</td>
            <td><strong>{{ totals.dischargeQty }}</strong></td>
            <td class="text-green"><strong>{{ '¥ '+totals.dischargeIncome }}</strong></td>
            <td class="text-purple"><strong>{{ '¥ '+totals.netProfit }}</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

export interface RevenueRow {
  tag: string
  tagBg: string
  tagColor: string
  time: string
  chargePrice: string
  chargeQty: string
  chargeCost: string
  dischargePrice: string
  dischargeQty: string
  dischargeIncome: string
  netProfit: string
}

const props = defineProps<{ data: RevenueRow[] }>()

defineExpose({ allData: computed(() => props.data) })

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'weekday', label: '平日' },
  { key: 'special', label: '特殊日期' }
]
const activeTab = ref('all')

const currentData = computed(() => {
  const d = props.data ?? []
  if (activeTab.value === 'all') return d
  if (activeTab.value === 'weekday') return d.slice(0, 3)
  return d.slice(1, 2)
})

/** 汇总当前显示数据的数值列（去除千分位逗号后转为数字累加，保留2位小数） */
const totals = computed(() => {
  const rows = currentData.value
  /** 解析并累加指定字段（处理千分位逗号如 '1,240.50'） */
  const sum = (key: keyof RevenueRow) =>
    rows.reduce((acc, r) => acc + parseFloat((r[key] as string || '0').replace(/,/g, '')), 0).toFixed(2)
  return {
    chargeQty: sum('chargeQty'),
    chargeCost: sum('chargeCost'),
    dischargeQty: sum('dischargeQty'),
    dischargeIncome: sum('dischargeIncome'),
    netProfit: sum('netProfit')
  }
})
</script>
<style scoped>
.revenue-table-section { display: flex; flex-direction: column; gap: 12px; }
.table-tabs {
  display: flex;
  gap: 2px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  padding: 3px;
  border-radius: 4px;
}
.tab-btn { padding: 5px 14px; border-radius: 3px; font-size: 13px; color: rgba(255,255,255,0.6); background: transparent; background-image: url('/images/tabDefaultBg.png'); background-size: 100% 100%; background-repeat: no-repeat; border: none; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { background-image: url('/images/tabSeletedBg.png'); color: #fff; }
.tab-btn:hover:not(.active) { color: rgba(255,255,255,0.8); }
.table-wrapper { overflow-x: auto; }
/* data-table 基础样式已提取至全局 src/assets/index.css，此处仅保留组件特有覆盖 */
.data-table { table-layout: auto; width: 100%; }
.data-table thead { border: 2px solid rgba(255,255,255,0.2); border-radius: 4px; }
.data-table th { font-size: 16px; padding: 10px 6px; color: #fff; background: rgba(255,255,255,0.08); white-space: nowrap; font-weight: 500; text-align: left; }
.data-table th:first-child { white-space: normal; word-break: break-word; width: 100%; min-width: 320px; }
.data-table td { font-size: 16px; padding: 10px 6px; white-space: nowrap; text-align: left; }
.data-table td:first-child { white-space: normal; word-break: break-all; width: 100%; min-width: 320px; }
.time-cell { display: flex; align-items: center; gap: 6px; justify-content: flex-start; padding-left: 8px; }
.time-tag { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.time-range { font-size: 16px; color: rgba(255,255,255,0.7); text-align: left; white-space: normal; word-break: break-all; }
.text-red { color: #FF8A3D; }
.text-green { color: #1DE9B6; }
.text-purple { color: #7C5CFF;}
.total-row { background: rgba(2,167,240,0.06); }
/* .total-row td { color: #fff; font-weight: 600; } */
</style>
