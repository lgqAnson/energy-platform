NEW_FILE_CODE
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
                                <label class="text-sm text-white/60">柜体编号 <span class="text-red-400">*</span></label>
                                <input v-if="mode !== 'view'" v-model="formData.cabinetCode" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.cabinetCode || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">外形尺寸</label>
                                <input v-if="mode !== 'view'" v-model="formData.dimensions" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.dimensions || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">柜体类型</label>
                                <input v-if="mode !== 'view'" v-model="formData.cabinetType" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.cabinetType || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">防护等级</label>
                                <input v-if="mode !== 'view'" v-model="formData.protectionLevel" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.protectionLevel || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">制造商</label>
                                <input v-if="mode !== 'view'" v-model="formData.manufacturer" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.manufacturer || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">防腐等级</label>
                                <input v-if="mode !== 'view'" v-model="formData.anticorrosionLevel" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.anticorrosionLevel || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">出厂编号</label>
                                <input v-if="mode !== 'view'" v-model="formData.factoryCode" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.factoryCode || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">总重量</label>
                                <input v-if="mode !== 'view'" v-model="formData.totalWeight" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.totalWeight || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1 col-span-2">
                                <label class="text-sm text-white/60">投运日期</label>
                                <input v-if="mode !== 'view'" v-model="formData.commissionDate" type="date"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.commissionDate || '-' }}
                                </div>
                                <p class="text-xs text-white/40">自动同步全生命周期投运环节日期</p>
                            </div>
                        </div>
                    </div>

                    <!-- 核心性能参数 -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">核心性能参数</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">额定容量 (MWh)</label>
                                <input v-if="mode !== 'view'" v-model="formData.ratedCapacity" type="number" step="0.01"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.ratedCapacity || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">额定电压 (V)</label>
                                <input v-if="mode !== 'view'" v-model="formData.ratedVoltage" type="number"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.ratedVoltage || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">电芯类型</label>
                                <input v-if="mode !== 'view'" v-model="formData.cellType" type="text" placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.cellType || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">电芯数量 (只)</label>
                                <input v-if="mode !== 'view'" v-model="formData.cellCount" type="number"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.cellCount || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">串并联配置</label>
                                <input v-if="mode !== 'view'" v-model="formData.seriesParallelConfig" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.seriesParallelConfig || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">能量效率</label>
                                <input v-if="mode !== 'view'" v-model="formData.energyEfficiency" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.energyEfficiency || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">额定功率</label>
                                <input v-if="mode !== 'view'" v-model="formData.ratedPower" type="text"
                                    placeholder="2500kW"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.ratedPower || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">额定电压</label>
                                <input v-if="mode !== 'view'" v-model="formData.ratedVoltage2" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.ratedVoltage2 || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">功率因数</label>
                                <input v-if="mode !== 'view'" v-model="formData.powerFactor" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.powerFactor || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">THD</label>
                                <input v-if="mode !== 'view'" v-model="formData.thd" type="text" placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.thd || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">通讯接口</label>
                                <input v-if="mode !== 'view'" v-model="formData.communicationInterface" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.communicationInterface || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">直流接口</label>
                                <input v-if="mode !== 'view'" v-model="formData.dcInterface" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.dcInterface || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1 col-span-2">
                                <label class="text-sm text-white/60">高压箱位置</label>
                                <input v-if="mode !== 'view'" v-model="formData.highVoltageBoxPosition" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.highVoltageBoxPosition || '-' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧上传和生命周期 -->
                <div class="space-y-6">
                    <!-- 照片展示/上传 -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-bold text-primary">储能柜</h4>
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
                        <!-- 已上传图片预览 -->
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
                        <!-- 查看模式：单张设备图片兼容 -->
                        <div v-else-if="mode === 'view' && deviceImage"
                            class="border border-white/20 rounded-lg overflow-hidden">
                            <img :src="deviceImage" alt="储能柜" class="w-full h-auto cursor-pointer"
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
import { Upload, X } from 'lucide-vue-next'
import LifecycleManager from '@/components/common/LifecycleManager.vue'
import type { LifecycleRecords } from '@/components/common/LifecycleManager.vue'
import { useUserStore } from '@/stores/user'

// Props 定义
interface Props {
    mode: 'create' | 'edit' | 'view'
    deviceData?: any
}

const props = withDefaults(defineProps<Props>(), {
    mode: 'view',
    deviceData: null
})

// Emits 定义
const emit = defineEmits<{
    save: [data: any]
    cancel: []
    edit: []
}>()

import dayjs from 'dayjs'

const userStore = useUserStore()

/** 获取当前日期字符串（YYYY-MM-DD 格式） */
const getTodayStr = () => dayjs().format('YYYY-MM-DD')

// 定义设备表单类型
interface DeviceForm {
    cabinetCode: string
    cabinetType: string
    manufacturer: string
    factoryCode: string
    commissionDate: string
    dimensions: string
    protectionLevel: string
    anticorrosionLevel: string
    totalWeight: string
    ratedCapacity: string
    ratedVoltage: string
    cellType: string
    cellCount: string
    seriesParallelConfig: string
    energyEfficiency: string
    ratedPower: string
    ratedVoltage2: string
    powerFactor: string
    thd: string
    communicationInterface: string
    dcInterface: string
    highVoltageBoxPosition: string
}

// 定义上传文件类型
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

// 设备表单数据
const formData = reactive<DeviceForm>({
    cabinetCode: '',
    cabinetType: '',
    manufacturer: '',
    factoryCode: '',
    commissionDate: '',
    dimensions: '',
    protectionLevel: '',
    anticorrosionLevel: '',
    totalWeight: '',
    ratedCapacity: '',
    ratedVoltage: '',
    cellType: '',
    cellCount: '',
    seriesParallelConfig: '',
    energyEfficiency: '',
    ratedPower: '',
    ratedVoltage2: '',
    powerFactor: '',
    thd: '',
    communicationInterface: '',
    dcInterface: '',
    highVoltageBoxPosition: ''
})

// 生命周期记录
const lifecycleRecords = ref<LifecycleRecords>({
    currentStage: '',
    filing: {
        completed: false,
        date: '',
        person: ''
    },
    commission: {
        completed: false,
        date: '',
        person: '',
        gridDate: '',
        commissionDate: ''
    },
    changes: [],
    migration: {
        completed: false,
        date: '',
        person: '',
        currentStation: '',
        targetStation: '',
        reason: ''
    },
    maintenance: {
        completed: false,
        date: '',
        person: '',
        type: '',
        content: '',
        items: []
    },
    retirement: {
        completed: false,
        date: '',
        person: '',
        triggerCondition: '',
        operationYears: '',
        destination: ''
    },
    scrap: {
        completed: false,
        date: '',
        person: ''
    }
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
 * 保存储能设备表单
 * 校验必填字段（柜体编号），通过后触发 save 事件
 */
const handleSave = () => {
    if (!formData.cabinetCode) {
        alert('请填写柜体编号')
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
