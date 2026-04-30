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
            <td class="text-red">{{ row.chargeCost }}</td>
            <td>{{ row.dischargePrice }}</td>
            <td>{{ row.dischargeQty }}</td>
            <td class="text-green">{{ row.dischargeIncome }}</td>
            <td :class="row.netProfit.startsWith('-') ? 'text-red' : 'text-green'">{{ row.netProfit }}</td>
          </tr>
          <tr class="total-row">
            <td><strong>合计</strong></td>
            <td>-</td>
            <td><strong>4,380.25</strong></td>
            <td class="text-red"><strong>15,330.88</strong></td>
            <td>-</td>
            <td><strong>4,380.25</strong></td>
            <td class="text-green"><strong>11,922.40</strong></td>
            <td class="text-green"><strong>11,922.40</strong></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'weekday', label: '平日' },
  { key: 'special', label: '特殊日期' }
]
const activeTab = ref('all')

interface RevenueRow {
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

const allData: RevenueRow[] = [
  { tag: '尖', tagBg: 'rgba(255,107,53,0.2)', tagColor: '#FF6B35', time: '11:00 - 12:00', chargePrice: '1.43', chargeQty: '1,240.50', chargeCost: '6,822.75', dischargePrice: '1.43', dischargeQty: '3,850.20', dischargeIncome: '21,176.10', netProfit: '14,353.35' },
  { tag: '峰', tagBg: 'rgba(255,77,77,0.2)', tagColor: '#FF4D4D', time: '10:00 - 11:00, 14:00 - 19:00', chargePrice: '1.15', chargeQty: '2,860.30', chargeCost: '14,301.50', dischargePrice: '1.15', dischargeQty: '7,920.45', dischargeIncome: '39,602.25', netProfit: '25,300.75' },
  { tag: '平', tagBg: 'rgba(74,158,255,0.2)', tagColor: '#4A9EFF', time: '08:00 - 10:00, 12:00 - 14:00, 19:00 - 23:59', chargePrice: '0.68', chargeQty: '1,520.80', chargeCost: '6,083.20', dischargePrice: '0.68', dischargeQty: '2,980.60', dischargeIncome: '11,922.40', netProfit: '5,839.20' },
  { tag: '谷', tagBg: 'rgba(74,158,255,0.2)', tagColor: '#4A9EFF', time: '00:00 - 08:00', chargePrice: '0.27', chargeQty: '4,380.25', chargeCost: '15,330.88', dischargePrice: '0.27', dischargeQty: '1,250.30', dischargeIncome: '5,626.35', netProfit: '-9,704.53' }
]

/**
 * 根据当前标签页筛选显示收益数据
 * 'all' → 全部，'weekday' → 前三条，'special' → 第二条
 */
const currentData = computed(() => {
  if (activeTab.value === 'all') return allData
  if (activeTab.value === 'weekday') return allData.slice(0, 3)
  return allData.slice(1, 2)
})
</script>
<style scoped>
.revenue-table-section { display: flex; flex-direction: column; gap: 12px; }
.table-tabs { display: flex; gap: 2px; }
.tab-btn { padding: 6px 20px; border-radius: 4px 4px 0 0; font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5); background: transparent; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { color: #fff; background: rgba(2,167,240,0.15); border-bottom-color: #02A7F0; }
.tab-btn:hover:not(.active) { color: rgba(255,255,255,0.8); }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; }
.data-table th { padding: 10px 6px; text-align: center; font-weight: 600; color: #02A7F0; background: rgba(2,167,240,0.1); border: 1px solid rgba(129,211,248,0.12); white-space: normal; line-height: 1.4; word-break: break-word; }
.data-table td { padding: 10px 6px; text-align: center; color: rgba(255,255,255,0.85); border: 1px solid rgba(129,211,248,0.06); }
.data-table tbody tr:hover { background: rgba(2,167,240,0.04); }
.time-cell { display: flex; align-items: center; gap: 6px; justify-content: flex-start; padding-left: 8px; }
.time-tag { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; font-size: 11px; font-weight: 600; flex-shrink: 0; }
.time-range { font-size: 12px; color: rgba(255,255,255,0.7); text-align: left; }
.text-red { color: #FF6B6B; }
.text-green { color: #4CAF50; }
.total-row { background: rgba(2,167,240,0.06); }
.total-row td { color: #fff; font-weight: 600; }
</style>
