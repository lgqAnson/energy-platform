/**
 * 储能模块实时 Mock 数据生成器
 * 按模块/频道提供带随机波动的实时数据
 */

import dayjs from 'dayjs'

// ============================================================
// 基础波动算法
// ============================================================

/** 在 base 附近随机波动，rate 为波动幅度比例（如 0.05 = ±5%） */
export function fluctuate(base: number, rate: number): number {
  const delta = (Math.random() - 0.5) * 2 * rate * base
  return Number((base + delta).toFixed(2))
}

/** 带趋势漂移的波动：trend > 0 向上漂移，trend < 0 向下漂移 */
export function driftFluctuate(base: number, rate: number, trend: number): number {
  const delta = (Math.random() - 0.5) * 2 * rate * base + trend
  return Number((base + delta).toFixed(2))
}

/** 限制在 [min, max] 范围内 */
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

/** 格式化数字为字符串（保留 n 位小数） */
export function fmt(val: number, n = 1): string {
  return val.toFixed(n)
}

// ============================================================
// Monitor 实时监控数据（100ms）
// ============================================================

const baseGroups = [
  { id: 'G5', power: 856, soc: 78.5, maxTemp: 28.3, minTemp: 25.3, voltage: 382.5, current: 1245, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: 'G8', power: 912, soc: 65.2, maxTemp: 36.7, minTemp: 26.1, voltage: 381.8, current: 1320, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
  { id: 'G12', power: 798, soc: 82.1, maxTemp: 27.9, minTemp: 25.3, voltage: 383.1, current: 1185, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
]

const baseBlocks = [
  { id: '01', name: '能量块 #01', power: 198, soc: 82.3, maxTemp: 25.3, voltage: 382.5, totalVoltage: 615.2, current: 325, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '02', name: '能量块 #02', power: 201, soc: 79.8, maxTemp: 26.1, voltage: 382.3, totalVoltage: 614.8, current: 328, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '03', name: '能量块 #03', power: 195, soc: 76.5, maxTemp: 36.7, voltage: 381.5, totalVoltage: 608.7, current: 322, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
  { id: '04', name: '能量块 #04', power: 197, soc: 74.2, maxTemp: 24.2, voltage: 381.2, totalVoltage: 607.5, current: 320, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
  { id: '05', name: '能量块 #05', power: 199, soc: 81.1, maxTemp: 25.5, voltage: 382.8, totalVoltage: 616.0, current: 326, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
]

const baseMeter = [
  { name: '电压', phaseA: 221.5, phaseB: 220.8, phaseC: 222.3, avg: 221.5, unit: 'V', status: '正常', statusType: 'normal' },
  { name: '电流', phaseA: 156.8, phaseB: 158.2, phaseC: 155.7, avg: 156.9, unit: 'A', status: '正常', statusType: 'normal' },
  { name: '有功功率', phaseA: 32.5, phaseB: 33.1, phaseC: 32.8, avg: 98.4, unit: 'kW', status: '正常', statusType: 'normal' }
]

/**
 * 生成实时监控 Mock 数据（100ms 高频推送）
 * 生成实时监控 Mock 数据（100ms 高频推送）
 *
 * 包含能量组、能量块、电表、拓扑结构、实时曲线五个维度的数据，
 * 各数值在基线基础上施加随机波动，模拟真实传感器数据流。
 *
 * @returns 监控频道的完整数据负载
 */
export function genMonitorData() {
  // 能量组数据波动
  const groups = baseGroups.map((g) => {
    const newSoc = clamp(g.soc + (Math.random() - 0.52) * 0.05, 10, 100)
    g.soc = newSoc // 更新基线以便下次波动
    return {
      ...g,
      power: Math.round(fluctuate(g.power, 0.03)),
      soc: Number(newSoc.toFixed(1)),
      maxTemp: fluctuate(g.maxTemp, 0.02),
      minTemp: fluctuate(g.minTemp, 0.02),
      voltage: fluctuate(g.voltage, 0.003),
      current: Math.round(fluctuate(g.current, 0.03))
    }
  })

  // 能量块数据波动
  const blocks = baseBlocks.map((b) => {
    const newSoc = clamp(b.soc + (Math.random() - 0.52) * 0.03, 10, 100)
    b.soc = newSoc
    return {
      ...b,
      power: Math.round(fluctuate(b.power, 0.03)),
      soc: Number(newSoc.toFixed(1)),
      maxTemp: fluctuate(b.maxTemp, 0.02),
      voltage: fluctuate(b.voltage, 0.003),
      totalVoltage: fluctuate(b.totalVoltage, 0.003),
      current: Math.round(fluctuate(b.current, 0.03))
    }
  })

  // 电表数据波动
  const meter = baseMeter.map((m) => ({
    ...m,
    phaseA: fmt(fluctuate(m.phaseA, 0.005)),
    phaseB: fmt(fluctuate(m.phaseB, 0.005)),
    phaseC: fmt(fluctuate(m.phaseC, 0.005)),
    avg: fmt(fluctuate(m.avg, 0.005))
  }))

  // 拓扑数据
  const topology = {
    groups: groups.map((g) => ({
      id: g.id,
      power: `${(g.power / 1000).toFixed(1)}MW`,
      capacity: '2.4MWh',
      config: '5x 0.5MWh',
      status: g.status
    })),
    blocks: blocks.map((b) => ({
      id: b.id,
      name: b.name.replace('能量块 ', ''),
      power: `${b.power}kW`,
      capacity: '400kWh',
      group: `G${b.id === '01' || b.id === '02' ? '5' : b.id === '03' || b.id === '04' ? '8' : '12'}`,
      temperature: `${b.maxTemp.toFixed(1)}°C`
    }))
  }

  // 实时曲线新增一个点（当前时间，关口功率/并网功率/充放电功率）
  const timeStr = dayjs().format('HH:mm:ss')
  const realtimePoint = {
    time: timeStr,
    gatePower: Number(fluctuate(150, 0.1).toFixed(1)),
    gridPower: Number(fluctuate(145, 0.1).toFixed(1)),
    chargeDischargePower: Number(fluctuate(-50 + Math.random() * 20, 0.05).toFixed(1))
  }

  return { groups, blocks, meter, topology, realtimePoint }
}

// ============================================================
// Dashboard 可视看板数据（1s）
// ============================================================

const baseStats = [
  { label: '累计装机容量', value: 15280, unit: 'MWh', trend: '+8.5%', borderColor: '#00d4ff' },
  { label: '累计装机功率', value: 2500, unit: 'MW', trend: '+6.2%', borderColor: '#00d4ff' },
  { label: '累计总充电量', value: 85600, unit: 'MWh', desc: '历史累计充电总量', borderColor: '#00d4ff' },
  { label: '累计总放电量', value: 78300, unit: 'MWh', desc: '历史累计放电总量', borderColor: '#00d4ff' },
  { label: '安全运行天数', value: 1250, unit: '天', desc: '自投运起连续安全运行', borderColor: '#00d4ff' },
  { label: '总电站数', value: 328, unit: '站', trend: '+3.2%', borderColor: '#00d4ff' },
  { label: '总储能柜数', value: 1850, unit: '台', trend: '+5.1%', borderColor: '#00d4ff' }
]

/**
 * 生成可视看板 Mock 数据（1s 推送）
 *
 * 包含电站规模统计卡片、3D 场景锚点状态、收益概览。
 * 累计值缓慢增长，锚点状态随机变化。
 *
 * @returns 仪表板频道的完整数据负载
 */
export function genDashboardData() {
  // 统计卡片微小波动
  const stats = baseStats.map((s) => {
    if (s.label.includes('累计') || s.label === '安全运行天数') {
      // 累计值缓慢增长
      s.value += Math.random() > 0.7 ? 1 : 0
    }
    return { ...s, value: s.value }
  })

  // 3D 场景锚点状态变化
  const anchorStatuses = ['正常', '正常', '正常', '告警', '离线']
  const anchors = [
    { id: '1', top: '28%', left: '42%', deviceCode: 'R251205J0055', status: anchorStatuses[Math.floor(Math.random() * 3)], capacity: '200Wh', area: 'G12', operateTime: '2026年1月3日' },
    { id: '2', top: '45%', left: '58%', deviceCode: 'R251205J0062', status: anchorStatuses[Math.floor(Math.random() * 3)], capacity: '200Wh', area: 'G5', operateTime: '2026年1月5日' },
    { id: '3', top: '62%', left: '35%', deviceCode: 'R251205J0078', status: anchorStatuses[Math.floor(Math.random() * 5)], capacity: '200Wh', area: 'G8', operateTime: '2026年1月8日' }
  ]

  // 收益金额微小波动
  const revenue = {
    amount: 1248650 + Math.floor(Math.random() * 100),
    growth: `较上月增长 ${(12 + Math.random() * 0.5).toFixed(1)}%`
  }

  return { stats, anchors, revenue }
}

// ============================================================
// Strategy 策略控制数据（5s）
// ============================================================

/**
 * 生成策略控制 Mock 数据（5s 推送）
 *
 * 包含各时段策略执行效果（计划/实际/偏差/建议）和
 * 24 小时充放电柱状图数据（计划 vs 实际）。
 *
 * @returns 策略频道的完整数据负载
 */
export function genStrategyData() {
  const deviations = ['-1.5%', '-4.0%', '-2.8%', '-3.2%', '-1.8%', '-5.1%', '-2.3%']
  const suggestions = [
    '放电时段可提前30分钟',
    '需调整SOC下限设置',
    '建议增加充电功率上限',
    '峰时段响应速度良好',
    '平段充电效率偏低',
    '需优化PCS切换逻辑',
    '建议微调充放电阈值'
  ]

  const effectData = [
    { time: '00:00 - 08:00', planCharge: '1,000 kWh', actualCharge: '985 kWh', planDischarge: '1,000 kWh',actualDischarge:'985 kWh',deviation: deviations[0], suggestion: suggestions[0] },
    { time: '08:00 - 10:00', planCharge: '950 kWh', actualCharge: '912 kWh', planDischarge: '1,000 kWh',actualDischarge:'985 kWh',deviation: deviations[1], suggestion: suggestions[1] },
    { time: '10:00 - 12:00', planCharge: '1,200 kWh', actualCharge: '1,168 kWh', planDischarge: '1,000 kWh', actualDischarge:'985 kWh',deviation: deviations[2], suggestion: suggestions[2] },
    { time: '12:00 - 14:00', planCharge: '1,100 kWh', actualCharge: '1,065 kWh', planDischarge: '1,000 kWh',actualDischarge:'985 kWh',deviation: deviations[3], suggestion: suggestions[3] },
    { time: '14:00 - 17:00', planCharge: '1,300 kWh', actualCharge: '1,277 kWh', planDischarge: '1,000 kWh', actualDischarge:'985 kWh',deviation: deviations[4], suggestion: suggestions[4] },
    { time: '17:00 - 19:00', planCharge: '1,250 kWh', actualCharge: '1,187 kWh', planDischarge: '1,000 kWh', actualDischarge:'985 kWh',deviation: deviations[5], suggestion: suggestions[5] },
    { time: '19:00 - 24:00', planCharge: '1,000 kWh', actualCharge: '978 kWh', planDischarge: '1,000 kWh',actualDischarge:'985 kWh',deviation: deviations[6], suggestion: suggestions[6] }
  ]

  // 策略执行柱状图数据：24小时配置 vs 实际
  const planData = Array.from({ length: 24 }, (_, i) => {
    if (i < 8) return -50 - Math.random() * 10
    if (i < 10) return 0
    if (i < 14) return 80 + Math.random() * 20
    if (i < 17) return 60 + Math.random() * 15
    if (i < 19) return 100 + Math.random() * 25
    return -40 - Math.random() * 10
  })

  const actualData = planData.map((v) => {
    if (v === 0) return 0
    const noise = (Math.random() - 0.5) * 15
    return Number((v + noise).toFixed(2))
  })

  return { effectData, planData, actualData }
}

// ============================================================
// Revenue 收益管理数据（5s）
// ============================================================

/**
 * 生成收益管理 Mock 数据（5s 推送）
 *
 * 包含收益曲线新增数据点（成本/收入）和汇总统计卡片
 * （充电成本、放电收入、净收益）。
 *
 * @returns 收益频道的完整数据负载
 */
export function genRevenueData() {
  // 收益曲线新增一个点
  const costData = 200 + Math.random() * 300
  const incomeData = 800 + Math.random() * 400

  // 统计卡片
  const summary = {
    chargeCost: 42180.75 + Math.random() * 50,
    dischargeIncome: 248650.80 + Math.random() * 200,
    netProfit: 44239.75 + Math.random() * 100
  }

  return { costData, incomeData, summary }
}

// ============================================================
// Price 电价管理数据（10s）
// ============================================================

const basePrices = {
  sharp: { charge: 1.43, discharge: 1.43 },
  peak: { charge: 1.15, discharge: 1.15 },
  flat: { charge: 0.68, discharge: 0.68 },
  valley: { charge: 0.27, discharge: 0.27 }
}

/**
 * 生成电价管理 Mock 数据（10s 推送）
 *
 * 在基准电价基础上施加微量随机波动，生成尖/峰/平/谷四个时段的
 * 充电与放电电价。
 *
 * @returns 电价频道的完整数据负载
 */
export function genPriceData() {
  return {
    sharp: {
      charge: Number((basePrices.sharp.charge + (Math.random() - 0.5) * 0.02).toFixed(2)),
      discharge: Number((basePrices.sharp.discharge + (Math.random() - 0.5) * 0.02).toFixed(2))
    },
    peak: {
      charge: Number((basePrices.peak.charge + (Math.random() - 0.5) * 0.02).toFixed(2)),
      discharge: Number((basePrices.peak.discharge + (Math.random() - 0.5) * 0.02).toFixed(2))
    },
    flat: {
      charge: Number((basePrices.flat.charge + (Math.random() - 0.5) * 0.01).toFixed(2)),
      discharge: Number((basePrices.flat.discharge + (Math.random() - 0.5) * 0.01).toFixed(2))
    },
    valley: {
      charge: Number((basePrices.valley.charge + (Math.random() - 0.5) * 0.005).toFixed(2)),
      discharge: Number((basePrices.valley.discharge + (Math.random() - 0.5) * 0.005).toFixed(2))
    }
  }
}

// ============================================================
// Settlement 抄表结算数据（5s）
// ============================================================

/**
 * 生成抄表结算 Mock 数据（5s 推送）
 *
 * 模拟电表读数缓慢增长，包含总输入/输出、尖/峰/平/谷各时段
 * 的输入与输出电量读数。
 *
 * @returns 结算频道的完整数据负载
 */
export function genSettlementData() {
  // 电表读数微小增长
  const meterReadings = {
    totalIn: 85632.45 + Math.random() * 0.5,
    totalOut: 78341.22 + Math.random() * 0.3,
    peakIn: 12456.78 + Math.random() * 0.1,
    peakOut: 11234.56 + Math.random() * 0.1,
    flatIn: 34567.89 + Math.random() * 0.2,
    flatOut: 32145.67 + Math.random() * 0.2,
    valleyIn: 38607.78 + Math.random() * 0.2,
    valleyOut: 34960.99 + Math.random() * 0.2
  }

  return { meterReadings }
}

// ============================================================
// Device 设备管理数据（5s）
// ============================================================

const deviceStatuses = ['运行中', '待机', '故障', '维护', '停机']

/**
 * 生成设备管理 Mock 数据（5s 推送）
 *
 * 模拟 5 台设备的状态、SOC、功率、温度、电压等运行参数的随机变化。
 *
 * @returns 设备频道的完整数据负载
 */
export function genDeviceData() {
  // 生成随机设备状态更新
  const deviceUpdates = Array.from({ length: 5 }, (_, i) => ({
    id: `ess-${String.fromCharCode(97 + i)}-1`,
    status: deviceStatuses[Math.floor(Math.random() * deviceStatuses.length)],
    soc: clamp(50 + Math.random() * 40, 10, 100).toFixed(1),
    power: Math.round(100 + Math.random() * 100),
    temperature: (20 + Math.random() * 15).toFixed(1),
    voltage: (370 + Math.random() * 20).toFixed(1)
  }))

  return { deviceUpdates }
}

// ============================================================
// Maintenance 运维管理数据（10s）
// ============================================================

const maintenanceStatuses = ['待处理', '处理中', '已完成', '已关闭']

/**
 * 生成运维管理 Mock 数据（10s 推送）
 *
 * 模拟 3 条工单的状态、进度和更新时间变化。
 *
 * @returns 运维频道的完整数据负载
 */
export function genMaintenanceData() {
  // 工单状态随机变化
  const workOrders = Array.from({ length: 3 }, (_, i) => ({
    id: `WO-${20260000 + i}`,
    status: maintenanceStatuses[Math.floor(Math.random() * maintenanceStatuses.length)],
    progress: Math.floor(Math.random() * 100),
    updateTime: dayjs().format('YYYY/M/D HH:mm:ss')
  }))

  return { workOrders }
}
