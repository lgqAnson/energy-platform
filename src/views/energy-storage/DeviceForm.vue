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
                                <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple class="hidden"
                                    @change="handleFileUpload" />
                                <Upload class="w-12 h-12 mx-auto text-white/30 mb-3" />
                                <p class="text-white/60 text-sm mb-1">拖放或点击上传</p>
                                <p class="text-white/40 text-xs">仅支持 PDF、JPG 和 PNG 格式。最大文件尺寸 100 MB。</p>

                                <!-- 已上传文件列表 -->
                                <div v-if="uploadedFiles.length > 0" class="mt-4 space-y-2">
                                    <div v-for="(file, index) in uploadedFiles" :key="index"
                                        class="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                        <span class="text-sm text-white/70 truncate flex-1">{{ file.name }}</span>
                                        <button @click.stop="removeFile(index)"
                                            class="text-red-400 hover:text-red-300 ml-2">
                                            <X class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <!-- 查看模式显示照片 -->
                            <div class="border border-white/20 rounded-lg overflow-hidden">
                                <img v-if="deviceImage" :src="deviceImage" alt="储能柜" class="w-full h-auto" />
                                <div v-else class="p-8 text-center text-white/40">
                                    <ImageIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p class="text-sm">暂无照片</p>
                                </div>
                            </div>
                        </template>
                    </div>

                    <!-- 全生命周期管理 -->
                    <div class="space-y-4">
                        <!-- 查看模式：显示时间线 -->
                        <template v-if="mode === 'view'">
                            <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">全生命周期管理</h4>
                            <div class="space-y-0 max-h-[400px] overflow-y-auto pr-2 lifecycle-timeline">
                                <!-- 建档 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div class="w-5 h-5 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center shrink-0">
                                            <Check class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 class="text-sm font-bold text-primary mb-2">建档</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>建档日期: {{ lifecycleRecords.filing.date || '-' }}</p>
                                            <p>建档人: {{ lifecycleRecords.filing.person || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 投运 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div class="w-5 h-5 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center shrink-0">
                                            <Check class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 class="text-sm font-bold text-primary mb-2">投运</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>并网日期: {{ lifecycleRecords.commission.gridDate || '-' }}</p>
                                            <p>投运日期: {{ lifecycleRecords.commission.commissionDate || '-' }}</p>
                                            <p>负责人: {{ lifecycleRecords.commission.person || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 变更 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div :class="[
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                            lifecycleRecords.changes.length > 0 ? 'border-primary bg-primary/20' : 'border-white/30'
                                        ]">
                                            <Check v-if="lifecycleRecords.changes.length > 0" class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 :class="['text-sm font-bold mb-2', lifecycleRecords.changes.length > 0 ? 'text-primary' : 'text-white/70']">变更</h5>
                                        <div v-if="lifecycleRecords.changes.length > 0">
                                            <div v-for="(change, index) in lifecycleRecords.changes" :key="index"
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
                                            lifecycleRecords.migration.completed ? 'border-primary bg-primary/20' : 'border-white/30'
                                        ]">
                                            <Check v-if="lifecycleRecords.migration.completed" class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 :class="['text-sm font-bold mb-2', lifecycleRecords.migration.completed ? 'text-primary' : 'text-white/70']">迁移</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>当前电站: {{ lifecycleRecords.migration.currentStation || '-' }}</p>
                                            <p>迁移目标电站: {{ lifecycleRecords.migration.targetStation || '-' }}</p>
                                            <p>迁移原因: {{ lifecycleRecords.migration.reason || '-' }}</p>
                                            <p>负责人: {{ lifecycleRecords.migration.person || '-' }}</p>
                                            <p>迁移日期: {{ lifecycleRecords.migration.date || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 检修 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div :class="[
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                            lifecycleRecords.maintenance.completed ? 'border-primary bg-primary/20' : 'border-white/30'
                                        ]">
                                            <Check v-if="lifecycleRecords.maintenance.completed" class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 :class="['text-sm font-bold mb-2', lifecycleRecords.maintenance.completed ? 'text-primary' : 'text-white/70']">检修</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>检修类型: {{ lifecycleRecords.maintenance.type || '-' }}</p>
                                            <p>检修内容: {{ lifecycleRecords.maintenance.content || '-' }}</p>
                                            <p>负责人: {{ lifecycleRecords.maintenance.person || '-' }}</p>
                                            <p>检修日期: {{ lifecycleRecords.maintenance.date || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 退役 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div :class="[
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                            lifecycleRecords.retirement.completed ? 'border-primary bg-primary/20' : 'border-white/30'
                                        ]">
                                            <Check v-if="lifecycleRecords.retirement.completed" class="w-3 h-3 text-primary" />
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <h5 :class="['text-sm font-bold mb-2', lifecycleRecords.retirement.completed ? 'text-primary' : 'text-white/70']">退役</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>退役日期: {{ lifecycleRecords.retirement.date || '-' }}</p>
                                            <p>负责人: {{ lifecycleRecords.retirement.person || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- 编辑/创建模式：显示编辑表单 -->
                        <template v-else>
                            <div class="flex items-center justify-between">
                                <h4 class="text-lg font-bold text-primary border-l-4 border-primary pl-3">全生命周期管理</h4>
                                <button @click="handleLifecycleSave"
                                    class="px-5 py-1.5 text-sm bg-primary hover:bg-primary/80 text-white rounded transition-colors">
                                    保存
                                </button>
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
                                        <input v-model="lifecycleEditForm.filing.date" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">建档人 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.filing.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                                <!-- 投运 -->
                                <template v-if="selectedLifecycleStage === 'commission'">
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">验收日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.commission.acceptanceDate" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">投运日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.commission.commissionDate" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.commission.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                                <!-- 变更 -->
                                <template v-if="selectedLifecycleStage === 'change'">
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">变更类型 <span class="text-red-400">*</span></label>
                                        <select v-model="lifecycleEditForm.change.type"
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
                                        <select v-model="lifecycleEditForm.change.component"
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
                                        <input v-model="lifecycleEditForm.change.oldSerial" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">新部件序列号 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.change.newSerial" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.change.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">变更日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.change.date" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                                <!-- 迁移 -->
                                <template v-if="selectedLifecycleStage === 'migration'">
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">当前电站 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.migration.currentStation" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">迁移目标电站 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.migration.targetStation" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">迁移原因 <span class="text-red-400">*</span></label>
                                        <select v-model="lifecycleEditForm.migration.reason"
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
                                        <input v-model="lifecycleEditForm.migration.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">迁移日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.migration.date" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                                <!-- 检修 -->
                                <template v-if="selectedLifecycleStage === 'maintenance'">
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">检修类型 <span class="text-red-400">*</span></label>
                                        <select v-model="lifecycleEditForm.maintenance.type"
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
                                                <input type="checkbox" v-model="lifecycleEditForm.maintenance.items" :value="item"
                                                    class="w-4 h-4 rounded border-white/30 bg-white/10 text-primary focus:ring-primary" />
                                                <span>{{ item }}</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.maintenance.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">检修日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.maintenance.date" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                                <!-- 退役 -->
                                <template v-if="selectedLifecycleStage === 'retirement'">
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">退役触发条件 <span class="text-red-400">*</span></label>
                                        <select v-model="lifecycleEditForm.retirement.triggerCondition"
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
                                        <input v-model="lifecycleEditForm.retirement.operationYears" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">退役去向 <span class="text-red-400">*</span></label>
                                        <select v-model="lifecycleEditForm.retirement.destination"
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
                                        <input v-model="lifecycleEditForm.retirement.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">退役日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.retirement.date" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                                <!-- 报废 -->
                                <template v-if="selectedLifecycleStage === 'scrap'">
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">负责人 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.scrap.person" type="text" placeholder="请输入"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-primary" />
                                    </div>
                                    <div class="space-y-1">
                                        <label class="text-sm text-primary">报废日期 <span class="text-red-400">*</span></label>
                                        <input v-model="lifecycleEditForm.scrap.date" type="date"
                                            class="w-full px-3 py-2 text-sm rounded bg-white/10 border border-white/20 text-white focus:outline-none focus:border-primary" />
                                    </div>
                                </template>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Upload, X, Check, Image as ImageIcon } from 'lucide-vue-next'

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
}

// 定义变更纪录类型
interface ChangeRecord {
    type: string
    component: string
    oldSerial: string
    newSerial: string
    person: string
    date: string
}

// 定义生命周期环节类型
interface LifecycleStage {
    completed: boolean
    date: string
    person: string
    notes?: string
    [key: string]: any  // 允许额外字段
}

// 定义生命周期记录类型
interface LifecycleRecords {
    filing: LifecycleStage  // 建档
    commission: LifecycleStage  // 投运
    changes: ChangeRecord[]  // 变更
    migration: LifecycleStage  // 迁移
    maintenance: LifecycleStage  // 检修
    retirement: LifecycleStage  // 退役
    scrap: LifecycleStage  // 报废
    currentStage: string  // 当前所处环节
}

const fileInput = ref<HTMLInputElement | null>(null)
const deviceImage = ref<string>('')
const uploadedFiles = ref<UploadedFile[]>([])

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
const lifecycleRecords = reactive<LifecycleRecords>({
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
        content: ''
    },
    retirement: {
        completed: false,
        date: '',
        person: ''
    },
    scrap: {
        completed: false,
        date: '',
        person: ''
    }
})

// 生命周期环节标签
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

const lifecycleEditForm = reactive({
    filing: { date: '', person: '' },
    commission: { acceptanceDate: '', commissionDate: '', person: '' },
    change: { type: '', component: '', oldSerial: '', newSerial: '', person: '', date: '' },
    migration: { currentStation: '', targetStation: '', reason: '', person: '', date: '' },
    maintenance: { type: '', items: [] as string[], person: '', date: '' },
    retirement: { triggerCondition: '', operationYears: '', destination: '', person: '', date: '' },
    scrap: { person: '', date: '' }
})

// 监听 deviceData 变化
watch(() => props.deviceData, (newData) => {
    if (newData) {
        Object.assign(formData, newData)
        deviceImage.value = newData.image || ''
        if (newData.lifecycle) {
            Object.assign(lifecycleRecords, newData.lifecycle)
        }
    }
}, { immediate: true })

// 保存设备
const handleSave = () => {
    if (!formData.cabinetCode) {
        alert('请填写柜体编号')
        return
    }

    emit('save', {
        ...formData,
        images: uploadedFiles.value,
        lifecycle: lifecycleRecords
    })
}

// 文件上传处理
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files) {
        const files = Array.from(target.files)
        files.forEach(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
            if (!validTypes.includes(file.type)) {
                alert(`文件 ${file.name} 格式不支持，仅支持 PDF、JPG 和 PNG 格式`)
                return
            }

            if (file.size > 100 * 1024 * 1024) {
                alert(`文件 ${file.name} 超过 100MB 限制`)
                return
            }

            uploadedFiles.value.push({
                name: file.name,
                size: file.size,
                type: file.type
            })
        })

        target.value = ''
    }
}

// 拖拽上传处理
const handleFileDrop = (event: DragEvent) => {
    if (event.dataTransfer) {
        const files = Array.from(event.dataTransfer.files)
        files.forEach(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
            if (!validTypes.includes(file.type)) {
                alert(`文件 ${file.name} 格式不支持`)
                return
            }

            if (file.size > 100 * 1024 * 1024) {
                alert(`文件 ${file.name} 超过 100MB 限制`)
                return
            }

            uploadedFiles.value.push({
                name: file.name,
                size: file.size,
                type: file.type
            })
        })
    }
}

// 删除已上传文件
const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
}

// 触发文件上传
const triggerFileUpload = () => {
    fileInput.value?.click()
}

// 处理生命周期记录保存
const handleLifecycleSave = () => {
    const stage = selectedLifecycleStage.value
    const data = lifecycleEditForm[stage as keyof typeof lifecycleEditForm]
    if (stage === 'change') {
        lifecycleRecords.changes.push({
            type: (data as any).type,
            component: (data as any).component,
            oldSerial: (data as any).oldSerial,
            newSerial: (data as any).newSerial,
            person: (data as any).person,
            date: (data as any).date
        })
    } else if (stage === 'filing') {
        lifecycleRecords.filing = { ...(data as any), completed: true }
    } else if (stage === 'commission') {
        lifecycleRecords.commission = {
            ...lifecycleRecords.commission,
            ...(data as any),
            gridDate: (data as any).acceptanceDate,
            completed: true
        }
    } else if (stage === 'migration') {
        lifecycleRecords.migration = { ...lifecycleRecords.migration, ...(data as any), completed: true }
    } else if (stage === 'maintenance') {
        lifecycleRecords.maintenance = { ...lifecycleRecords.maintenance, ...(data as any), completed: true }
    } else if (stage === 'retirement') {
        lifecycleRecords.retirement = { ...(data as any), completed: true }
    } else if (stage === 'scrap') {
        lifecycleRecords.scrap = { ...(data as any), completed: true }
    }
    alert('保存成功')
}

// 暴露方法供父组件调用
defineExpose({
    resetForm: () => {
        Object.keys(formData).forEach(key => {
            (formData as any)[key] = ''
        })
        uploadedFiles.value = []
        deviceImage.value = ''
    }
})
</script>