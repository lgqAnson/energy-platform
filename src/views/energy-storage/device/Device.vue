<template>
  <div class="space-y-5">
    <CardPanel title="设备管理">
      <div class="flex gap-4 h-[calc(100vh-280px)] min-h-[600px]">
        <!-- 左侧设备树面板 -->
        <div class="w-[300px] flex-shrink-0 rounded-lg overflow-hidden"
          style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.08) 0%, rgba(85, 85, 85, 0.05) 100%);">
          <!-- 标题 -->
          <div class="px-4 py-3 border-b border-white/10">
            <h3 class="text-primary font-bold text-lg">设备列表</h3>
          </div>

          <!-- 搜索框 -->
          <div class="p-3 border-b border-white/10">
            <div class="flex gap-2">
              <input v-model="searchKeyword" type="text" placeholder="请输入设备名称/编号"
                class="flex-1 px-3 py-1.5 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
              <button @click="handleSearch"
                class="px-4 py-1.5 text-sm bg-primary/30 hover:bg-primary/50 text-white rounded transition-colors">
                查询
              </button>
            </div>
          </div>

          <!-- 状态筛选 -->
          <div class="px-3 py-2 border-b border-white/10">
            <div class="flex flex-wrap gap-x-4 gap-y-1">
              <label v-for="status in statusFilters" :key="status.key"
                class="flex items-center gap-1.5 cursor-pointer text-white/70 hover:text-white text-xs">
                <input type="checkbox" v-model="selectedStatuses" :value="status.key"
                  class="w-3.5 h-3.5 rounded border-white/30 bg-white/10 text-primary focus:ring-primary" />
                {{ status.value }}
              </label>
            </div>
          </div>

          <!-- 设备树 -->
          <div class="flex-1 overflow-y-auto p-2" style="max-height: calc(100% - 140px);">
            <div v-for="(category, catIndex) in deviceTree" :key="catIndex" class="mb-2">
              <!-- 一级分类 -->
              <div class="flex items-center gap-1 py-1.5 cursor-pointer">
                <ChevronDown v-if="category.expanded" class="w-3.5 h-3.5 text-primary flex-shrink-0 cursor-pointer"
                  @click.stop="toggleCategory(catIndex)" />
                <ChevronRight v-else class="w-3.5 h-3.5 text-white/50 flex-shrink-0 cursor-pointer"
                  @click.stop="toggleCategory(catIndex)" />
                <span class="text-sm text-primary font-medium underline cursor-pointer"
                  @click="selectCategory(category, catIndex)">{{ category.name }}</span>
              </div>

              <!-- 二级站点 -->
              <div v-if="category.expanded" class="ml-4">
                <div v-for="(station, staIndex) in category.children" :key="staIndex" class="mb-1">
                  <div class="flex items-center gap-1 py-1 cursor-pointer">
                    <ChevronDown v-if="station.expanded" class="w-3 h-3 text-primary flex-shrink-0 cursor-pointer"
                      @click.stop="toggleStation(catIndex, staIndex)" />
                    <ChevronRight v-else class="w-3 h-3 text-white/50 flex-shrink-0 cursor-pointer"
                      @click.stop="toggleStation(catIndex, staIndex)" />
                    <span class="text-sm text-white/80 cursor-pointer"
                      @click="selectStation(station, catIndex, staIndex)">{{ station.name }}</span>
                    <button v-if="station.deletable" @click.stop="handleDelete('station', catIndex, staIndex)"
                      class="ml-auto text-xs text-red-400 hover:text-red-300">
                      删除
                    </button>
                  </div>

                  <!-- 三级设备 -->
                  <div v-if="station.expanded" class="ml-4">
                    <div v-for="(device, devIndex) in station.children" :key="devIndex"
                      class="flex items-center py-1 px-2 cursor-pointer rounded hover:bg-white/10"
                      :class="{ 'bg-primary/20': selectedDevice?.id === device.id }" @click="selectDevice(device)">
                      <span class="text-sm text-white/70">{{ device.name }}</span>
                      <button @click.stop="handleDelete('device', catIndex, staIndex, devIndex)"
                        class="ml-auto text-xs text-red-400 hover:text-red-300">
                        删除
                      </button>
                    </div>

                    <!-- 新增设备按钮 -->
                    <div v-if="station.addable"
                      class="py-1 px-2 cursor-pointer text-xs text-green-400 hover:text-green-300"
                      @click="handleAddDevice(catIndex, staIndex)">
                      +{{ station.addText }}
                    </div>
                  </div>
                </div>

                <!-- 新增站点按钮 -->
                <div v-if="category.addable"
                  class="py-1 px-2 ml-4 cursor-pointer text-xs text-green-400 hover:text-green-300"
                  @click="handleAddStation(catIndex)">
                  +{{ category.addText }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="flex-1 rounded-lg overflow-hidden relative"
          style="background: linear-gradient(180deg, rgba(129, 211, 248, 0.06) 0%, rgba(85, 85, 85, 0.04) 100%);">

          <!-- 新建/编辑储能柜表单 -->
          <DeviceForm v-if="showForm" :mode="formMode" :device-data="currentDeviceData" @save="handleFormSave"
            @cancel="handleFormCancel" @edit="handleFormEdit" @add-lifecycle-record="handleAddLifecycleRecord" />

          <!-- 新建/编辑储能站点表单 -->
          <StationForm v-if="showStationForm" :mode="formMode" :device-data="currentDeviceData"
            @save="handleStationFormSave" @cancel="handleStationFormCancel" @edit="handleFormEdit"
            @add-lifecycle-record="handleAddLifecycleRecord" />

          <!-- 空状态提示 -->
          <div v-if="!showForm && !showStationForm" class="h-full">
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center space-y-2">
                <p class="text-white/50 text-lg">请在左侧列表点击选中设备或站点，</p>
                <p class="text-white/50 text-lg">查询详细信息。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardPanel>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CardPanel from '@/components/common/CardPanel.vue'
import DeviceForm from './DeviceForm.vue'
import StationForm from './StationForm.vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useRealtimeChannel } from '@/composables/useRealtimeChannel'

const router = useRouter()
const route = useRoute()

// 标签页配置
const tabs = [
  { name: '设备管理', path: '/energy-storage/device' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]

// 搜索和筛选状态
const searchKeyword = ref('')
const selectedStatuses = ref<string[]>(['created', 'commission', 'change', 'migration', 'maintenance', 'retirement', 'scrap'])
const statusFilters = [
  { value: '新建', key: 'created' },
  { value: '投运', key: 'commission' },
  { value: '变更', key: 'change' },
  { value: '迁移', key: 'migration' },
  { value: '检修', key: 'maintenance' },
  { value: '退役', key: 'retirement' },
  { value: '报废', key: 'scrap' }
]

// 设备树数据结构
type Device = {
  id: string
  name: string
  code: string
  status: string
  type?: string
  station?: string
}

type Station = {
  name: string
  expanded: boolean
  deletable: boolean
  addable: boolean
  addText: string
  children: Device[]
}

type Category = {
  name: string
  expanded: boolean
  addable: boolean
  addText: string
  children: Station[]
}

const deviceTree = ref<Category[]>([
  {
    name: '储能电站',
    expanded: true,
    addable: true,
    addText: '新增站点',
    children: [
      {
        name: '储能站点A',
        expanded: true,
        deletable: true,
        addable: true,
        addText: '新增设备',
        children: [
          { id: 'ess-a-1', name: '储能柜01', code: 'ESS-A-01', status: '运行中', type: '储能柜', station: '储能站点A' },
          { id: 'ess-a-2', name: '储能柜02', code: 'ESS-A-02', status: '待机', type: '储能柜', station: '储能站点A' }
        ]
      }
    ]
  }
])

// WebSocket 实时数据订阅（5s）
useRealtimeChannel('device', (payload) => {
  if (payload.deviceUpdates) {
    payload.deviceUpdates.forEach((update: any) => {
      // 在设备树中查找并更新对应设备状态
      deviceTree.value.forEach((cat) => {
        cat.children.forEach((station) => {
          const device = station.children.find((d) => d.id === update.id)
          if (device) {
            device.status = update.status
          }
        })
      })
    })
  }
})

const selectedDevice = ref<Device | null>(null)

const showAddForm = ref(false)
const showForm = ref(false)
const showStationForm = ref(false)
const formMode = ref<'create' | 'edit' | 'view'>('view')
const currentDeviceData = ref<any>(null)
const currentStationInfo = ref<{ catIndex: number, staIndex: number } | null>(null)
const currentCategoryInfo = ref<{ catIndex: number } | null>(null)

// 选择分类（打开分类详情）
const selectCategory = (category: Category, catIndex: number) => {
  // TODO: 可以显示分类级别的详情或统计信息
  console.log('选中分类:', category.name)
  selectedDevice.value = null
  showForm.value = false
  showStationForm.value = false
}

// 选择站点（打开站点详情表单）
const selectStation = (station: Station, catIndex: number, staIndex: number) => {
  currentCategoryInfo.value = { catIndex }
  // 传入完整的站点数据，字段名匹配 StationForm 的 formData
  currentDeviceData.value = {
    dispatchCode: station.name,  // 站点名称映射到调度命名编号
    stationName: station.name,
    stationType: '35kV',  // 默认值
    deviceCount: station.children.length,
    status: '运行中'
  }
  showStationForm.value = true
  formMode.value = 'view'
  selectedDevice.value = null
  showForm.value = false
}
// 选择设备（打开设备详情表单）
const selectDevice = (device: Device) => {
  selectedDevice.value = device
  showForm.value = true  // 显示 DeviceForm
  showStationForm.value = false
  formMode.value = 'view'  // 查看模式
  // 映射字段名以匹配 DeviceForm 的 formData 结构
  currentDeviceData.value = {
    cabinetCode: device.name,  // 设备名称映射到柜体编号
    factoryCode: device.code,  // 设备编号映射到出厂编号
    cabinetType: device.type || '储能柜',
    status: device.status,
    station: device.station
  }
}

// ... existing code ...

// 打开新建设备表单
const handleAddDevice = (catIndex: number, staIndex: number) => {
  currentStationInfo.value = { catIndex, staIndex }
  showForm.value = true
  showStationForm.value = false
  formMode.value = 'create'
  currentDeviceData.value = null
  selectedDevice.value = null
}

// 表单保存处理
const handleFormSave = (data: any) => {
  if (formMode.value === 'create' && currentStationInfo.value) {
    // 新建模式
    const { catIndex, staIndex } = currentStationInfo.value
    const station = deviceTree.value[catIndex].children[staIndex]
    const newId = `${station.name.toLowerCase().replace(/\s+/g, '-')}-${station.children.length + 1}`

    const newDevice: Device = {
      id: newId,
      name: data.cabinetCode,
      code: data.cabinetCode.toUpperCase(),
      status: '建档',
      type: data.cabinetType || '储能柜',
      station: station.name
    }

    station.children.push(newDevice)

    // 保存成功后切换到查看模式
    selectedDevice.value = newDevice
    currentDeviceData.value = {
      cabinetCode: newDevice.name,
      factoryCode: newDevice.code,
      cabinetType: newDevice.type,
      status: newDevice.status,
      station: newDevice.station
    }
    formMode.value = 'view'
    currentStationInfo.value = null
  } else if (formMode.value === 'edit' && selectedDevice.value) {
    // 编辑模式 - 更新设备信息
    console.log('更新设备:', data)

    // 查找并更新设备树中的设备数据
    for (const category of deviceTree.value) {
      for (const station of category.children) {
        const deviceIndex = station.children.findIndex(d => d.id === selectedDevice.value!.id)
        if (deviceIndex !== -1) {
          station.children[deviceIndex] = {
            ...station.children[deviceIndex],
            name: data.cabinetCode || station.children[deviceIndex].name,
            code: data.cabinetCode?.toUpperCase() || station.children[deviceIndex].code,
            type: data.cabinetType || station.children[deviceIndex].type,
            status: data.status || station.children[deviceIndex].status
          }
          break
        }
      }
    }

    // 更新选中的设备
    selectedDevice.value = {
      ...selectedDevice.value,
      name: data.cabinetCode || selectedDevice.value.name,
      code: data.cabinetCode?.toUpperCase() || selectedDevice.value.code,
      type: data.cabinetType || selectedDevice.value.type,
      status: data.status || selectedDevice.value.status
    }

    // 切换到查看模式
    formMode.value = 'view'
  }
}

// 表单取消处理
const handleFormCancel = () => {
  if (formMode.value === 'edit') {
    // 如果是编辑模式，取消后返回查看模式
    formMode.value = 'view'
    // 重新加载设备数据
    if (selectedDevice.value) {
      currentDeviceData.value = selectedDevice.value
    }
  } else if (formMode.value === 'create') {
    // 如果是新建模式，切换到查看模式（显示空数据）
    formMode.value = 'view'
  }
}

// 表单编辑处理
const handleFormEdit = () => {
  formMode.value = 'edit'
}

// 添加生命周期记录
const handleAddLifecycleRecord = () => {
  console.log('添加生命周期记录')
  // TODO: 实现添加生命周期记录的逻辑
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索:', searchKeyword.value, selectedStatuses.value)
  // TODO: 实现搜索逻辑
}

// 切换分类展开/收起
const toggleCategory = (catIndex: number) => {
  deviceTree.value[catIndex].expanded = !deviceTree.value[catIndex].expanded
}

// 切换站点展开/收起
const toggleStation = (catIndex: number, staIndex: number) => {
  deviceTree.value[catIndex].children[staIndex].expanded = !deviceTree.value[catIndex].children[staIndex].expanded
}

// 删除处理
const handleDelete = (type: 'station' | 'device', catIndex: number, staIndex: number, devIndex?: number) => {
  if (type === 'station') {
    // 删除站点确认逻辑可以在这里添加
    deviceTree.value[catIndex].children.splice(staIndex, 1)
  } else if (type === 'device' && devIndex !== undefined) {
    // 删除设备确认逻辑可以在这里添加
    deviceTree.value[catIndex].children[staIndex].children.splice(devIndex, 1)
  }
}

// 新增站点处理
const handleAddStation = (catIndex: number) => {
  currentCategoryInfo.value = { catIndex }
  showStationForm.value = true
  showForm.value = false
  formMode.value = 'create'
  currentDeviceData.value = null
  selectedDevice.value = null
}

// 站点表单保存处理
const handleStationFormSave = (data: any) => {
  if (formMode.value === 'create' && currentCategoryInfo.value) {
    const { catIndex } = currentCategoryInfo.value
    const newStation: Station = {
      name: data.dispatchCode || `新站点${deviceTree.value[catIndex].children.length + 1}`,
      expanded: true,
      deletable: true,
      addable: true,
      addText: '新增设备',
      children: []
    }
    deviceTree.value[catIndex].children.push(newStation)

    // 保存成功后切换到查看模式
    currentDeviceData.value = {
      dispatchCode: newStation.name,
      stationName: newStation.name,
      stationType: '35kV',
      deviceCount: 0,
      status: '运行中'
    }
    formMode.value = 'view'
    currentCategoryInfo.value = null
  } else if (formMode.value === 'edit') {
    // 更新站点信息逻辑
    console.log('更新站点:', data)
    formMode.value = 'view'
  }
}

// 站点表单取消处理
const handleStationFormCancel = () => {
  // 取消后切换到查看模式
  formMode.value = 'view'
}

// ... existing code ...
</script>