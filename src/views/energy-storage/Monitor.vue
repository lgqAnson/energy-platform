<template>
  <div class="space-y-4">
    <!-- 顶部 Tab 导航 -->
    <div class="flex items-center gap-1">
      <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="relative flex items-center justify-center"
        style="width: 124px; height: 43px;">
        <img v-if="route.path === tab.path" src="/images/储能-可视看板/u3496.png"
          class="absolute inset-0 w-full h-full object-fill" style="opacity: 1;" alt="" />
        <img v-else src="/images/储能-可视看板/u3496.png" class="absolute inset-0 w-full h-full object-fill"
          style="opacity: 0.35;" alt="" />
        <div v-if="route.path === tab.path" class="absolute inset-0 border border-[#01CAFE] rounded-[3px]" />
        <span class="relative z-10 text-[16px] font-medium"
          :class="route.path === tab.path ? 'text-white' : 'text-[#D7D7D7]'">
          {{ tab.name }}
        </span>
      </router-link>
    </div>

    <div class="flex gap-4" style="height: 480px;">
      <!-- 左侧：系统拓扑图 -->
      <div class="relative flex-[2] rounded-lg overflow-hidden">
        <div class="absolute inset-0"
          style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%); filter: drop-shadow(7px 5px 2.5px rgba(36, 71, 102, 0.6)); border-radius: 12px;" />
        <div class="relative z-10 p-5 h-full flex flex-col">
          <div class="relative h-6 mb-3">
            <img src="/images/登录日志/u79.png" class="absolute inset-0 h-full w-[200px] object-fill" alt="" />
            <span class="relative z-10 text-[20px] font-bold px-3"
              style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; color: #02A7F0; line-height: 23px;">系统拓扑图</span>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <img src="/images/储能-实时监控/u3662.png" class="max-w-full max-h-full object-contain" alt="系统拓扑图" />
          </div>
        </div>
      </div>

      <!-- 右侧：能量组监控 -->
      <div class="relative flex-1 rounded-lg overflow-hidden">
        <div class="absolute inset-0"
          style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%); filter: drop-shadow(7px 5px 2.5px rgba(36, 71, 102, 0.6)); border-radius: 12px;" />
        <div class="relative z-10 p-5 h-full flex flex-col">
          <div class="relative h-6 mb-4">
            <img src="/images/登录日志/u79.png" class="absolute inset-0 h-full w-[200px] object-fill" alt="" />
            <span class="relative z-10 text-[20px] font-bold px-3"
              style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; color: #02A7F0; line-height: 23px;">能量组监控</span>
          </div>
          <div class="flex-1 space-y-4 overflow-y-auto">
            <div v-for="group in energyGroups" :key="group.id" class="p-4 rounded-lg"
              style="background: rgba(30, 43, 60, 0.6); border: 1px solid rgba(255, 255, 255, 0.05);">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-white">{{ group.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded"
                  :style="group.status === '正常' ? 'background: rgba(82, 196, 26, 0.2); color: #52C41A;' : 'background: rgba(250, 173, 20, 0.2); color: #FAAD14;'">{{
                    group.status }}</span>
              </div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-white/50">SOC</span>
                <span class="text-sm text-white font-mono">{{ group.soc }}%</span>
              </div>
              <div class="h-2 rounded-full overflow-hidden" style="background: rgba(255, 255, 255, 0.1);">
                <div class="h-full rounded-full transition-all duration-500"
                  :style="{ width: group.soc + '%', background: group.soc > 80 ? '#52C41A' : group.soc > 30 ? '#02A7F0' : '#FAAD14' }" />
              </div>
              <div class="flex gap-4 text-xs mt-2 text-white/60">
                <span>电压: {{ group.voltage }}V</span>
                <span>温度: {{ group.temperature }}°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4" style="height: 320px;">
      <!-- 能量块监控 -->
      <div class="relative flex-1 rounded-lg overflow-hidden">
        <div class="absolute inset-0"
          style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%); filter: drop-shadow(7px 5px 2.5px rgba(36, 71, 102, 0.6)); border-radius: 12px;" />
        <div class="relative z-10 p-5 h-full flex flex-col">
          <div class="relative h-6 mb-3 flex items-center justify-between">
            <div class="relative h-6">
              <img src="/images/登录日志/u79.png" class="absolute inset-0 h-full w-[200px] object-fill" alt="" />
              <span class="relative z-10 text-[20px] font-bold px-3"
                style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; color: #02A7F0; line-height: 23px;">能量块监控</span>
            </div>
            <button
              class="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors hover:opacity-80"
              style="background: rgba(2, 167, 240, 0.2); color: #02A7F0; border: 1px solid rgba(2, 167, 240, 0.3);"
              @click="openAddDialog">
              <Plus class="w-3.5 h-3.5" />
              新增
            </button>
          </div>
          <div class="flex-1 grid grid-cols-4 gap-3 content-start overflow-y-auto">
            <div v-for="block in energyBlocks" :key="block.id" class="p-3 rounded-lg text-center"
              style="background: rgba(30, 43, 60, 0.6); border: 1px solid rgba(255, 255, 255, 0.05);">
              <div class="w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2"
                :style="block.soc > 80 ? 'background: rgba(82, 196, 26, 0.2);' : block.soc > 30 ? 'background: rgba(2, 167, 240, 0.2);' : 'background: rgba(250, 173, 20, 0.2);'">
                <Battery class="w-5 h-5"
                  :style="block.soc > 80 ? 'color: #52C41A;' : block.soc > 30 ? 'color: #02A7F0;' : 'color: #FAAD14;'" />
              </div>
              <p class="text-xs text-white mb-1">{{ block.name }}</p>
              <p class="text-lg font-bold"
                :style="block.soc > 80 ? 'color: #52C41A;' : block.soc > 30 ? 'color: #02A7F0;' : 'color: #FAAD14;'">{{
                  block.soc }}%</p>
              <p class="text-[10px] text-white/50">{{ block.voltage }}V / {{ block.temperature }}°C</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时参数 -->
      <div class="relative flex-1 rounded-lg overflow-hidden">
        <div class="absolute inset-0"
          style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.12) 0%, rgba(85, 85, 85, 0.08) 100%); filter: drop-shadow(7px 5px 2.5px rgba(36, 71, 102, 0.6)); border-radius: 12px;" />
        <div class="relative z-10 p-5 h-full flex flex-col">
          <div class="relative h-6 mb-3">
            <img src="/images/登录日志/u79.png" class="absolute inset-0 h-full w-[200px] object-fill" alt="" />
            <span class="relative z-10 text-[20px] font-bold px-3"
              style="font-family: 'Arial Negreta', 'Arial Normal', 'Arial', sans-serif; color: #02A7F0; line-height: 23px;">实时参数</span>
          </div>
          <div class="flex-1 overflow-auto">
            <el-table :data="realTimeData" style="width: 100%; "
              :header-cell-style="{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }"
              :cell-style="{ color: 'rgba(255,255,255,0.9)', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }"
              size="small">
              <el-table-column prop="name" label="参数名称" min-width="100" />
              <el-table-column prop="value" label="当前值" min-width="80">
                <template #default="{ row }">
                  <span class="font-mono" style="color: #02A7F0;">{{ row.value }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="unit" label="单位" min-width="60" />
              <el-table-column prop="status" label="状态" min-width="70">
                <template #default="{ row }">
                  <span class="text-xs px-2 py-0.5 rounded"
                    :style="row.status === '正常' ? 'background: rgba(82, 196, 26, 0.2); color: #52C41A;' : 'background: rgba(250, 173, 20, 0.2); color: #FAAD14;'">{{
                      row.status }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增能量块对话框 -->
    <el-dialog v-model="showAddDialog" title="新增能量块" width="400px" :close-on-click-modal="false"
      :style="{ background: '#1a2332', borderRadius: '8px' }" class="energy-block-dialog">
      <el-form ref="formRef" :model="newBlock" :rules="rules" label-position="top">
        <el-form-item label="能量块名称" prop="name">
          <el-input v-model="newBlock.name" placeholder="请输入名称" size="small" />
        </el-form-item>
        <el-form-item label="SOC (%)" prop="soc">
          <el-slider v-model="newBlock.soc" :min="0" :max="100" show-input size="small" />
        </el-form-item>
        <el-form-item label="电压 (V)" prop="voltage">
          <el-input-number v-model="newBlock.voltage" :min="0" :max="100" :precision="1" size="small"
            style="width: 100%;" />
        </el-form-item>
        <el-form-item label="温度 (°C)" prop="temperature">
          <el-input-number v-model="newBlock.temperature" :min="-40" :max="80" :precision="1" size="small"
            style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button size="small" @click="showAddDialog = false">取消</el-button>
          <el-button size="small" type="primary" @click="addEnergyBlock">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Battery, Plus } from 'lucide-vue-next'

const route = useRoute()
const hasTopologyBg = ref(false)

const showAddDialog = ref(false)
const newBlock = ref({ name: '', soc: 50, voltage: 48.0, temperature: 25.0 })
const formRef = ref<any>(null)

const rules = {
  name: [{ required: true, message: '请输入能量块名称', trigger: 'blur' }],
  soc: [{ required: true, message: '请输入SOC', trigger: 'change' }],
  voltage: [{ required: true, message: '请输入电压', trigger: 'change' }],
  temperature: [{ required: true, message: '请输入温度', trigger: 'change' }]
}

function openAddDialog() {
  newBlock.value = { name: '', soc: 50, voltage: 48.0, temperature: 25.0 }
  showAddDialog.value = true
  // 重置表单校验状态
  nextTick(() => {
    formRef.value?.resetFields?.()
  })
}

async function addEnergyBlock() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const id = String(energyBlocks.value.length + 1).padStart(2, '0')
    energyBlocks.value.push({
      id,
      name: newBlock.value.name.trim(),
      soc: Number(newBlock.value.soc),
      voltage: Number(newBlock.value.voltage),
      temperature: Number(newBlock.value.temperature)
    })
    showAddDialog.value = false
  } catch {
    // 校验失败，不执行提交
  }
}

const tabs = [
  { name: '可视看板', path: '/energy-storage/dashboard' },
  { name: '实时监控', path: '/energy-storage/monitor' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '电价管理', path: '/energy-storage/price' },
  { name: '抄表结算', path: '/energy-storage/settlement' },
  { name: '收益管理', path: '/energy-storage/revenue' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]

const energyGroups = [
  { id: 'a', name: '能量组 A', status: '正常', soc: 87, voltage: 384.2, temperature: 25.3 },
  { id: 'b', name: '能量组 B', status: '正常', soc: 72, voltage: 382.1, temperature: 26.1 },
  { id: 'c', name: '能量组 C', status: '正常', soc: 45, voltage: 380.5, temperature: 24.8 }
]

const energyBlocks = ref([
  { id: '01', name: '能量块 01', soc: 92, voltage: 48.2, temperature: 25.0 },
  { id: '02', name: '能量块 02', soc: 78, voltage: 47.8, temperature: 25.5 },
  { id: '03', name: '能量块 03', soc: 65, voltage: 47.5, temperature: 26.0 },
  { id: '04', name: '能量块 04', soc: 41, voltage: 47.1, temperature: 24.5 }
])

const realTimeData = [
  { name: '总电压', value: '384.2', unit: 'V', status: '正常' },
  { name: '总电流', value: '156.8', unit: 'A', status: '正常' },
  { name: 'SOC', value: '72.5', unit: '%', status: '正常' },
  { name: 'SOH', value: '98.2', unit: '%', status: '正常' },
  { name: '最高温度', value: '28.5', unit: '°C', status: '异常' },
  { name: '最低温度', value: '22.3', unit: '°C', status: '正常' },
  { name: '充电功率', value: '125.6', unit: 'kW', status: '正常' },
  { name: '放电功率', value: '0.0', unit: 'kW', status: '正常' }
]
</script>

<style scoped>
::deep(.el-table__body tr:hover > td) {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

::deep(.el-table tr) {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

::deep(.energy-block-dialog .el-dialog__header) {
  margin-right: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

::deep(.energy-block-dialog .el-dialog__title) {
  color: #fff;
  font-size: 16px;
}

::deep(.energy-block-dialog .el-dialog__body) {
  color: rgba(255, 255, 255, 0.85);
  padding: 16px 20px;
}

::deep(.energy-block-dialog .el-dialog__footer) {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

::deep(.energy-block-dialog .el-input__wrapper),
::deep(.energy-block-dialog .el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

::deep(.energy-block-dialog .el-input__inner) {
  color: #fff;
}

::deep(.energy-block-dialog .el-form-item__label) {
  color: rgba(255, 255, 255, 0.7);
}

::deep(.energy-block-dialog .el-form-item__error) {
  color: #ff4d4f;
}
</style>
