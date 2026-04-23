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
                    <!-- 文件上传区 -->
                    <div class="space-y-4">
                        <div class="border-2 border-dashed border-white/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            @click="triggerFileUpload">
                            <div class="text-white/40 text-3xl mb-2">+</div>
                            <p class="text-white/60 text-sm mb-1">拖放或点击上传</p>
                            <p class="text-white/40 text-xs">仅支持 PDF、JPG 和 PNG 格式。最大文件尺寸 100 MB。</p>
                            <input ref="fileInput" type="file" class="hidden" accept=".pdf,.jpg,.jpeg,.png"
                                @change="handleFileChange" />
                        </div>
                        <!-- 已上传文件列表 -->
                        <div v-if="uploadedFiles.length > 0" class="space-y-2">
                            <div v-for="(file, index) in uploadedFiles" :key="index"
                                class="flex items-center justify-between px-3 py-2 bg-white/5 rounded">
                                <span class="text-sm text-white/70">{{ file.name }}</span>
                                <button v-if="mode !== 'view'" @click="removeFile(index)"
                                    class="text-red-400 hover:text-red-300 text-xs">
                                    删除
                                </button>
                            </div>
                        </div>
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
                                            <p>建档日期: {{ formData.filingDate || '-' }}</p>
                                            <p>建档人: {{ formData.filingPerson || '-' }}</p>
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
                                            <p>并网日期: {{ formData.gridDate || '-' }}</p>
                                            <p>投运日期: {{ formData.commissionDate || '-' }}</p>
                                            <p>负责人: {{ formData.commissionPerson || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 变更 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div :class="[
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                            hasChangeRecord ? 'border-primary bg-primary/20' : 'border-white/30'
                                        ]">
                                            <Check v-if="hasChangeRecord" class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 :class="['text-sm font-bold mb-2', hasChangeRecord ? 'text-primary' : 'text-white/70']">变更</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>变更类型: {{ formData.changeType || '-' }}</p>
                                            <p>变更内容详情: {{ formData.changeDetails || '-' }}</p>
                                            <p>变更影响: {{ formData.changeImpact || '-' }}</p>
                                            <p>负责人: {{ formData.changePerson || '-' }}</p>
                                            <p>变更日期: {{ formData.changeDate || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 迁移 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div class="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0"></div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 class="text-sm font-bold text-white/70 mb-2">迁移</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>当前电站: -</p>
                                            <p>迁移目标电站: -</p>
                                            <p>迁移原因: -</p>
                                            <p>负责人: -</p>
                                            <p>迁移日期: -</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 检修 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div :class="[
                                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                                            hasMaintenanceRecord ? 'border-primary bg-primary/20' : 'border-white/30'
                                        ]">
                                            <Check v-if="hasMaintenanceRecord" class="w-3 h-3 text-primary" />
                                        </div>
                                        <div class="w-0.5 flex-1 bg-white/20 min-h-[20px]"></div>
                                    </div>
                                    <div class="flex-1 pb-4">
                                        <h5 :class="['text-sm font-bold mb-2', hasMaintenanceRecord ? 'text-primary' : 'text-white/70']">检修</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>检修类型: {{ formData.maintenanceStatus || '-' }}</p>
                                            <p>最后运维日期: {{ formData.lastMaintenanceDate || '-' }}</p>
                                        </div>
                                    </div>
                                </div>
                                <!-- 退役 -->
                                <div class="flex gap-3">
                                    <div class="flex flex-col items-center pt-0.5">
                                        <div class="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center shrink-0"></div>
                                    </div>
                                    <div class="flex-1">
                                        <h5 class="text-sm font-bold text-white/70 mb-2">退役</h5>
                                        <div class="space-y-1 text-xs text-white/60">
                                            <p>退役日期: -</p>
                                            <p>负责人: -</p>
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
import { ref, reactive, watch, computed } from 'vue'
import { Check } from 'lucide-vue-next'

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

const fileInput = ref<HTMLInputElement>()
const uploadedFiles = ref<any[]>([])
const selectedCabinetId = ref('')
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
    lastMaintenanceDate: ''
})

// 监听 deviceData 变化
watch(() => props.deviceData, (newData) => {
    if (newData) {
        Object.assign(formData, newData)
    }
}, { immediate: true })

// 触发文件上传
const triggerFileUpload = () => {
    fileInput.value?.click()
}

// 处理文件选择
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
        const file = target.files[0]
        // 验证文件类型和大小
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
        const maxSize = 100 * 1024 * 1024 // 100MB

        if (!validTypes.includes(file.type)) {
            alert('仅支持 PDF、JPG 和 PNG 格式')
            return
        }

        if (file.size > maxSize) {
            alert('文件大小不能超过 100MB')
            return
        }

        uploadedFiles.value.push({
            name: file.name,
            size: file.size,
            type: file.type
        })

        // 清空 input 以便重复选择同一文件
        target.value = ''
    }
}

// 删除文件
const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
}

// 计算已选中储能柜的名称
const selectedCabinetName = computed(() => {
    const cabinet = availableCabinets.value.find(c => c.id === selectedCabinetId.value)
    return cabinet ? `${cabinet.name} (${cabinet.code})` : ''
})

// 是否有变更记录
const hasChangeRecord = computed(() => {
    return !!(formData.changeType || formData.changeDate)
})

// 是否有检修记录
const hasMaintenanceRecord = computed(() => {
    return !!(formData.maintenanceStatus || formData.lastMaintenanceDate)
})

// 绑定储能柜
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

// 解绑储能柜
const handleUnbindCabinet = (index: number) => {
    boundCabinets.value.splice(index, 1)
}

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

// 处理生命周期记录保存
const handleLifecycleSave = () => {
    const stage = selectedLifecycleStage.value
    const data = lifecycleEditForm[stage as keyof typeof lifecycleEditForm]
    if (stage === 'filing') {
        formData.filingDate = (data as any).date
        formData.filingPerson = (data as any).person
    } else if (stage === 'commission') {
        formData.gridDate = (data as any).acceptanceDate
        formData.commissionDate = (data as any).commissionDate
        formData.commissionPerson = (data as any).person
    } else if (stage === 'change') {
        formData.changeType = (data as any).type
        formData.changeDetails = `${(data as any).component} | ${(data as any).oldSerial} → ${(data as any).newSerial}`
        formData.changeImpact = '已更新'
        formData.changePerson = (data as any).person
        formData.changeDate = (data as any).date
    } else if (stage === 'maintenance') {
        formData.maintenanceStatus = (data as any).type
        formData.lastMaintenanceDate = (data as any).date
    }
    alert('保存成功')
}

// 保存表单
const handleSave = () => {
    // TODO: 添加表单验证
    emit('save', {
        ...formData,
        uploadedFiles: uploadedFiles.value,
        boundCabinets: boundCabinets.value
    })
}
</script>
