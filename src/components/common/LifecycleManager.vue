<template>
  <div class="space-y-4">
    <!-- 查看模式：显示时间线 -->
    <template v-if="displayMode === 'view'">
      <div class="flex items-center justify-between">
        <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">全生命周期管理</h4>
        <button v-if="mode !== 'view'" @click="displayMode = 'edit'"
          class="px-5 py-1.5 text-sm bg-primary hover:bg-primary/80 text-white rounded transition-colors">
          编辑
        </button>
      </div>
      <div class="space-y-0 max-h-[400px] overflow-y-auto pr-2 lifecycle-timeline">
        <!-- 建档 -->
        <div class="flex gap-3">
          <div class="flex flex-col items-center pt-0.5">
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              hasFiling ? 'border-primary bg-primary/20' : 'border-white/30'
            ]">
              <Check v-if="hasFiling" class="w-3 h-3 text-primary" />
            </div>
            <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
          </div>
          <div class="flex-1 pb-4">
            <h5 :class="['text-sm font-bold mb-2', hasFiling ? 'text-primary' : 'text-white/70']">建档</h5>
            <div class="space-y-1 text-xs text-white/60">
              <p>建档日期: {{ records.filing.date || '-' }}</p>
              <p>建档人: {{ records.filing.person || '-' }}</p>
            </div>
          </div>
        </div>
        <!-- 投运 -->
        <div class="flex gap-3">
          <div class="flex flex-col items-center pt-0.5">
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              hasCommission ? 'border-primary bg-primary/20' : 'border-white/30'
            ]">
              <Check v-if="hasCommission" class="w-3 h-3 text-primary" />
            </div>
            <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
          </div>
          <div class="flex-1 pb-4">
            <h5 :class="['text-sm font-bold mb-2', hasCommission ? 'text-primary' : 'text-white/70']">投运</h5>
            <div class="space-y-1 text-xs text-white/60">
              <p>并网日期: {{ records.commission.gridDate || '-' }}</p>
              <p>投运日期: {{ records.commission.commissionDate || '-' }}</p>
              <p>负责人: {{ records.commission.person || '-' }}</p>
            </div>
          </div>
        </div>
        <!-- 变更 -->
        <div class="flex gap-3">
          <div class="flex flex-col items-center pt-0.5">
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              hasChanges ? 'border-primary bg-primary/20' : 'border-white/30'
            ]">
              <Check v-if="hasChanges" class="w-3 h-3 text-primary" />
            </div>
            <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
          </div>
          <div class="flex-1 pb-4">
            <h5 :class="['text-sm font-bold mb-2', hasChanges ? 'text-primary' : 'text-white/70']">变更</h5>
            <div v-if="records.changes.length > 0">
              <div v-for="(change, index) in records.changes" :key="index"
                class="space-y-1 text-xs text-white/60 mb-3 last:mb-0">
                <p>变更类型: {{ change.type || '-' }}</p>
                <p>变更部件: {{ change.component || '-' }}</p>
                <p>旧部件序列号: {{ change.oldSerial || '-' }}</p>
                <p>新部件序列号: {{ change.newSerial || '-' }}</p>
                <p>负责人: {{ change.person || '-' }}</p>
                <p>变更日期: {{ change.date || '-' }}</p>
              </div>
            </div>
            <div v-else class="space-y-1 text-xs text-white/60">
              <p>变更类型: -</p>
              <p>变更部件: -</p>
              <p>旧部件序列号: -</p>
              <p>新部件序列号: -</p>
              <p>负责人: -</p>
              <p>变更日期: -</p>
            </div>
          </div>
        </div>
        <!-- 迁移 -->
        <div class="flex gap-3">
          <div class="flex flex-col items-center pt-0.5">
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              hasMigration ? 'border-primary bg-primary/20' : 'border-white/30'
            ]">
              <Check v-if="hasMigration" class="w-3 h-3 text-primary" />
            </div>
            <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
          </div>
          <div class="flex-1 pb-4">
            <h5 :class="['text-sm font-bold mb-2', hasMigration ? 'text-primary' : 'text-white/70']">迁移</h5>
            <div class="space-y-1 text-xs text-white/60">
              <p>当前电站: {{ records.migration.currentStation || '-' }}</p>
              <p>迁移目标电站: {{ records.migration.targetStation || '-' }}</p>
              <p>迁移原因: {{ records.migration.reason || '-' }}</p>
              <p>负责人: {{ records.migration.person || '-' }}</p>
              <p>迁移日期: {{ records.migration.date || '-' }}</p>
            </div>
          </div>
        </div>
        <!-- 检修 -->
        <div class="flex gap-3">
          <div class="flex flex-col items-center pt-0.5">
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              hasMaintenance ? 'border-primary bg-primary/20' : 'border-white/30'
            ]">
              <Check v-if="hasMaintenance" class="w-3 h-3 text-primary" />
            </div>
            <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
          </div>
          <div class="flex-1 pb-4">
            <h5 :class="['text-sm font-bold mb-2', hasMaintenance ? 'text-primary' : 'text-white/70']">检修</h5>
            <div v-if="records.maintenance.length > 0">
              <div v-for="(m, index) in records.maintenance" :key="index"
                class="space-y-1 text-xs text-white/60 mb-3 last:mb-0">
                <p>检修类型: {{ m.type || '-' }}</p>
                <p>检修内容: {{ m.content || '-' }}</p>
                <p>负责人: {{ m.person || '-' }}</p>
                <p>检修日期: {{ m.date || '-' }}</p>
              </div>
            </div>
            <div v-else class="space-y-1 text-xs text-white/60">
              <p>检修类型: -</p>
              <p>检修内容: -</p>
              <p>负责人: -</p>
              <p>检修日期: -</p>
            </div>
          </div>
        </div>
        <!-- 退役 -->
        <div class="flex gap-3">
          <div class="flex flex-col items-center pt-0.5">
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
              hasRetirement ? 'border-primary bg-primary/20' : 'border-white/30'
            ]">
              <Check v-if="hasRetirement" class="w-3 h-3 text-primary" />
            </div>
          </div>
          <div class="flex-1">
            <h5 :class="['text-sm font-bold mb-2', hasRetirement ? 'text-primary' : 'text-white/70']">退役</h5>
            <div class="space-y-1 text-xs text-white/60">
              <p>退役触发条件: {{ records.retirement.triggerCondition || '-' }}</p>
              <p>累计运行年限: {{ records.retirement.operationYears || '-' }}</p>
              <p>退役去向: {{ records.retirement.destination || '-' }}</p>
              <p>退役日期: {{ records.retirement.date || '-' }}</p>
              <p>负责人: {{ records.retirement.person || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 编辑/创建模式：显示编辑表单 -->
    <template v-else>
      <div class="flex items-center justify-between">
        <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">全生命周期管理</h4>
        <div class="flex gap-2">
          <button @click="displayMode = 'view'"
            class="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
            取消
          </button>
          <button @click="handleSave"
            class="px-5 py-1.5 text-sm bg-primary hover:bg-primary/80 text-white rounded transition-colors">
            保存
          </button>
        </div>
      </div>
      <!-- 环节选择 -->
      <div class="flex items-center gap-3 flex-wrap py-2 border-b border-white/10">
        <label v-for="stage in lifecycleStages" :key="stage.value"
          class="flex items-center gap-1.5 cursor-pointer text-sm"
          :class="selectedLifecycleStage === stage.value ? 'text-primary' : 'text-white/60'"
          @click="selectedLifecycleStage = stage.value">
          <div class="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
            :class="selectedLifecycleStage === stage.value ? 'border-primary' : 'border-white/40'">
            <div v-if="selectedLifecycleStage === stage.value" class="w-1.5 h-1.5 rounded-full bg-primary"></div>
          </div>
          <span>{{ stage.label }}</span>
        </label>
      </div>
      <!-- 动态表单 -->
      <div class="space-y-4 pt-2">
        <!-- 建档 -->
        <template v-if="selectedLifecycleStage === 'filing'">
          <div class="space-y-1">
            <label class="text-sm text-primary">建档日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.filing.date" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">建档人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.filing.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
        </template>
        <!-- 投运 -->
        <template v-if="selectedLifecycleStage === 'commission'">
          <div class="space-y-1">
            <label class="text-sm text-primary">验收日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.commission.acceptanceDate" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">投运日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.commission.commissionDate" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.commission.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
        </template>
        <!-- 变更 -->
        <template v-if="selectedLifecycleStage === 'change'">
          <div class="space-y-1">
            <label class="text-sm text-primary">变更类型 <span class="text-red-400">*</span></label>
            <select v-model="editForm.change.type"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
              <option value="" class="bg-gray-800">请选择</option>
              <option value="故障更换" class="bg-gray-800">故障更换</option>
              <option value="容量升级" class="bg-gray-800">容量升级</option>
              <option value="系统改造" class="bg-gray-800">系统改造</option>
              <option value="其他" class="bg-gray-800">其他</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">更换部件 <span class="text-red-400">*</span></label>
            <select v-model="editForm.change.component"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
              <option value="" class="bg-gray-800">请选择</option>
              <option value="PCS模块" class="bg-gray-800">PCS模块</option>
              <option value="电池模组" class="bg-gray-800">电池模组</option>
              <option value="BMS模块" class="bg-gray-800">BMS模块</option>
              <option value="高压箱" class="bg-gray-800">高压箱</option>
              <option value="消防系统" class="bg-gray-800">消防系统</option>
              <option value="其他" class="bg-gray-800">其他</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">旧部件序列号 <span class="text-red-400">*</span></label>
            <input v-model="editForm.change.oldSerial" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">新部件序列号 <span class="text-red-400">*</span></label>
            <input v-model="editForm.change.newSerial" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.change.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">变更日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.change.date" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
        </template>
        <!-- 迁移 -->
        <template v-if="selectedLifecycleStage === 'migration'">
          <div class="space-y-1">
            <label class="text-sm text-primary">当前电站 <span class="text-red-400">*</span></label>
            <input v-model="editForm.migration.currentStation" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">迁移目标电站 <span class="text-red-400">*</span></label>
            <input v-model="editForm.migration.targetStation" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">迁移原因 <span class="text-red-400">*</span></label>
            <select v-model="editForm.migration.reason"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
              <option value="" class="bg-gray-800">请选择</option>
              <option value="布局调整" class="bg-gray-800">布局调整</option>
              <option value="容量优化" class="bg-gray-800">容量优化</option>
              <option value="电网调度" class="bg-gray-800">电网调度</option>
              <option value="其他" class="bg-gray-800">其他</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.migration.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">迁移日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.migration.date" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
        </template>
        <!-- 检修 -->
        <template v-if="selectedLifecycleStage === 'maintenance'">
          <div class="space-y-1">
            <label class="text-sm text-primary">检修类型 <span class="text-red-400">*</span></label>
            <select v-model="editForm.maintenance.type"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
              <option value="" class="bg-gray-800">请选择</option>
              <option value="通讯中断" class="bg-gray-800">通讯中断</option>
              <option value="定期巡检" class="bg-gray-800">定期巡检</option>
              <option value="故障维修" class="bg-gray-800">故障维修</option>
              <option value="预防性维护" class="bg-gray-800">预防性维护</option>
              <option value="其他" class="bg-gray-800">其他</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm text-primary">检修项目清单 <span class="text-red-400">*</span></label>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="item in maintenanceItems" :key="item"
                class="flex items-center gap-2 cursor-pointer text-sm text-white/70 hover:text-white">
                <input type="checkbox" v-model="editForm.maintenance.items" :value="item"
                  class="w-4 h-4 rounded border-white/30 bg-white/10 text-primary focus:ring-primary" />
                <span>{{ item }}</span>
              </label>
            </div>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.maintenance.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">检修日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.maintenance.date" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
        </template>
        <!-- 退役 -->
        <template v-if="selectedLifecycleStage === 'retirement'">
          <div class="space-y-1">
            <label class="text-sm text-primary">退役触发条件 <span class="text-red-400">*</span></label>
            <select v-model="editForm.retirement.triggerCondition"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
              <option value="" class="bg-gray-800">请选择</option>
              <option value="SOH低于阈值(<70%)" class="bg-gray-800">SOH低于阈值(&lt;70%)</option>
              <option value="达到设计寿命" class="bg-gray-800">达到设计寿命</option>
              <option value="安全事故" class="bg-gray-800">安全事故</option>
              <option value="技术淘汰" class="bg-gray-800">技术淘汰</option>
              <option value="其他" class="bg-gray-800">其他</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">累计运行年限 <span class="text-red-400">*</span></label>
            <input v-model="editForm.retirement.operationYears" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">退役去向 <span class="text-red-400">*</span></label>
            <select v-model="editForm.retirement.destination"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
              <option value="" class="bg-gray-800">请选择</option>
              <option value="就地备用" class="bg-gray-800">就地备用</option>
              <option value="异地调配" class="bg-gray-800">异地调配</option>
              <option value="回收拆解" class="bg-gray-800">回收拆解</option>
              <option value="其他" class="bg-gray-800">其他</option>
            </select>
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.retirement.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">退役日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.retirement.date" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
        </template>
        <!-- 报废 -->
        <template v-if="selectedLifecycleStage === 'scrap'">
          <div class="space-y-1">
            <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
            <input v-model="editForm.scrap.person" type="text" placeholder="请输入"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
          </div>
          <div class="space-y-1">
            <label class="text-sm text-primary">报废日期 <span class="text-red-400">*</span></label>
            <input v-model="editForm.scrap.date" type="date"
              class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Check } from 'lucide-vue-next'

// 类型定义
/** 变更记录 */
export interface ChangeRecord {
  type: string
  component: string
  oldSerial: string
  newSerial: string
  person: string
  date: string
}

/** 检修记录 */
export interface MaintenanceRecord {
  type: string
  content: string
  person: string
  date: string
}

/** 生命周期阶段数据 */
export interface LifecycleStageData {
  completed: boolean
  date: string
  person: string
  [key: string]: any
}

/**
 * 全生命周期记录
 * 包含建档、投运、变更、迁移、检修、退役、报废七个阶段的数据
 */
export interface LifecycleRecords {
  currentStage: string
  filing: LifecycleStageData
  commission: LifecycleStageData & { gridDate: string; commissionDate: string }
  changes: ChangeRecord[]
  migration: LifecycleStageData & { currentStation: string; targetStation: string; reason: string }
  maintenance: MaintenanceRecord[]
  retirement: LifecycleStageData & { triggerCondition: string; operationYears: string; destination: string }
  scrap: LifecycleStageData
}

// Props & Emits
interface Props {
  mode: 'view' | 'edit' | 'create'
  records: LifecycleRecords
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:records', val: LifecycleRecords): void
}>()

// 显示模式：create 默认 view，edit 默认 edit，view 只能 view
const displayMode = ref(props.mode === 'edit' ? 'edit' : 'view')

// 环节定义
const lifecycleStages = [
  { label: '建档', value: 'filing' },
  { label: '投运', value: 'commission' },
  { label: '变更', value: 'change' },
  { label: '迁移', value: 'migration' },
  { label: '检修', value: 'maintenance' },
  { label: '退役', value: 'retirement' },
  { label: '报废', value: 'scrap' }
]

const maintenanceItems = [
  '外观检查',
  '电气连接',
  '绝缘测试',
  '容量标定',
  '热管理',
  '消防系统',
  'BMS软件升级'
]

const selectedLifecycleStage = ref('filing')

// 编辑表单
const editForm = reactive({
  filing: { date: '', person: '' },
  commission: { acceptanceDate: '', commissionDate: '', person: '' },
  change: { type: '', component: '', oldSerial: '', newSerial: '', person: '', date: '' },
  migration: { currentStation: '', targetStation: '', reason: '', person: '', date: '' },
  maintenance: { type: '', items: [] as string[], person: '', date: '' },
  retirement: { triggerCondition: '', operationYears: '', destination: '', person: '', date: '' },
  scrap: { person: '', date: '' }
})

// ── 各生命周期阶段完成状态 ──
/** 建档阶段是否已完成 */
const hasFiling = computed(() =>
  props.records.filing.completed || !!(props.records.filing.date || props.records.filing.person)
)
const hasCommission = computed(() =>
  props.records.commission.completed || !!(props.records.commission.date || props.records.commission.person || props.records.commission.gridDate)
)
const hasChanges = computed(() => props.records.changes.length > 0)
const hasMigration = computed(() =>
  props.records.migration.completed || !!(props.records.migration.date || props.records.migration.person || props.records.migration.currentStation || props.records.migration.targetStation || props.records.migration.reason)
)
const hasMaintenance = computed(() => props.records.maintenance.length > 0)
const hasRetirement = computed(() =>
  props.records.retirement.completed || !!(props.records.retirement.date || props.records.retirement.person || props.records.retirement.triggerCondition || props.records.retirement.operationYears || props.records.retirement.destination)
)

// 保存
/**
 * 保存生命周期阶段数据
 *
 * 根据当前选中的阶段（建档/投运/变更/迁移/检修/退役/报废），
 * 将编辑表单数据合并到生命周期记录中，并触发 update:records 事件。
 * 变更阶段以追加方式添加到 changes 数组，其他阶段以覆盖方式更新。
 */
const handleSave = () => {
  const stage = selectedLifecycleStage.value
  const data = editForm[stage as keyof typeof editForm]
  const newRecords: LifecycleRecords = {
    ...props.records,
    changes: [...props.records.changes],
    maintenance: [...props.records.maintenance]
  }

  if (stage === 'change') {
    newRecords.changes.push({
      type: (data as any).type,
      component: (data as any).component,
      oldSerial: (data as any).oldSerial,
      newSerial: (data as any).newSerial,
      person: (data as any).person,
      date: (data as any).date
    })
  } else if (stage === 'filing') {
    newRecords.filing = { ...newRecords.filing, ...(data as any), completed: true }
  } else if (stage === 'commission') {
    newRecords.commission = {
      ...newRecords.commission,
      ...(data as any),
      gridDate: (data as any).acceptanceDate,
      completed: true
    }
  } else if (stage === 'migration') {
    newRecords.migration = { ...newRecords.migration, ...(data as any), completed: true }
  } else if (stage === 'maintenance') {
    newRecords.maintenance.push({
      type: (data as any).type,
      content: (data as any).items?.join('、') || '',
      person: (data as any).person,
      date: (data as any).date
    })
  } else if (stage === 'retirement') {
    newRecords.retirement = { ...newRecords.retirement, ...(data as any), completed: true }
  } else if (stage === 'scrap') {
    newRecords.scrap = { ...newRecords.scrap, ...(data as any), completed: true }
  }

  emit('update:records', newRecords)
}
</script>
