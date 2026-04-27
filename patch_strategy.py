import sys

path = 'src/views/energy-storage/strategy/Strategy.vue'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. import reactive
content = content.replace(
    "import { ref, computed } from 'vue'",
    "import { ref, computed, reactive } from 'vue'"
)

# 2. 新建策略按钮绑定
content = content.replace(
    '<button class="toolbar-btn btn-primary">',
    '<button class="toolbar-btn btn-primary" @click="openStrategyForm(\'add\')">'
)

# 3. 列表操作按钮绑定
old_icons = '''                    <button class="icon-btn" title="编辑"><Pencil class="icon-sm" /></button>
                      <button class="icon-btn" title="删除"><Trash2 class="icon-sm" /></button>
                      <button class="icon-btn" title="查看"><Eye class="icon-sm" /></button>'''
new_icons = '''                    <button class="icon-btn" title="编辑" @click="openStrategyForm(\'edit\', idx)"><Pencil class="icon-sm" /></button>
                      <button class="icon-btn" title="删除" @click="strategyList.splice(idx, 1)"><Trash2 class="icon-sm" /></button>
                      <button class="icon-btn" title="查看" @click="openStrategyForm(\'view\', idx)"><Eye class="icon-sm" /></button>'''
content = content.replace(old_icons, new_icons)

# 4. 插入新弹窗模板
new_modal = '''  </Teleport>

  <!-- 充放电策略配置弹窗 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="strategyFormVisible" class="modal-overlay" @click="closeStrategyForm">
        <div class="strategy-form-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <Zap class="modal-title-icon" />
              <span>{{ formTitle }}</span>
            </div>
            <button class="modal-close" @click="closeStrategyForm">
              <X />
            </button>
          </div>
          <div class="strategy-form-body">
            <!-- 左栏 -->
            <div class="form-left">
              <div class="form-group">
                <label class="form-label">策略名称</label>
                <input v-model="form.name" :readonly="isViewMode" type="text" class="form-input" placeholder="请输入策略名称" />
              </div>
              <div class="form-group">
                <label class="form-label">策略类型</label>
                <select v-model="form.type" :disabled="isViewMode" class="form-select">
                  <option value="日常策略">日常策略</option>
                  <option value="节假日策略">节假日策略</option>
                  <option value="特殊日策略">特殊日策略</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">生效时段</label>
                <div class="time-range-row">
                  <input v-model="form.startTime" :readonly="isViewMode" type="time" class="form-time" />
                  <span class="time-sep">至</span>
                  <input v-model="form.endTime" :readonly="isViewMode" type="time" class="form-time" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">适用日期</label>
                <div class="date-type-tabs">
                  <button v-for="t in dateTabs" :key="t.key" :class="['date-tab', { active: form.dateType === t.key }]" @click="form.dateType = t.key">{{ t.label }}</button>
                </div>
                <div class="calendar-box">
                  <div class="calendar-nav">
                    <button class="cal-nav-btn" @click="prevMonth">&lt; 上月</button>
                    <span class="cal-month">{{ calendarYear }}年{{ calendarMonth }}月</span>
                    <button class="cal-nav-btn" @click="nextMonth">下月 &gt;</button>
                    <button class="cal-select-btn">选择日期</button>
                  </div>
                  <div class="calendar-week-row">
                    <span v-for="d in weekDays" :key="d" class="cal-weekday">{{ d }}</span>
                  </div>
                  <div class="calendar-day-grid">
                    <span v-for="(day, didx) in calendarDays" :key="didx" :class="['cal-day', day.class]" @click="toggleDate(day)">{{ day.day }}</span>
                  </div>
                  <div class="calendar-btns">
                    <button class="cal-action edit"><Pencil class="cal-icon" /></button>
                    <button class="cal-action delete"><Trash2 class="cal-icon" /></button>
                    <button class="cal-action add"><Plus class="cal-icon" /></button>
                  </div>
                </div>
              </div>
            </div>
            <!-- 右栏 -->
            <div class="form-right">
              <div class="form-group slider-group">
                <label class="form-label">充电功率 (kW) <span class="val-highlight">{{ form.chargePower }} kW</span></label>
                <input type="range" v-model.number="form.chargePower" :disabled="isViewMode" min="0" max="500" class="form-slider" />
              </div>
              <div class="form-group slider-group">
                <label class="form-label">放电功率 (kW) <span class="val-highlight">{{ form.dischargePower }} kW</span></label>
                <input type="range" v-model.number="form.dischargePower" :disabled="isViewMode" min="0" max="500" class="form-slider" />
              </div>
              <div class="form-group slider-group">
                <label class="form-label">SOC控制范围</label>
                <div class="soc-dual">
                  <div class="soc-item">
                    <span class="soc-label">充电上限</span>
                    <input type="range" v-model.number="form.socUpper" :disabled="isViewMode" min="0" max="100" class="form-slider" />
                    <span class="soc-val">{{ form.socUpper }}%</span>
                  </div>
                  <div class="soc-item">
                    <span class="soc-label">放电下限</span>
                    <input type="range" v-model.number="form.socLower" :disabled="isViewMode" min="0" max="100" class="form-slider" />
                    <span class="soc-val">{{ form.socLower }}%</span>
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">高级控制</label>
                <div class="advanced-box">
                  <div class="adv-row">
                    <span class="adv-name">防逆流控制</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="form.antiReflux" :disabled="isViewMode" />
                      <span class="toggle-track"></span>
                    </label>
                    <span class="adv-threshold">阈值: {{ form.antiRefluxThreshold }}kW</span>
                  </div>
                  <div class="adv-row">
                    <span class="adv-name">需量管理</span>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="form.demandManage" :disabled="isViewMode" />
                      <span class="toggle-track"></span>
                    </label>
                    <span class="adv-threshold">阈值: {{ form.demandThreshold }}kW</span>
                  </div>
                </div>
              </div>
              <div class="form-group chart-group">
                <label class="form-label">策略预览</label>
                <v-chart class="preview-chart" :option="previewOption" autoresize />
              </div>
            </div>
          </div>
          <div class="form-footer">
            <button class="btn-form-cancel" @click="closeStrategyForm">取消</button>
            <button v-if="!isViewMode" class="btn-form-save" @click="saveStrategyForm">保存策略</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>'''

content = content.replace('  </Teleport>\n\n  </div>\n</template>', new_modal + '\n\n  </div>\n</template>')

# 5. 插入脚本逻辑
new_script = '''\n\n// ===== 策略配置表单弹窗 =====\nconst strategyFormVisible = ref(false)\nconst formMode = ref<'add' | 'edit' | 'view'>('add')\nconst isViewMode = computed(() => formMode.value === 'view')\n\nconst formTitle = computed(() => {\n  if (formMode.value === 'add') return '充放电策略配置'\n  if (formMode.value === 'edit') return '编辑充放电策略'\n  return '查看充放电策略'\n})\n\nconst form = reactive({\n  name: '',\n  type: '日常策略',\n  startTime: '00:00',\n  endTime: '23:59',\n  dateType: 'weekday' as 'weekday' | 'holiday' | 'special',\n  selectedDates: [] as string[],\n  chargePower: 150,\n  dischargePower: 200,\n  socUpper: 95,\n  socLower: 20,\n  antiReflux: false,\n  antiRefluxThreshold: 5,\n  demandManage: false,\n  demandThreshold: 800,\n})\n\nconst dateTabs = [\n  { key: 'weekday', label: '平日' },\n  { key: 'holiday', label: '节假日' },\n  { key: 'special', label: '特殊日期' }\n]\nconst weekDays = ['日', '一', '二', '三', '四', '五', '六']\n\nconst calendarYear = ref(2026)\nconst calendarMonth = ref(3)\n\nfunction getCalendarDays(year: number, month: number) {\n  const firstDay = new Date(year, month - 1, 1).getDay()\n  const daysInMonth = new Date(year, month, 0).getDate()\n  const days: { day: string; date: string; class: string }[] = []\n  for (let i = 0; i < firstDay; i++) {\n    days.push({ day: '', date: '', class: 'empty' })\n  }\n  for (let i = 1; i <= daysInMonth; i++) {\n    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`\n    const isSelected = form.selectedDates.includes(dateStr)\n    days.push({ day: String(i), date: dateStr, class: isSelected ? 'selected' : '' })\n  }\n  return days\n}\nconst calendarDays = computed(() => getCalendarDays(calendarYear.value, calendarMonth.value))\n\nfunction prevMonth() {\n  if (calendarMonth.value === 1) { calendarMonth.value = 12; calendarYear.value-- }\n  else { calendarMonth.value-- }\n}\nfunction nextMonth() {\n  if (calendarMonth.value === 12) { calendarMonth.value = 1; calendarYear.value++ }\n  else { calendarMonth.value++ }\n}\nfunction toggleDate(day: { day: string; date: string; class: string }) {\n  if (isViewMode.value || !day.date) return\n  const idx = form.selectedDates.indexOf(day.date)\n  if (idx >= 0) form.selectedDates.splice(idx, 1)\n  else form.selectedDates.push(day.date)\n}\n\nfunction openStrategyForm(mode: 'add' | 'edit' | 'view', index?: number) {\n  formMode.value = mode\n  if (mode === 'add') {\n    Object.assign(form, {\n      name: '', type: '日常策略', startTime: '00:00', endTime: '23:59',\n      dateType: 'weekday', selectedDates: [],\n      chargePower: 150, dischargePower: 200,\n      socUpper: 95, socLower: 20,\n      antiReflux: false, antiRefluxThreshold: 5,\n      demandManage: false, demandThreshold: 800\n    })\n  } else if (index !== undefined && strategyList[index]) {\n    const s = strategyList[index]\n    Object.assign(form, {\n      name: s.name, type: s.type, startTime: '00:00', endTime: '23:59',\n      dateType: 'weekday', selectedDates: [],\n      chargePower: 150, dischargePower: 200,\n      socUpper: 95, socLower: 20,\n      antiReflux: false, antiRefluxThreshold: 5,\n      demandManage: false, demandThreshold: 800\n    })\n  }\n  strategyFormVisible.value = true\n}\nfunction closeStrategyForm() { strategyFormVisible.value = false }\n\nfunction saveStrategyForm() {\n  // TODO: 实际保存逻辑\n  closeStrategyForm()\n}\n\nconst previewOption = computed(() => {\n  const data: (number | string)[] = new Array(24).fill('-')\n  const startH = parseInt(form.startTime.split(':')[0] || '0')\n  const endH = parseInt(form.endTime.split(':')[0] || '23')\n  for (let h = 0; h < 24; h++) {\n    if (h >= startH && h <= endH) {\n      data[h] = h < 8 ? -form.dischargePower : form.chargePower\n    }\n  }\n  return {\n    backgroundColor: 'transparent',\n    grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },\n    legend: { data: ['充放电策略'], top: 0, right: 0, textStyle: { color: '#8a93a5', fontSize: 11 }, itemWidth: 16, itemHeight: 8 },\n    xAxis: {\n      type: 'category',\n      data: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),\n      axisLine: { lineStyle: { color: '#1a273f' } },\n      axisLabel: { color: '#8a93a5', fontSize: 10, interval: 2 },\n      axisTick: { show: false },\n      splitLine: { show: true, lineStyle: { color: '#1a273f' } }\n    },\n    yAxis: {\n      type: 'value',\n      min: -300, max: 400, interval: 50,\n      axisLine: { show: false }, axisTick: { show: false },\n      axisLabel: { color: '#8a93a5', fontSize: 10 },\n      splitLine: { show: true, lineStyle: { color: '#1a273f' } }\n    },\n    series: [{\n      name: '充放电策略',\n      type: 'bar',\n      barWidth: '100%',\n      itemStyle: { color: '#5599ff' },\n      data\n    }]\n  }\n})'''

content = content.replace('const traceData = {', new_script + '\n\nconst traceData = {')

# 6. 插入样式
new_style = '''\n\n/* ===== 策略配置表单弹窗 ===== */\n.strategy-form-modal {\n  width: 92vw;\n  max-width: 1100px;\n  max-height: 92vh;\n  background: linear-gradient(180deg, #1a2a3e 0%, #132233 100%);\n  border: 1px solid rgba(2, 167, 240, 0.25);\n  border-radius: 8px;\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\n}\n\n.strategy-form-body {\n  display: flex;\n  gap: 24px;\n  padding: 20px 24px;\n  overflow-y: auto;\n  flex: 1;\n}\n\n.form-left {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.form-right {\n  flex: 1.1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n}\n\n.form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.form-label {\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.7);\n  font-weight: 500;\n}\n\n.form-input,\n.form-select,\n.form-time {\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 4px;\n  padding: 7px 10px;\n  font-size: 12px;\n  color: #fff;\n  outline: none;\n  width: 100%;\n}\n\n.form-input::placeholder { color: rgba(255, 255, 255, 0.35); }\n.form-input:focus,\n.form-select:focus,\n.form-time:focus { border-color: rgba(2, 167, 240, 0.5); }\n\n.form-select option { background: #1a2a3e; color: #fff; }\n\n.time-range-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.time-sep { color: rgba(255, 255, 255, 0.5); font-size: 12px; }\n\n.date-type-tabs {\n  display: flex;\n  gap: 0;\n  border-radius: 4px;\n  overflow: hidden;\n  border: 1px solid rgba(255, 255, 255, 0.12);\n}\n\n.date-tab {\n  flex: 1;\n  padding: 6px 0;\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.6);\n  background: rgba(255, 255, 255, 0.04);\n  border: none;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n.date-tab:hover { background: rgba(255, 255, 255, 0.08); }\n.date-tab.active {\n  background: rgba(2, 167, 240, 0.25);\n  color: #02A7F0;\n  font-weight: 600;\n}\n\n.calendar-box {\n  background: rgba(10, 22, 40, 0.5);\n  border: 1px solid rgba(2, 167, 240, 0.15);\n  border-radius: 6px;\n  padding: 10px 12px;\n}\n\n.calendar-nav {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n\n.cal-nav-btn {\n  background: transparent;\n  border: none;\n  color: rgba(255, 255, 255, 0.6);\n  font-size: 12px;\n  cursor: pointer;\n  padding: 2px 4px;\n}\n\n.cal-month {\n  font-size: 13px;\n  font-weight: 600;\n  color: #fff;\n  flex: 1;\n  text-align: center;\n}\n\n.cal-select-btn {\n  background: rgba(250, 173, 20, 0.8);\n  border: none;\n  border-radius: 3px;\n  padding: 3px 10px;\n  font-size: 11px;\n  color: #fff;\n  cursor: pointer;\n}\n\n.calendar-week-row {\n  display: grid;\n  grid-template-columns: repeat(7, 1fr);\n  text-align: center;\n  margin-bottom: 4px;\n}\n\n.cal-weekday {\n  font-size: 11px;\n  color: rgba(255, 255, 255, 0.4);\n  padding: 4px 0;\n}\n\n.calendar-day-grid {\n  display: grid;\n  grid-template-columns: repeat(7, 1fr);\n  gap: 2px;\n}\n\n.cal-day {\n  text-align: center;\n  padding: 5px 0;\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.7);\n  border-radius: 3px;\n  cursor: pointer;\n  min-height: 28px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.cal-day:hover:not(.empty) {\n  background: rgba(2, 167, 240, 0.15);\n}\n\n.cal-day.selected {\n  background: rgba(2, 167, 240, 0.35);\n  color: #fff;\n}\n\n.cal-day.empty {\n  cursor: default;\n}\n\n.calendar-btns {\n  display: flex;\n  gap: 6px;\n  margin-top: 8px;\n  justify-content: flex-end;\n}\n\n.cal-action {\n  width: 26px;\n  height: 26px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  border-radius: 3px;\n  color: rgba(255, 255, 255, 0.6);\n  cursor: pointer;\n}\n\n.cal-action.edit:hover { background: rgba(2, 167, 240, 0.2); color: #02A7F0; }\n.cal-action.delete:hover { background: rgba(239, 68, 68, 0.2); color: #ef4444; }\n.cal-action.add:hover { background: rgba(82, 196, 26, 0.2); color: #52C41A; }\n\n.cal-icon { width: 12px; height: 12px; }\n\n.slider-group .val-highlight {\n  color: #02A7F0;\n  font-weight: 600;\n  margin-left: 4px;\n}\n\n.form-slider {\n  width: 100%;\n  -webkit-appearance: none;\n  appearance: none;\n  height: 4px;\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 2px;\n  outline: none;\n  margin-top: 6px;\n}\n\n.form-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: #02A7F0;\n  cursor: pointer;\n  box-shadow: 0 0 6px rgba(2, 167, 240, 0.4);\n}\n\n.form-slider:disabled { opacity: 0.5; cursor: not-allowed; }\n\n.soc-dual {\n  display: flex;\n  gap: 16px;\n}\n\n.soc-item {\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n\n.soc-label {\n  font-size: 11px;\n  color: rgba(255, 255, 255, 0.5);\n}\n\n.soc-val {\n  font-size: 12px;\n  color: #02A7F0;\n  font-weight: 600;\n}\n\n.advanced-box {\n  background: rgba(10, 22, 40, 0.4);\n  border: 1px solid rgba(255, 255, 255, 0.06);\n  border-radius: 6px;\n  padding: 10px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.adv-row {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n\n.adv-name {\n  font-size: 12px;\n  color: rgba(255, 255, 255, 0.7);\n  width: 80px;\n}\n\n.adv-threshold {\n  font-size: 11px;\n  color: rgba(255, 255, 255, 0.45);\n  flex: 1;\n  text-align: right;\n}\n\n.toggle-switch {\n  position: relative;\n  display: inline-block;\n  width: 36px;\n  height: 20px;\n  flex-shrink: 0;\n}\n\n.toggle-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.toggle-track {\n  position: absolute;\n  cursor: pointer;\n  inset: 0;\n  background: rgba(255, 255, 255, 0.15);\n  border-radius: 20px;\n  transition: 0.2s;\n}\n\n.toggle-track::before {\n  content: '';\n  position: absolute;\n  height: 16px;\n  width: 16px;\n  left: 2px;\n  bottom: 2px;\n  background: #fff;\n  border-radius: 50%;\n  transition: 0.2s;\n}\n\n.toggle-switch input:checked + .toggle-track {\n  background: #02A7F0;\n}\n\n.toggle-switch input:checked + .toggle-track::before {\n  transform: translateX(16px);\n}\n\n.toggle-switch input:disabled + .toggle-track {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.chart-group {\n  flex: 1;\n  min-height: 160px;\n}\n\n.preview-chart {\n  width: 100%;\n  height: 160px;\n}\n\n.form-footer {\n  display: flex;\n  justify-content: flex-end;\n  gap: 12px;\n  padding: 12px 24px;\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  flex-shrink: 0;\n}\n\n.btn-form-cancel {\n  background: rgba(255, 255, 255, 0.08);\n  border: 1px solid rgba(255, 255, 255, 0.15);\n  border-radius: 4px;\n  padding: 7px 22px;\n  font-size: 13px;\n  color: rgba(255, 255, 255, 0.8);\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n.btn-form-cancel:hover {\n  background: rgba(255, 255, 255, 0.15);\n}\n\n.btn-form-save {\n  background: linear-gradient(90deg, rgba(2, 167, 240, 0.9) 0%, rgba(2, 167, 240, 0.7) 100%);\n  border: 1px solid rgba(2, 167, 240, 0.5);\n  border-radius: 4px;\n  padding: 7px 22px;\n  font-size: 13px;\n  color: #fff;\n  cursor: pointer;\n  transition: all 0.2s;\n}\n\n.btn-form-save:hover {\n  background: linear-gradient(90deg, rgba(2, 167, 240, 1) 0%, rgba(2, 167, 240, 0.85) 100%);\n  box-shadow: 0 0 12px rgba(2, 167, 240, 0.3);\n}\n'''

content = content.replace('</style>', new_style + '</style>')

with open(path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('Done, new len:', len(content))
