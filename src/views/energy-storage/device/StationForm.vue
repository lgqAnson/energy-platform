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
                                <label class="text-sm text-white/60">能源局电站备案号</label>
                                <input v-if="mode !== 'view'" v-model="formData.filingNumber" type="text"
                                    placeholder="请输入省能源局备案号"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.filingNumber || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">投运日期</label>
                                <input v-if="mode !== 'view'" v-model="formData.commissionDate" type="date"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.commissionDate || '-' }}
                                </div>
                                <p class="text-xs text-white/40">自动同步全生命周期投运环节日期</p>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">调度命名编号</label>
                                <input v-if="mode !== 'view'" v-model="formData.dispatchCode" type="text"
                                    placeholder="请输入电网调度规程命名"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.dispatchCode || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">保质期</label>
                                <input v-if="mode !== 'view'" v-model="formData.warrantyPeriod" type="text"
                                    placeholder="--"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.warrantyPeriod || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">电站类型</label>
                                <select v-if="mode !== 'view'" v-model="formData.stationType"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                                    <option value="">请输入电压等级</option>
                                    <option value="35kV">35kV</option>
                                    <option value="110kV">110kV</option>
                                    <option value="220kV">220kV</option>
                                    <option value="500kV">500kV</option>
                                </select>
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.stationType || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">站址坐标</label>
                                <input v-if="mode !== 'view'" v-model="formData.coordinates" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.coordinates || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">生产厂家</label>
                                <input v-if="mode !== 'view'" v-model="formData.manufacturer" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.manufacturer || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">站址</label>
                                <input v-if="mode !== 'view'" v-model="formData.address" type="text"
                                    placeholder="请输入省/市/区/街道 四级地址"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.address || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">运维单位</label>
                                <input v-if="mode !== 'view'" v-model="formData.operationUnit" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.operationUnit || '-' }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 运营规格参数 -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">运营规格参数</h4>
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
                                <label class="text-sm text-white/60">额定功率 (MW)</label>
                                <input v-if="mode !== 'view'" v-model="formData.ratedPower" type="number" step="0.01"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.ratedPower || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">储能时长 (h)</label>
                                <input v-if="mode !== 'view'" v-model="formData.duration" type="number" step="0.1"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.duration || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">调峰能力 (MW)</label>
                                <input v-if="mode !== 'view'" v-model="formData.peakShavingCapacity" type="number"
                                    step="0.01" placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.peakShavingCapacity || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">并网电压等级</label>
                                <input v-if="mode !== 'view'" v-model="formData.gridVoltage" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.gridVoltage || '-' }}
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="text-sm text-white/60">接入变电站</label>
                                <input v-if="mode !== 'view'" v-model="formData.substation" type="text"
                                    placeholder="请输入"
                                    class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                <div v-else class="px-3 py-2 text-sm rounded bg-white/5 text-white">
                                    {{ formData.substation || '-' }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 下级储能柜 -->
                    <div class="space-y-4">
                        <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">下级储能柜</h4>

                        <!-- 选择储能柜 -->
                        <div class="flex gap-2 items-center">
                            <select v-if="mode !== 'view'" v-model="selectedCabinetId"
                                class="flex-1 px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary">
                                <option value="" class="bg-gray-800">请选择储能柜</option>
                                <option v-for="cabinet in availableCabinets" :key="cabinet.id" :value="cabinet.id"
                                    class="bg-gray-800">
                                    {{ cabinet.name }} ({{ cabinet.code }})
                                </option>
                            </select>
                            <div v-else class="flex-1 px-3 py-2 text-sm rounded bg-white/5 text-white">
                                {{ selectedCabinetName || '-' }}
                            </div>
                            <button v-if="mode !== 'view'" @click="handleBindCabinet"
                                class="px-4 py-2 text-sm bg-primary hover:bg-primary/80 text-white rounded transition-colors"
                                :disabled="!selectedCabinetId">
                                绑定
                            </button>
                        </div>

                        <!-- 已绑定的储能柜列表 -->
                        <div v-if="boundCabinets.length > 0" class="space-y-2">
                            <div v-for="(cabinet, index) in boundCabinets" :key="cabinet.id"
                                class="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-primary">{{ cabinet.name }}</span>
                                    <span class="text-xs text-white/40">{{ cabinet.code }}</span>
                                </div>
                                <button v-if="mode !== 'view'" @click="handleUnbindCabinet(index)"
                                    class="text-xs text-red-400 hover:text-red-300">
                                    解绑
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧附件和生命周期 -->
                <div class="space-y-6">
                    <!-- 图片上传区 -->
                    <div class="space-y-4">
                        <div v-if="mode !== 'view'"
                            class="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            @click="triggerFileUpload">
                            <div class="text-white/40 text-3xl mb-2">+</div>
                            <p class="text-white/60 text-sm mb-1">点击上传图片</p>
                            <p class="text-white/40 text-xs">仅支持 JPG 和 PNG 格式，最大 100 MB</p>
                            <input ref="fileInput" type="file" class="hidden" accept=".jpg,.jpeg,.png"
                                @change="handleFileChange" />
                        </div>
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

interface Props {
    mode: 'create' | 'edit' | 'view'
    deviceData?: any
}

interface Emits {
    (e: 'save', data: any): void
    (e: 'cancel'): void
    (e: 'edit'): void
}

const props = withDefaults(defineProps<Props>(), {
    deviceData: null
})

const emit = defineEmits<Emits>()

import dayjs from 'dayjs'

const userStore = useUserStore()

/** 获取当前日期字符串（YYYY-MM-DD 格式） */
const getTodayStr = () => dayjs().format('YYYY-MM-DD')

const fileInput = ref<HTMLInputElement>()
const uploadedFiles = ref<{ name: string; size: number; type: string; url: string }[]>([])
const selectedCabinetId = ref('')
const previewVisible = ref(false)
const previewUrl = ref('')
const boundCabinets = ref<any[]>([])

// 模拟已有储能柜数据（实际应从 API 获取）
const availableCabinets = ref([
    { id: 'ess-a-1', name: '储能柜01', code: 'ESS-A-01', status: '运行中' },
    { id: 'ess-a-2', name: '储能柜02', code: 'ESS-A-02', status: '待机' },
    { id: 'ess-b-1', name: '储能柜03', code: 'ESS-B-01', status: '运行中' },
    { id: 'ess-b-2', name: '储能柜04', code: 'ESS-B-02', status: '故障' },
    { id: 'ess-c-1', name: '储能柜05', code: 'ESS-C-01', status: '维护' }
])

// 表单数据
const formData = reactive({
    // 基本信息
    filingNumber: '',
    commissionDate: '',
    dispatchCode: '',
    warrantyPeriod: '',
    stationType: '',
    coordinates: '',
    manufacturer: '',
    address: '',
    operationUnit: '',

    // 运营规格参数
    ratedCapacity: '',
    ratedPower: '',
    duration: '',
    peakShavingCapacity: '',
    gridVoltage: '',
    substation: '',

    // 下级储能柜
    cabinetCode: '',

    // 全生命周期
    filingDate: '',
    filingPerson: '',
    gridDate: '',
    commissionPerson: '',
    changeType: '',
    changeDetails: '',
    changeImpact: '',
    changePerson: '',
    changeDate: '',
    maintenanceStatus: '',
    lastMaintenanceDate: '',
    // 迁移
    migrationCurrentStation: '',
    migrationTargetStation: '',
    migrationReason: '',
    migrationPerson: '',
    migrationDate: '',
    // 退役
    retirementTriggerCondition: '',
    retirementOperationYears: '',
    retirementDestination: '',
    retirementPerson: '',
    retirementDate: '',
    // 报废
    scrapPerson: '',
    scrapDate: ''
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
        // 验证文件类型和大小
        const validTypes = ['image/jpeg', 'image/png']
        const maxSize = 100 * 1024 * 1024 // 100MB

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

        // 清空 input 以便重复选择同一文件
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

/** 计算已选中储能柜的展示名称 */
const selectedCabinetName = computed(() => {
    const cabinet = availableCabinets.value.find(c => c.id === selectedCabinetId.value)
    return cabinet ? `${cabinet.name} (${cabinet.code})` : ''
})

/** 判断是否有设备变更记录 */
const hasChangeRecord = computed(() => {
    return !!(formData.changeType || formData.changeDate)
})

/** 判断是否有设备检修记录 */
const hasMaintenanceRecord = computed(() => {
    return !!(formData.maintenanceStatus || formData.lastMaintenanceDate)
})

/**
 * 将选中的储能柜绑定到当前场站
 * 校验是否已选择以及是否重复绑定
 */
const handleBindCabinet = () => {
    if (!selectedCabinetId.value) {
        alert('请选择储能柜')
        return
    }

    // 检查是否已绑定
    const alreadyBound = boundCabinets.value.some(c => c.id === selectedCabinetId.value)
    if (alreadyBound) {
        alert('该储能柜已绑定')
        return
    }

    const cabinet = availableCabinets.value.find(c => c.id === selectedCabinetId.value)
    if (cabinet) {
        boundCabinets.value.push(cabinet)
        selectedCabinetId.value = '' // 清空选择
        console.log('绑定储能柜:', cabinet)
    }
}

/**
 * 解绑指定索引的储能柜
 * @param index 已绑定列表中的索引
 */
const handleUnbindCabinet = (index: number) => {
    boundCabinets.value.splice(index, 1)
}

// 生命周期记录（嵌套结构，供 LifecycleManager 组件使用）
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

/** 将 formData 中的扁平生命周期字段同步到嵌套结构供 LifecycleManager 使用 */
const syncFormDataToRecords = () => {
  lifecycleRecords.value.filing = {
    completed: !!(formData.filingDate || formData.filingPerson),
    date: formData.filingDate,
    person: formData.filingPerson
  }
  lifecycleRecords.value.commission = {
    completed: !!(formData.commissionDate || formData.commissionPerson || formData.gridDate),
    date: formData.commissionDate,
    person: formData.commissionPerson,
    gridDate: formData.gridDate,
    commissionDate: formData.commissionDate
  }
  if (formData.changeType || formData.changeDate) {
    const parts = formData.changeDetails?.split(' | ') || ['', '']
    const serialParts = parts[1]?.split(' → ') || ['', '']
    lifecycleRecords.value.changes = [{
      type: formData.changeType,
      component: parts[0],
      oldSerial: serialParts[0],
      newSerial: serialParts[1],
      person: formData.changePerson,
      date: formData.changeDate
    }]
  } else {
    lifecycleRecords.value.changes = []
  }
  lifecycleRecords.value.migration = {
    completed: !!(formData.migrationDate || formData.migrationPerson || formData.migrationCurrentStation || formData.migrationTargetStation || formData.migrationReason),
    date: formData.migrationDate,
    person: formData.migrationPerson,
    currentStation: formData.migrationCurrentStation,
    targetStation: formData.migrationTargetStation,
    reason: formData.migrationReason
  }
  lifecycleRecords.value.maintenance = {
    completed: !!(formData.maintenanceStatus || formData.lastMaintenanceDate),
    date: formData.lastMaintenanceDate,
    person: '',
    type: formData.maintenanceStatus,
    content: '',
    items: []
  }
  lifecycleRecords.value.retirement = {
    completed: !!(formData.retirementDate || formData.retirementPerson || formData.retirementTriggerCondition || formData.retirementOperationYears || formData.retirementDestination),
    date: formData.retirementDate,
    person: formData.retirementPerson,
    triggerCondition: formData.retirementTriggerCondition,
    operationYears: formData.retirementOperationYears,
    destination: formData.retirementDestination
  }
  lifecycleRecords.value.scrap = {
    completed: !!(formData.scrapDate || formData.scrapPerson),
    date: formData.scrapDate,
    person: formData.scrapPerson
  }
}

/**
 * 将生命周期管理组件的数据同步回 formData 扁平字段
 * @param records 生命周期记录对象
 */
const syncRecordsToFormData = (records: LifecycleRecords) => {
  formData.filingDate = records.filing.date
  formData.filingPerson = records.filing.person
  formData.gridDate = records.commission.gridDate
  formData.commissionDate = records.commission.commissionDate
  formData.commissionPerson = records.commission.person
  if (records.changes.length > 0) {
    const last = records.changes[records.changes.length - 1]
    formData.changeType = last.type
    formData.changeDetails = `${last.component} | ${last.oldSerial} → ${last.newSerial}`
    formData.changeImpact = '已更新'
    formData.changePerson = last.person
    formData.changeDate = last.date
  }
  formData.migrationCurrentStation = records.migration.currentStation
  formData.migrationTargetStation = records.migration.targetStation
  formData.migrationReason = records.migration.reason
  formData.migrationPerson = records.migration.person
  formData.migrationDate = records.migration.date
  formData.maintenanceStatus = records.maintenance.type
  formData.lastMaintenanceDate = records.maintenance.date
  formData.retirementTriggerCondition = records.retirement.triggerCondition
  formData.retirementOperationYears = records.retirement.operationYears
  formData.retirementDestination = records.retirement.destination
  formData.retirementPerson = records.retirement.person
  formData.retirementDate = records.retirement.date
  formData.scrapPerson = records.scrap.person
  formData.scrapDate = records.scrap.date
}

// 初始化时同步一次
syncFormDataToRecords()

/**
 * 监听 mode 和 deviceData 变更，初始化/重置表单数据
 * create 模式：重置所有字段并预填充建档信息
 * edit/view 模式：从 deviceData 填充表单并同步生命周期
 */
watch([() => props.mode, () => props.deviceData], ([newMode, newData]) => {
  if (newMode === 'create') {
    // 重置所有数据
    Object.keys(formData).forEach(key => { (formData as any)[key] = '' })
    uploadedFiles.value = []
    boundCabinets.value = []
    selectedCabinetId.value = ''
    lifecycleRecords.value = { ...initialLifecycleRecords }
    // 预填充建档信息
    const today = getTodayStr()
    const user = userStore.userInfo.name || '管理员'
    formData.filingDate = today
    formData.filingPerson = user
    if (newData) {
      Object.assign(formData, newData)
    }
    syncFormDataToRecords()
  } else if (newData) {
    Object.assign(formData, newData)
    syncFormDataToRecords()
  }
}, { immediate: true })

/**
 * 保存储能场站表单
 * 触发 save 事件，传递表单数据、上传文件和已绑定储能柜列表
 */
const handleSave = () => {
    // TODO: 添加表单验证
    emit('save', {
        ...formData,
        uploadedFiles: uploadedFiles.value,
        boundCabinets: boundCabinets.value
    })
}
</script>
