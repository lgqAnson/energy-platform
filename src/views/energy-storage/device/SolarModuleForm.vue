<template>
  <div class="h-full flex flex-col">
    <!-- 表单标题栏 -->
    <div class="flex items-center justify-between px-6 py-3 border-b border-white/10">
      <h3 class="text-xl font-bold text-primary">档案信息</h3>
      <div class="flex gap-2">
        <template v-if="mode === 'view'">
          <button @click="$emit('edit')"
            class="px-6 py-1.5 text-sm bg-orange-500/80 hover:bg-orange-500 text-white rounded transition-colors">
            编辑
          </button>
        </template>
        <template v-else>
          <button @click="$emit('cancel')"
            class="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded transition-colors">
            取消
          </button>
          <button @click="handleSave"
            class="px-6 py-1.5 text-sm bg-primary hover:bg-primary/80 text-white rounded transition-colors">
            保存
          </button>
        </template>
      </div>
    </div>

    <!-- 表单内容区 -->
    <div class="flex-1 overflow-y-auto p-6">
      <div class="grid grid-cols-2 gap-6">
        <!-- 左侧表单 -->
        <div class="space-y-6">
          <!-- 基本信息 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">基本信息</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm text-white/60">组件编码 <span class="text-red-400">*</span></label>
                <input v-if="mode !== 'view'" v-model="formData.moduleCode" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.moduleCode || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">耐压测试</label>
                <select v-if="mode !== 'view'" v-model="formData.voltageTest"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="合格">合格</option>
                  <option value="不合格">不合格</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.voltageTest || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">组件类型</label>
                <select v-if="mode !== 'view'" v-model="formData.moduleType"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="单晶">单晶</option>
                  <option value="多晶">多晶</option>
                  <option value="薄膜">薄膜</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.moduleType || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">湿热测试</label>
                <select v-if="mode !== 'view'" v-model="formData.dampHeatTest"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="合格">合格</option>
                  <option value="不合格">不合格</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.dampHeatTest || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">IEC 61215认证</label>
                <select v-if="mode !== 'view'" v-model="formData.iecCertification"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="通过">通过</option>
                  <option value="未通过">未通过</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.iecCertification || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">机械载荷测试</label>
                <select v-if="mode !== 'view'" v-model="formData.mechanicalLoadTest"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="合格">合格</option>
                  <option value="不合格">不合格</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.mechanicalLoadTest || '-' }}
                </div>
              </div>
              <div class="space-y-1 col-span-2">
                <label class="text-sm text-white/60">投运日期</label>
                <input v-if="mode !== 'view'" v-model="formData.commissionDate" type="date"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.commissionDate || '-' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 核心性能参数 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">核心性能参数</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm text-white/60">额定功率 (Wp)</label>
                <input v-if="mode !== 'view'" v-model="formData.ratedPower" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.ratedPower || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">重量(KG)</label>
                <input v-if="mode !== 'view'" v-model="formData.weight" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.weight || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">开路电压 (V)</label>
                <input v-if="mode !== 'view'" v-model="formData.openCircuitVoltage" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.openCircuitVoltage || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">最佳工作电压 (V)</label>
                <input v-if="mode !== 'view'" v-model="formData.optimalVoltage" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.optimalVoltage || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">短路电流 (A)</label>
                <input v-if="mode !== 'view'" v-model="formData.shortCircuitCurrent" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.shortCircuitCurrent || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">最佳工作电流 (A)</label>
                <input v-if="mode !== 'view'" v-model="formData.optimalCurrent" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.optimalCurrent || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">转换效率 (%)</label>
                <input v-if="mode !== 'view'" v-model="formData.conversionEfficiency" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.conversionEfficiency || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">温度系数</label>
                <input v-if="mode !== 'view'" v-model="formData.tempCoefficient" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.tempCoefficient || '-' }}
                </div>
              </div>
              <div class="space-y-1 col-span-2">
                <label class="text-sm text-white/60">尺寸规格(mm)</label>
                <input v-if="mode !== 'view'" v-model="formData.dimensions" type="text" placeholder="如: 16*22*11"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.dimensions || '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧上传和生命周期 -->
        <div class="space-y-6">
          <!-- 照片展示/上传 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary">光伏组件</h4>
            <template v-if="mode !== 'view'">
              <div class="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                @click="triggerFileUpload" @dragover.prevent @drop.prevent="handleFileDrop">
                <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png" multiple class="hidden"
                  @change="handleFileUpload" />
                <Upload class="w-12 h-12 mx-auto text-white/30 mb-3" />
                <p class="text-white/60 text-sm mb-1">拖放或点击上传图片</p>
                <p class="text-white/40 text-xs">仅支持 JPG 和 PNG 格式，最大 100 MB</p>
              </div>
            </template>
            <div v-if="uploadedFiles.length > 0" class="grid grid-cols-3 gap-3">
              <div v-for="(file, index) in uploadedFiles" :key="index"
                class="relative group aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                @click="openPreview(file.url)">
                <img :src="file.url" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="text-white text-xs">点击查看</span>
                </div>
                <button v-if="mode !== 'view'" @click.stop="removeFile(index)"
                  class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </button>
              </div>
            </div>
            <div v-else-if="mode === 'view' && deviceImage"
              class="border border-white/20 rounded-lg overflow-hidden">
              <img :src="deviceImage" alt="光伏组件" class="w-full h-auto cursor-pointer"
                @click="openPreview(deviceImage)" />
            </div>
            <div v-else-if="mode === 'view'" class="text-center py-4 text-white/40 text-sm">
              暂无图片
            </div>
          </div>

          <!-- 图片预览弹窗 -->
          <div v-if="previewVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            @click="closePreview">
            <div class="relative max-w-[90vw] max-h-[90vh]">
              <img :src="previewUrl" class="max-w-full max-h-[90vh] rounded-lg object-contain" />
              <button @click.stop="closePreview"
                class="absolute -top-10 right-0 text-white hover:text-primary text-2xl">×</button>
            </div>
          </div>

          <!-- 全生命周期管理 -->
          <LifecycleManager v-model:records="lifecycleRecords" :mode="mode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Upload } from 'lucide-vue-next'
import LifecycleManager from '@/components/common/LifecycleManager.vue'
import type { LifecycleRecords } from '@/components/common/LifecycleManager.vue'
import { useUserStore } from '@/stores/user'

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit' | 'view'
  deviceData?: any
}>(), {
  mode: 'view',
  deviceData: null
})

const emit = defineEmits<{
  save: [data: any]
  cancel: []
  edit: []
}>()

import dayjs from 'dayjs'

const userStore = useUserStore()

/** 获取当前日期字符串（YYYY-MM-DD 格式） */
const getTodayStr = () => dayjs().format('YYYY-MM-DD')

interface SolarModuleForm {
  moduleCode: string
  voltageTest: string
  moduleType: string
  dampHeatTest: string
  iecCertification: string
  mechanicalLoadTest: string
  commissionDate: string
  ratedPower: string
  weight: string
  openCircuitVoltage: string
  optimalVoltage: string
  shortCircuitCurrent: string
  optimalCurrent: string
  conversionEfficiency: string
  tempCoefficient: string
  dimensions: string
}

interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
}

const fileInput = ref<HTMLInputElement | null>(null)
const deviceImage = ref<string>('')
const uploadedFiles = ref<UploadedFile[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

const formData = reactive<SolarModuleForm>({
  moduleCode: '',
  voltageTest: '',
  moduleType: '',
  dampHeatTest: '',
  iecCertification: '',
  mechanicalLoadTest: '',
  commissionDate: '',
  ratedPower: '',
  weight: '',
  openCircuitVoltage: '',
  optimalVoltage: '',
  shortCircuitCurrent: '',
  optimalCurrent: '',
  conversionEfficiency: '',
  tempCoefficient: '',
  dimensions: ''
})

const lifecycleRecords = ref<LifecycleRecords>({
  currentStage: '',
  filing: { completed: false, date: '', person: '' },
  commission: { completed: false, date: '', person: '', gridDate: '', commissionDate: '' },
  changes: [],
  migration: { completed: false, date: '', person: '', currentStation: '', targetStation: '', reason: '' },
  maintenance: { completed: false, date: '', person: '', type: '', content: '', items: [] },
  retirement: { completed: false, date: '', person: '', triggerCondition: '', operationYears: '', destination: '' },
  scrap: { completed: false, date: '', person: '' }
})

const initialLifecycleRecords: LifecycleRecords = {
  currentStage: '',
  filing: { completed: false, date: '', person: '' },
  commission: { completed: false, date: '', person: '', gridDate: '', commissionDate: '' },
  changes: [],
  migration: { completed: false, date: '', person: '', currentStation: '', targetStation: '', reason: '' },
  maintenance: { completed: false, date: '', person: '', type: '', content: '', items: [] },
  retirement: { completed: false, date: '', person: '', triggerCondition: '', operationYears: '', destination: '' },
  scrap: { completed: false, date: '', person: '' }
}

/**
 * 监听 mode 和 deviceData 变更，初始化/重置表单数据
 * create 模式：重置所有字段并预填充建档信息
 * edit/view 模式：从 deviceData 填充表单和生命周期数据
 */
watch([() => props.mode, () => props.deviceData], ([newMode, newData]) => {
  if (newMode === 'create') {
    // 重置所有数据
    Object.keys(formData).forEach(key => { (formData as any)[key] = '' })
    uploadedFiles.value = []
    deviceImage.value = ''
    lifecycleRecords.value = { ...initialLifecycleRecords }
    // 预填充建档信息
    const today = getTodayStr()
    const user = userStore.userInfo.name || '管理员'
    lifecycleRecords.value.filing = { completed: true, date: today, person: user }
    if (newData) {
      Object.assign(formData, newData)
    }
  } else if (newData) {
    Object.assign(formData, newData)
    deviceImage.value = newData.image || ''
    if (newData.lifecycle) {
      Object.assign(lifecycleRecords.value, newData.lifecycle)
    } else {
      lifecycleRecords.value = { ...initialLifecycleRecords }
    }
  }
}, { immediate: true })

/**
 * 保存光伏组件表单
 * 校验必填字段（组件编码），通过后触发 save 事件
 */
const handleSave = () => {
  if (!formData.moduleCode) {
    alert('请填写组件编号')
    return
  }
  emit('save', {
    ...formData,
    images: uploadedFiles.value,
    lifecycle: lifecycleRecords.value
  })
}

/**
 * 处理文件选择器变更事件（支持多文件）
 * 逐个校验文件类型（JPG/PNG）和大小（≤100MB）
 * @param event 文件选择事件
 */
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    files.forEach(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert(`文件 ${file.name} 格式不支持，仅支持 JPG 和 PNG 格式`)
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 100MB 限制`)
        return
      }
      uploadedFiles.value.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      })
    })
    target.value = ''
  }
}

/**
 * 处理文件拖拽上传
 * 逐个校验文件类型（JPG/PNG）和大小（≤100MB）
 * @param event 拖拽事件
 */
const handleFileDrop = (event: DragEvent) => {
  if (event.dataTransfer) {
    const files = Array.from(event.dataTransfer.files)
    files.forEach(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert(`文件 ${file.name} 格式不支持，仅支持 JPG 和 PNG 格式`)
        return
      }
      if (file.size > 100 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 100MB 限制`)
        return
      }
      uploadedFiles.value.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      })
    })
  }
}

/**
 * 删除指定索引的上传文件并释放 Blob URL
 * @param index 文件索引
 */
const removeFile = (index: number) => {
  const file = uploadedFiles.value[index]
  if (file?.url && file.url.startsWith('blob:')) {
    URL.revokeObjectURL(file.url)
  }
  uploadedFiles.value.splice(index, 1)
}

/** 触发隐藏文件选择器的点击事件 */
const triggerFileUpload = () => {
  if (props.mode !== 'view') {
    fileInput.value?.click()
  }
}

/**
 * 打开图片预览弹窗
 * @param url 图片 URL
 */
const openPreview = (url: string) => {
  previewUrl.value = url
  previewVisible.value = true
}

/** 关闭图片预览弹窗 */
const closePreview = () => {
  previewVisible.value = false
  previewUrl.value = ''
}

/** 暴露 resetForm 方法供父组件通过 ref 调用 */
defineExpose({
  /** 重置表单所有字段和上传文件 */
  resetForm: () => {
    Object.keys(formData).forEach(key => {
      (formData as any)[key] = ''
    })
    uploadedFiles.value = []
    deviceImage.value = ''
  }
})
</script>
