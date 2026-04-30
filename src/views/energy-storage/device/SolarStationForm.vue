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
            {{ mode === 'create' ? '确认新建' : '保存' }}
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
                <label class="text-sm text-white/60">场站编码 <span class="text-red-400">*</span></label>
                <input v-if="mode !== 'view'" v-model="formData.stationCode" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.stationCode || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">投运日期</label>
                <input v-if="mode !== 'view'" v-model="formData.commissionDate" type="date"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.commissionDate || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">场站名称</label>
                <input v-if="mode !== 'view'" v-model="formData.stationName" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.stationName || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">建设规模</label>
                <input v-if="mode !== 'view'" v-model="formData.constructionScale" type="text" placeholder="如: 5MW"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.constructionScale || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">场站类型</label>
                <select v-if="mode !== 'view'" v-model="formData.stationType"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="地面电站">地面电站</option>
                  <option value="屋顶分布式">屋顶分布式</option>
                  <option value="独立储能">独立储能</option>
                  <option value="渔光互补">渔光互补</option>
                  <option value="农光互补">农光互补</option>
                  <option value="分布式工商业">分布式工商业</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.stationType || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">并网容量</label>
                <input v-if="mode !== 'view'" v-model="formData.gridCapacity" type="text" placeholder="如: 4.8MW"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.gridCapacity || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">所属集团</label>
                <input v-if="mode !== 'view'" v-model="formData.belongingGroup" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.belongingGroup || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">并网方式</label>
                <select v-if="mode !== 'view'" v-model="formData.gridConnectionType"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                  <option value="">请选择</option>
                  <option value="全额上网">全额上网</option>
                  <option value="自发自用">自发自用</option>
                  <option value="余电上网">余电上网</option>
                </select>
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.gridConnectionType || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">运维单位</label>
                <input v-if="mode !== 'view'" v-model="formData.operationUnit" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.operationUnit || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">并网电压等级</label>
                <input v-if="mode !== 'view'" v-model="formData.gridVoltageLevel" type="text" placeholder="如: 10kV"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.gridVoltageLevel || '-' }}
                </div>
              </div>
              <div class="space-y-1 col-span-2">
                <label class="text-sm text-white/60">站址</label>
                <input v-if="mode !== 'view'" v-model="formData.address" type="text" placeholder="省/市/区/街道 四级地址"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.address || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">并网日期</label>
                <input v-if="mode !== 'view'" v-model="formData.gridDate" type="date"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.gridDate || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">并网协议</label>
                <input v-if="mode !== 'view'" v-model="formData.gridAgreement" type="text" placeholder="文档附件"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.gridAgreement || '-' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 系统配置参数 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">系统配置参数</h4>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <label class="text-sm text-white/60">总装机容量 (kWp)</label>
                <input v-if="mode !== 'view'" v-model="formData.installedCapacity" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.installedCapacity || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">有效容量 (kWp)</label>
                <input v-if="mode !== 'view'" v-model="formData.effectiveCapacity" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.effectiveCapacity || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">组件总数量</label>
                <input v-if="mode !== 'view'" v-model="formData.moduleCount" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.moduleCount || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">综合效率 (%)</label>
                <input v-if="mode !== 'view'" v-model="formData.overallEfficiency" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.overallEfficiency || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">逆变器总数量</label>
                <input v-if="mode !== 'view'" v-model="formData.inverterCount" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.inverterCount || '-' }}
                </div>
              </div>
              <div class="space-y-1">
                <label class="text-sm text-white/60">逆变器效率 (%)</label>
                <input v-if="mode !== 'view'" v-model="formData.inverterEfficiency" type="text" placeholder="请输入"
                  class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                  {{ formData.inverterEfficiency || '-' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 相关逆变器 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">相关逆变器</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="(inv, idx) in relatedInverters" :key="idx"
                class="px-3 py-1.5 text-sm rounded bg-white/5 border border-white/10 text-white/80">
                {{ inv }}
              </span>
              <span v-if="relatedInverters.length === 0" class="text-sm text-white/40">暂无</span>
            </div>
          </div>

          <!-- 相关光伏组件 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">相关光伏组件</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="(mod, idx) in relatedModules" :key="idx"
                class="px-3 py-1.5 text-sm rounded bg-white/5 border border-white/10 text-white/80">
                {{ mod }}
              </span>
              <span v-if="relatedModules.length === 0" class="text-sm text-white/40">暂无</span>
            </div>
          </div>
        </div>

        <!-- 右侧附件和生命周期 -->
        <div class="space-y-6">
          <!-- 图片上传区 -->
          <div class="space-y-4">
            <h4 class="text-lg font-bold text-primary">光伏站点</h4>
            <template v-if="mode !== 'view'">
              <div class="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                @click="triggerFileUpload">
                <div class="text-white/40 text-3xl mb-2">+</div>
                <p class="text-white/60 text-sm mb-1">点击上传图片</p>
                <p class="text-white/40 text-xs">仅支持 JPG 和 PNG 格式，最大 100 MB</p>
                <input ref="fileInput" type="file" class="hidden" accept=".jpg,.jpeg,.png"
                  @change="handleFileChange" />
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
          <LifecycleManager v-model:records="lifecycleRecords" :mode="mode" @update:records="syncRecordsToFormData" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import LifecycleManager from '@/components/common/LifecycleManager.vue'
import type { LifecycleRecords } from '@/components/common/LifecycleManager.vue'

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

const fileInput = ref<HTMLInputElement>()
const uploadedFiles = ref<{ name: string; size: number; type: string; url: string }[]>([])
const previewVisible = ref(false)
const previewUrl = ref('')

const formData = reactive({
  stationCode: '',
  commissionDate: '',
  stationName: '',
  constructionScale: '',
  stationType: '',
  gridCapacity: '',
  belongingGroup: '',
  gridConnectionType: '',
  operationUnit: '',
  gridVoltageLevel: '',
  address: '',
  gridDate: '',
  gridAgreement: '',
  installedCapacity: '',
  effectiveCapacity: '',
  moduleCount: '',
  overallEfficiency: '',
  inverterCount: '',
  inverterEfficiency: ''
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

/** 从 deviceData 中提取关联逆变器列表 */
const relatedInverters = computed(() => {
  return props.deviceData?.relatedInverters || []
})

/** 从 deviceData 中提取关联光伏组件列表 */
const relatedModules = computed(() => {
  return props.deviceData?.relatedModules || []
})

/** 触发隐藏文件选择器的点击事件 */
const triggerFileUpload = () => {
  if (props.mode !== 'view') {
    fileInput.value?.click()
  }
}

/**
 * 处理文件选择器变更事件
 * 校验文件类型（JPG/PNG）和大小（≤100MB），通过后加入已上传列表
 * @param event 文件选择事件
 */
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const validTypes = ['image/jpeg', 'image/png']
    const maxSize = 100 * 1024 * 1024
    if (!validTypes.includes(file.type)) {
      alert('仅支持 JPG 和 PNG 格式')
      return
    }
    if (file.size > maxSize) {
      alert('文件大小不能超过 100MB')
      return
    }
    uploadedFiles.value.push({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    })
    target.value = ''
  }
}

/**
 * 删除指定索引的上传文件并释放 Blob URL
 * @param index 文件索引
 */
const removeFile = (index: number) => {
  const file = uploadedFiles.value[index]
  if (file?.url) {
    URL.revokeObjectURL(file.url)
  }
  uploadedFiles.value.splice(index, 1)
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

const lifecycleRecords = ref<LifecycleRecords>({ ...initialLifecycleRecords })

/**
 * 将生命周期管理组件的数据同步回表单字段
 * 主要同步投运日期和并网日期
 * @param records 生命周期记录对象
 */
const syncRecordsToFormData = (records: LifecycleRecords) => {
  formData.commissionDate = records.commission.commissionDate
  formData.gridDate = records.commission.gridDate
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
    lifecycleRecords.value = { ...initialLifecycleRecords }
    // 预填充建档信息
    const today = getTodayStr()
    const user = userStore.userInfo.name || '管理员'
    formData.commissionDate = today
    formData.gridDate = today
    if (newData) {
      Object.assign(formData, newData)
    }
  } else if (newData) {
    Object.assign(formData, newData)
    if (newData.lifecycle) {
      Object.assign(lifecycleRecords.value, newData.lifecycle)
    } else {
      lifecycleRecords.value = { ...initialLifecycleRecords }
    }
  }
}, { immediate: true })

/**
 * 保存光伏场站表单
 * 校验必填字段（场站编码），通过后触发 save 事件
 */
const handleSave = () => {
  if (!formData.stationCode) {
    alert('请填写场站编码')
    return
  }
  emit('save', {
    ...formData,
    uploadedFiles: uploadedFiles.value
  })
}
</script>
