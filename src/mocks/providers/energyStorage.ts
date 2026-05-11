/**
 * 储能模块 Mock 数据提供者
 *
 * 所有数据与后端 API 返回结构保持一致，
 * mock 模式下被 useApiData 调用，联调时自动切换到后端接口。
 */

import type {
  EnergyGroupItem,
  EnergyBlockItem,
  MeterRow,
  TopologyGroup,
  TopologyBlock,
  RealtimeChartSeries
} from '@/views/energy-storage/monitor/types'
import type { WorkOrder } from '@/components/business/WorkOrderManager.vue'

// ============================================================
// 看板数据
// ============================================================

export function getMockStationStats() {
  return [
    { label: '累计装机容量', value: 15280, unit: 'MWh', trend: '+8.5%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
    { label: '累计装机功率', value: 2500, unit: 'MW', trend: '+6.2%', trendLabel: '较上月', color: '#00d4ff', borderColor: '#00d4ff' },
    { label: '累计总充电量', value: 85600, unit: 'MWh', desc: '历史累计充电总量', color: '#22c55e', borderColor: '#22c55e' },
    { label: '累计总放电量', value: 78300, unit: 'MWh', desc: null as string | null, color: '#f59e0b', borderColor: '#f59e0b' },
    { label: '安全运行天数', value: 1250, unit: '天', desc: '历史无安全事故总天数', color: '#22c55e', borderColor: '#22c55e' },
    { label: '总电站数', value: 328, unit: '站', desc: null as string | null, color: '#a855f7', borderColor: '#a855f7' },
    { label: '总储能柜数', value: 1850, unit: '台', desc: null as string | null, color: '#ec4899', borderColor: '#ec4899' }
  ]
}

// ============================================================
// 监控数据
// ============================================================

export function getMockEnergyGroups(): EnergyGroupItem[] {
  return [
    { id: 'a', name: '能量组 A', power: 856, soc: 78.5, maxTemp: 28.3, minTemp: 25.3, voltage: 382.5, current: 1245, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: 'b', name: '能量组 B', power: 912, soc: 65.2, maxTemp: 36.7, minTemp: 26.1, voltage: 381.8, current: 1320, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
    { id: 'c', name: '能量组 C', power: 798, soc: 82.1, maxTemp: 27.9, minTemp: 25.3, voltage: 383.1, current: 1185, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
  ]
}

export function getMockEnergyBlocks(): EnergyBlockItem[] {
  return [
    { id: '01', name: '能量块 #01', power: 198, soc: 82.3, maxTemp: 25.3, voltage: 382.5, totalVoltage: 615.2, current: 325, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: '02', name: '能量块 #02', power: 201, soc: 79.8, maxTemp: 26.1, voltage: 382.3, totalVoltage: 614.8, current: 328, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: '03', name: '能量块 #03', power: 195, soc: 76.5, maxTemp: 36.7, voltage: 381.5, totalVoltage: 608.7, current: 322, status: '温度异常', statusType: 'warning', socColor: '#FAAD14', hasWarning: true },
    { id: '04', name: '能量块 #04', power: 197, soc: 74.2, maxTemp: 24.2, voltage: 381.2, totalVoltage: 607.5, current: 320, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false },
    { id: '05', name: '能量块 #05', power: 199, soc: 81.1, maxTemp: 25.5, voltage: 382.8, totalVoltage: 616.0, current: 326, status: '运行正常', statusType: 'normal', socColor: '#52C41A', hasWarning: false }
  ]
}

export function getMockTopologyData(): { groups: TopologyGroup[]; blocks: TopologyBlock[] } {
  return {
    groups: [
      { id: 'G5', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
      { id: 'G8', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' },
      { id: 'G12', power: '1.2MW', capacity: '2.4MWh', config: '5x 0.5MWh', status: '运行正常' }
    ],
    blocks: [
      { id: '01', name: '#1', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '25.3°C' },
      { id: '02', name: '#2', power: '200kW', capacity: '400kWh', group: 'G5', temperature: '26.1°C' },
      { id: '03', name: '#3', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.8°C' },
      { id: '04', name: '#4', power: '200kW', capacity: '400kWh', group: 'G8', temperature: '24.2°C' },
      { id: '05', name: '#5', power: '200kW', capacity: '400kWh', group: 'G12', temperature: '25.5°C' }
    ]
  }
}

export function getMockMeterData(): MeterRow[] {
  return [
    { name: '电压', phaseA: '221.5', phaseB: '220.8', phaseC: '222.3', avg: '221.5', unit: 'V', status: '正常', statusType: 'normal' },
    { name: '电流', phaseA: '156.8', phaseB: '158.2', phaseC: '155.7', avg: '156.9', unit: 'A', status: '正常', statusType: 'normal' },
    { name: '有功功率', phaseA: '32.5', phaseB: '33.1', phaseC: '32.8', avg: '98.4', unit: 'kW', status: '正常', statusType: 'normal' }
  ]
}

export function getMockRealtimeSeries(): RealtimeChartSeries {
  return {
    xData: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
    gatePower: [0, 0, 0, 200, 800, 1200, 1400, 1300, 1100, 900, 600, 200, 0],
    gridPower: [0, 0, 0, 150, 600, 1000, 1200, 1100, 900, 700, 400, 150, 0],
    chargeDischargePower: [0, 0, 0, 100, 400, 800, 1000, 900, 700, 500, 300, 100, 0]
  }
}

// ============================================================
// 策略数据
// ============================================================

export function getMockStrategyEffectData(): Array<{ time: string; plan: string; actual: string; deviation: string; suggestion: string }> {
  return [
    { time: '00:00 - 08:00', plan: '1,000 kWh', actual: '985 kWh', deviation: '-1.5%', suggestion: '放电时段可提前30分钟' },
    { time: '08:00 - 10:00', plan: '950 kWh', actual: '912 kWh', deviation: '-4.0%', suggestion: '需调整SOC下限设置' },
    { time: '10:00 - 11:00', plan: '1,100 kWh', actual: '1,089 kWh', deviation: '-1.0%', suggestion: '策略执行优秀' },
    { time: '11:00 - 12:00', plan: '800 kWh', actual: '752 kWh', deviation: '-6.0%', suggestion: '检查设备可用容量' },
    { time: '12:00 - 14:00', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
    { time: '14:00 - 19:00', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' },
    { time: '19:00 - 23:59', plan: '900 kWh', actual: '891 kWh', deviation: '-1.0%', suggestion: '保持当前策略' }
  ]
}

export function getMockStrategyList() {
  return [
    { name: '尖峰时段优先放电', type: '自动策略', creator: '张工', createTime: '2025-12-15 10:30', status: 'enabled' as const },
    { name: '谷时充电模式', type: '定时策略', creator: '李工', createTime: '2025-12-20 14:00', status: 'enabled' as const },
    { name: '需求响应策略 #3', type: '事件策略', creator: '王工', createTime: '2026-01-05 09:15', status: 'disabled' as const },
    { name: '需求响应策略 #4', type: '事件策略', creator: '张工', createTime: '2026-01-05 09:15', status: 'enabled' as const },
    { name: '备用容量保障', type: '安全策略', creator: '陈工', createTime: '2026-02-01 16:45', status: 'enabled' as const }
  ]
}

// ============================================================
// 收益数据
// ============================================================

export function getMockRevenueData() {
  return [
    { tag: '尖', tagBg: 'rgba(255,107,53,0.2)', tagColor: '#FF6B35', time: '11:00 - 12:00', chargePrice: '1.43', chargeQty: '1,240.50', chargeCost: '6,822.75', dischargePrice: '1.43', dischargeQty: '3,850.20', dischargeIncome: '21,176.10', netProfit: '14,353.35' },
    { tag: '峰', tagBg: 'rgba(255,77,77,0.2)', tagColor: '#FF4D4D', time: '10:00 - 11:00, 14:00 - 19:00', chargePrice: '1.15', chargeQty: '2,860.30', chargeCost: '14,301.50', dischargePrice: '1.15', dischargeQty: '7,920.45', dischargeIncome: '39,602.25', netProfit: '25,300.75' },
    { tag: '平', tagBg: 'rgba(74,158,255,0.2)', tagColor: '#4A9EFF', time: '08:00 - 10:00, 12:00 - 14:00, 19:00 - 23:59', chargePrice: '0.68', chargeQty: '1,520.80', chargeCost: '6,083.20', dischargePrice: '0.68', dischargeQty: '2,980.60', dischargeIncome: '11,922.40', netProfit: '5,839.20' },
    { tag: '谷', tagBg: 'rgba(74,158,255,0.2)', tagColor: '#4A9EFF', time: '00:00 - 08:00', chargePrice: '0.27', chargeQty: '4,380.25', chargeCost: '15,330.88', dischargePrice: '0.27', dischargeQty: '1,250.30', dischargeIncome: '5,626.35', netProfit: '-9,704.53' }
  ]
}

// ============================================================
// 设备数据
// ============================================================

export function getMockDeviceList() {
  return [
    { id: '1', name: '储能柜 R251205J0055', type: '储能柜', power: '200kW', capacity: '400kWh', status: '正常' },
    { id: '2', name: '储能柜 R251205J0057', type: '储能柜', power: '200kW', capacity: '400kWh', status: '正常' },
    { id: '3', name: '储能柜 R251205J0054', type: '储能柜', power: '200kW', capacity: '400kWh', status: '正常' },
    { id: '4', name: '储能柜 R251205J0056', type: '储能柜', power: '200kW', capacity: '400kWh', status: '告警' },
    { id: '5', name: '储能柜 R251205J0058', type: '储能柜', power: '200kW', capacity: '400kWh', status: '正常' }
  ]
}

// ============================================================
// 告警数据
// ============================================================

export function getMockAlarmList() {
  return [
    { id: 'ALM001', level: '紧急', device: '储能柜 R251205J0054', content: '电芯温度过高', time: '2026-04-30 15:30', status: '未处理' },
    { id: 'ALM002', level: '重要', device: '储能柜 R251205J0055', content: 'SOC越限', time: '2026-04-30 14:20', status: '已确认' },
    { id: 'ALM003', level: '一般', device: '储能柜 R251205J0057', content: '通信异常', time: '2026-04-30 12:10', status: '已恢复' },
    { id: 'ALM004', level: '紧急', device: '储能柜 R251205J0056', content: '绝缘故障', time: '2026-04-30 10:05', status: '处理中' },
    { id: 'ALM005', level: '一般', device: '储能柜 R251205J0058', content: '风扇故障', time: '2026-04-29 18:40', status: '未处理' }
  ]
}

// ============================================================
// 充电站数据
// ============================================================

export function getMockChargingStationList(): Array<{ name: string; code: string; location: string; power: number; status: string; utilization: number }> {
  return [
    { name: '充电站 A', code: 'CS001', location: '工业园区1号', power: 120, status: '运行中', utilization: 78 },
    { name: '充电站 B', code: 'CS002', location: '商业中心B1', power: 60, status: '运行中', utilization: 45 },
    { name: '充电站 C', code: 'CS003', location: '物流园区C区', power: 180, status: '维护中', utilization: 0 },
    { name: '充电站 D', code: 'CS004', location: '住宅区D栋', power: 90, status: '运行中', utilization: 92 },
    { name: '充电站 E', code: 'CS005', location: '高速服务区E', power: 150, status: '运行中', utilization: 63 }
  ]
}

// ============================================================
// 商业负荷数据
// ============================================================

export function getMockCommercialLoadList(): Array<{ name: string; type: string; currentLoad: number; ratedLoad: number; loadRate: number; trend: string }> {
  return [
    { name: '商场 A', type: '商业', currentLoad: 850, ratedLoad: 1200, loadRate: 70.8, trend: '上升' },
    { name: '写字楼 B', type: '办公', currentLoad: 620, ratedLoad: 800, loadRate: 77.5, trend: '下降' },
    { name: '工厂 C', type: '工业', currentLoad: 2100, ratedLoad: 3000, loadRate: 70.0, trend: '上升' },
    { name: '医院 D', type: '公共', currentLoad: 450, ratedLoad: 600, loadRate: 75.0, trend: '平稳' },
    { name: '住宅区 E', type: '居民', currentLoad: 320, ratedLoad: 500, loadRate: 64.0, trend: '下降' }
  ]
}

// ============================================================
// 登录日志
// ============================================================

/** 登录日志条目类型 */
export interface LoginLogItem {
  /** 用户账号 */
  account: string
  /** 用户姓名 */
  name: string
  /** 登录时间 */
  time: string
  /** IP 地址 */
  ip: string
  /** 设备信息 */
  device: string
  /** 登录结果：成功 | 失效 */
  result: '成功' | '失效'
  /** 失败原因（成功时为 '-'） */
  failReason: string
}

/** 用户池（账号 -> 姓名） */
const userPool: [string, string][] = [
  ['zhangsan', '张三'], ['lisi', '李四'], ['wangwu', '王五'], ['zhaoliu', '赵六'],
  ['sunqi', '孙七'], ['zhouba', '周八'], ['wujiu', '吴九'], ['zhengshi', '郑十'],
  ['admin', '管理员'], ['operator', '操作员'], ['viewer', '访客'], ['engineer', '工程师'],
  ['chenxiao', '陈晓'], ['liuna', '刘娜'], ['yangfan', '杨帆'], ['huangwei', '黄伟'],
  ['linmei', '林梅'], ['xujie', '徐杰'], ['zhaoyun', '赵云'], ['qianli', '钱丽']
]

/** 设备信息池 */
const devicePool = [
  'Chrome 120 / Windows 11', 'Safari 17 / macOS 14', 'Edge 120 / Windows 10',
  'Firefox 121 / Ubuntu 22.04', 'Chrome 119 / Android 14', 'Safari 17 / iOS 17',
  'Chrome 121 / Windows 10', 'Edge 119 / Windows 11', 'Chrome 120 / macOS 14',
  'Firefox 120 / Windows 11', 'Chrome 118 / Linux', 'Safari 16 / iOS 16',
  'Chrome 120 / Windows 11', 'Edge 120 / macOS 14'
]

/** 失败原因池 */
const failReasonPool = ['密码错误', '验证码错误', '账号已锁定', '账号已禁用', 'IP被限制', '登录超时']

/**
 * 生成模拟登录日志数据
 * @param count 生成条数，默认 184
 * @returns 登录日志数组
 */
export function getMockLoginLogList(count = 184): LoginLogItem[] {
  const list: LoginLogItem[] = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const [account, name] = userPool[Math.floor(Math.random() * userPool.length)]
    const isSuccess = Math.random() > 0.15 // 85% 成功率
    // 时间从当前往前推，每条间隔随机 10~120 分钟
    const offsetMs = i * (10 + Math.floor(Math.random() * 110)) * 60 * 1000
    const ts = now - offsetMs
    const d = new Date(ts)
    const timeStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    const ip = `192.168.${1 + Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 256)}`

    list.push({
      account,
      name,
      time: timeStr,
      ip,
      device: devicePool[Math.floor(Math.random() * devicePool.length)],
      result: isSuccess ? '成功' : '失效',
      failReason: isSuccess ? '-' : failReasonPool[Math.floor(Math.random() * failReasonPool.length)]
    })
  }

  // 按时间降序排列
  list.sort((a, b) => b.time.localeCompare(a.time))
  return list
}

// ============================================================
// 结算数据
// ============================================================

export function getMockMeterReadingList() {
  return [
    { name: 'G5', forwardActive: '9.6015625', forwardSharp: '9.6015625', forwardPeak: '170371.2', forwardFlat: '624', forwardValley: '9.6015625', reverseActive: '170371.2', reverseSharp: '624', reversePeak: '9.6015625', reverseFlat: '170371.2', reverseValley: '624' },
    { name: 'G8', forwardActive: '14.40625', forwardSharp: '14.40625', forwardPeak: '163495.19', forwardFlat: '468', forwardValley: '14.40625', reverseActive: '163495.19', reverseSharp: '468', reversePeak: '14.40625', reverseFlat: '163495.19', reverseValley: '468' },
    { name: 'G12', forwardActive: '11.9921875', forwardSharp: '11.9921875', forwardPeak: '140212.8', forwardFlat: '300', forwardValley: '11.9921875', reverseActive: '140212.8', reverseSharp: '300', reversePeak: '11.9921875', reverseFlat: '140212.8', reverseValley: '300' }
  ]
}

// ============================================================
// 运维工单数据
// ============================================================

export function getMockMaintenanceList() {
  return [
    {
      id: 'WO-20240312-001', title: 'BESS-08-电池簇温度异常告警处理', device: 'BESS-08-电池簇',
      deviceSN: 'BESS20230800128', level: 'urgent', createTime: '2024-03-12 09:23', status: 'processing',
      creator: '系统自动创建', alertId: 'ALT-20240312-087', handler: '张工', handlerTeam: '维修一组',
      estimatedCompleteTime: '2024-03-12 14:00:00', alertContent: '电池簇#8温度异常升高，当前温度48.5℃，超过安全阈值(45℃)。BMS系统已自动降低充放电功率，建议立即现场检查散热系统及电池单体状态。',
      alertTime: '2024-03-12 09:22:18', duration: '1小时 37分钟', monitorPoint: '电池簇#8-中部温度传感器(TS-08-M)',
      currentStatus: '温度已降至42.3℃，但仍高于正常范围(25-35℃)',
      timeline: [
        { name: '告警触发', description: '系统检测到BESS-08电池簇温度异常，自动创建运维工单', time: '09:22:18', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单 WO-20240312-001', time: '09:23:45', status: 'done' },
        { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [张工]', time: '09:30:12', status: 'done' },
        { name: '现场处理', description: '[张工] 已到达现场，正在检查散热风扇和电池单体状态', time: '10:15:33', status: 'active' },
        { name: '处理验收', description: '待处理完成后由运维主管验收', time: '', status: 'pending' },
        { name: '工单归档', description: '验收通过后系统自动归档', time: '', status: 'pending' }
      ]
    },
    {
      id: 'WO-20240312-002', title: 'BESS-05-PCS单元通信中断处理', device: 'BESS-05-PCS单元',
      deviceSN: 'BESS20230700095', level: 'important', createTime: '2024-03-12 10:15', status: 'dispatched',
      creator: '系统自动创建', alertId: 'ALT-20240312-088', handler: '王工', handlerTeam: '维修二组',
      estimatedCompleteTime: '2024-03-12 16:00:00', alertContent: 'PCS单元与BMS通信中断，逆变器无法接收调度指令。已切换至本地运行模式，需尽快恢复通信链路。',
      alertTime: '2024-03-12 10:12:05', duration: '2小时 58分钟', monitorPoint: 'PCS-05-通信端口(CP-05-E)',
      currentStatus: '通信仍未恢复，正在排查网线及协议配置',
      timeline: [
        { name: '告警触发', description: '系统检测到BESS-05 PCS单元通信中断', time: '10:12:05', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单 WO-20240312-002', time: '10:15:20', status: 'done' },
        { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [王工]', time: '10:25:08', status: 'done' },
        { name: '现场处理', description: '[王工] 正在检查通信链路和协议配置', time: '', status: 'pending' }
      ]
    },
    {
      id: 'WO-20240311-045', title: 'BESS-12-温控系统压缩机故障处理', device: 'BESS-12-温控系统',
      deviceSN: 'BESS20231100156', level: 'important', createTime: '2024-03-11 16:42', status: 'completed',
      creator: '系统自动创建', alertId: 'ALT-20240311-056', handler: '刘工', handlerTeam: '维修一组',
      estimatedCompleteTime: '2024-03-11 20:00:00', alertContent: '温控系统压缩机#2运行异常，制冷效率下降30%。',
      alertTime: '2024-03-11 16:38:22', duration: '3小时 55分钟', monitorPoint: '温控系统-压缩机#2(COMP-12-B)',
      currentStatus: '压缩机已更换，温控系统恢复正常运行',
      timeline: [
        { name: '告警触发', description: '系统检测到BESS-12温控系统压缩机异常', time: '16:38:22', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单 WO-20240311-045', time: '16:42:10', status: 'done' },
        { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [刘工]', time: '16:50:33', status: 'done' },
        { name: '现场处理', description: '[刘工] 更换压缩机#2，调试运行正常', time: '18:20:15', status: 'done' },
        { name: '处理验收', description: '运维主管 [李经理] 验收通过', time: '19:10:45', status: 'done' },
        { name: '工单归档', description: '系统自动归档', time: '19:15:02', status: 'done' }
      ]
    },
    {
      id: 'WO-20240311-043', title: 'BESS-09-电池管理系统SOC偏差校准', device: 'BESS-09-电池管理系统',
      deviceSN: 'BESS20230900112', level: 'normal', createTime: '2024-03-11 11:20', status: 'pending',
      creator: '系统自动创建', alertId: 'ALT-20240311-054', handler: '', handlerTeam: '',
      estimatedCompleteTime: '2024-03-11 17:00:00', alertContent: 'BMS检测到SOC估算值与实际容量偏差超过5%。',
      alertTime: '2024-03-11 11:15:55', duration: '5小时 10分钟', monitorPoint: 'BMS-09-SOC估算模块',
      currentStatus: '待处理',
      timeline: [
        { name: '告警触发', description: '系统检测到BESS-09 BMS SOC偏差超限', time: '11:15:55', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单 WO-20240311-043', time: '11:20:00', status: 'done' }
      ]
    },
    {
      id: 'WO-20240310-098', title: 'BESS-07-环境监控湿度超标处理', device: 'BESS-07-环境监控',
      deviceSN: 'BESS20231000134', level: 'normal', createTime: '2024-03-10 17:05', status: 'completed',
      creator: '系统自动创建', alertId: 'ALT-20240310-102', handler: '陈工', handlerTeam: '维修二组',
      timeline: [
        { name: '告警触发', description: '系统检测到BESS-07环境湿度超标', time: '17:00:12', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单 WO-20240310-098', time: '17:05:22', status: 'done' },
        { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [陈工]', time: '17:15:40', status: 'done' },
        { name: '现场处理', description: '[陈工] 修复除湿设备', time: '18:45:10', status: 'done' },
        { name: '处理验收', description: '运维主管 [李经理] 验收通过', time: '19:30:25', status: 'done' },
        { name: '工单归档', description: '系统自动归档', time: '19:35:00', status: 'done' }
      ]
    }
  ]
}

// ============================================================
// 光伏监控数据
// ============================================================

export function getMockSolarMonitorData() {
  return {
    stationStats: [
      { label: '全站累计发电量', value: '28.6 GWh', color: '#F59A23' },
      { label: '实时发电功率', value: '12.5 MW', color: '#F59A23' },
      { label: '系统综合效率', value: '98.2%', color: '#F59A23' },
      { label: '等效利用小时数', value: '1286 h', color: '#F59A23' }
    ],
    inverterStats: [
      { label: '直流输入电压', value: '1050 V', color: '#02A7F0' },
      { label: '直流输入电流', value: '85 A', color: '#02A7F0' },
      { label: '交流输出电压', value: '400 V', color: '#02A7F0' },
      { label: '交流输出电流', value: '300 A', color: '#02A7F0' },
      { label: '设备状态', value: '正常运行', color: '#22c55e', isStatus: true, statusType: 'normal' },
      { label: '有功功率', value: '12000 kW', color: '#02A7F0' },
      { label: '转换效率', value: '99.5%', color: '#02A7F0' },
      { label: '机内温度', value: '45 ℃', color: '#F59A23' },
      { label: '功率因数', value: '0.98', color: '#02A7F0' }
    ],
    chartData: {
      month: { planned: [85, 88, 90, 92, 89, 93, 95, 94, 96, 98, 97, 95], actual: [92, 91, 93, 95, 94, 96, 97, 96, 98, 99, 98, 96] },
      week: { planned: [82, 85, 88, 86, 90, 92, 89], actual: [86, 88, 91, 89, 93, 95, 92] },
      day: { planned: Array.from({ length: 24 }, (_, i) => 80 + Math.sin(i / 4) * 10 + i * 0.5), actual: Array.from({ length: 24 }, (_, i) => 82 + Math.sin(i / 4) * 12 + i * 0.4) }
    }
  }
}

// ============================================================
// 光伏设备数据
// ============================================================

export function getMockSolarDeviceList(): Array<{ name: string; type: string; station: string; ratedPower: string; status: string; installDate: string }> {
  return [
    { name: '光伏组件#01', type: '单晶硅组件', station: '光伏站点A', ratedPower: '550W', status: '运行中', installDate: '2024-03-15' },
    { name: '光伏组件#02', type: '单晶硅组件', station: '光伏站点A', ratedPower: '550W', status: '运行中', installDate: '2024-03-15' },
    { name: '光伏逆变器#01', type: '组串式逆变器', station: '光伏站点B', ratedPower: '100kW', status: '运行中', installDate: '2024-01-20' },
    { name: '光伏逆变器#02', type: '组串式逆变器', station: '光伏站点B', ratedPower: '100kW', status: '维护中', installDate: '2024-01-20' },
    { name: '汇流箱#01', type: '直流汇流箱', station: '光伏站点A', ratedPower: '16路', status: '运行中', installDate: '2024-02-10' }
  ]
}

// ============================================================
// 光伏运维工单数据
// ============================================================

export function getMockSolarMaintenanceList(): WorkOrder[] {
  return [
    {
      id: 'WO-20240312-S01', title: '光伏逆变器#02-转换效率下降告警', device: '光伏逆变器#02',
      deviceSN: 'SOLAR2023100023', level: 'important', createTime: '2024-03-12 08:45', status: 'processing',
      creator: '系统自动创建', alertId: 'ALT-20240312-090', handler: '刘工', handlerTeam: '光伏运维组',
      alertContent: '逆变器转换效率持续下降至98.8%，低于正常阈值(99.0%)。建议检查MPPT模块及直流输入。',
      alertTime: '2024-03-12 08:42:10', duration: '2小时 15分钟',
      recoveryTime: '', rootCause: 'MPPT模块部分故障', solution: '正在更换MPPT模块',
      timeline: [
        { name: '告警触发', description: '系统检测到逆变器效率异常下降', time: '08:42:10', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单', time: '08:45:00', status: 'done' },
        { name: '现场处理', description: '[刘工] 正在更换MPPT模块', time: '09:30:00', status: 'active' },
        { name: '工单归档', description: '待验收后归档', time: '', status: 'pending' }
      ]
    },
    {
      id: 'WO-20240311-S15', title: '光伏组件#12-功率衰减异常', device: '光伏组件#12',
      deviceSN: 'SOLAR2023080156', level: 'normal', createTime: '2024-03-11 15:20', status: 'completed',
      creator: '系统自动创建', alertId: 'ALT-20240311-067', handler: '赵工', handlerTeam: '光伏运维组',
      alertContent: '组件功率衰减超过5%，需现场检测并视情况更换。',
      alertTime: '2024-03-11 15:15:00', duration: '3小时 40分钟',
      recoveryTime: '2024-03-11 18:55:00', rootCause: '组件热斑效应', solution: '更换组件#12',
      timeline: [
        { name: '告警触发', description: '系统检测到组件功率异常衰减', time: '15:15:00', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单', time: '15:20:00', status: 'done' },
        { name: '现场处理', description: '[赵工] 更换故障组件', time: '17:30:00', status: 'done' },
        { name: '处理验收', description: '运维主管验收通过', time: '18:00:00', status: 'done' },
        { name: '工单归档', description: '系统自动归档', time: '18:55:00', status: 'done' }
      ]
    },
    {
      id: 'WO-20240310-S08', title: '汇流箱#03-通信故障处理', device: '汇流箱#03',
      deviceSN: 'SOLAR2023070089', level: 'urgent', createTime: '2024-03-10 11:30', status: 'archived',
      creator: '系统自动创建', alertId: 'ALT-20240310-110', handler: '王工', handlerTeam: '光伏运维组',
      alertContent: '汇流箱通信中断，监控数据无法上传。',
      alertTime: '2024-03-10 11:25:00', duration: '1小时 20分钟',
      recoveryTime: '2024-03-10 12:45:00', rootCause: '通信线缆松动', solution: '重新连接并加固通信线缆',
      timeline: [
        { name: '告警触发', description: '系统检测到汇流箱通信中断', time: '11:25:00', status: 'done' },
        { name: '工单创建', description: '系统自动生成工单', time: '11:30:00', status: 'done' },
        { name: '现场处理', description: '[王工] 重新连接通信线缆', time: '12:00:00', status: 'done' },
        { name: '工单归档', description: '系统自动归档', time: '12:45:00', status: 'done' }
      ]
    }
  ]
}

// ============================================================
// 光伏计量数据
// ============================================================

export function getMockSolarMeteringData() {
  return {
    efficiencyDates: ['03-31', '04-01', '04-02', '04-03', '04-04', '04-05', '04-06'],
    inverterEfficiency: [96.8, 97.0, 97.2, 97.6, 97.4, 97.8, 98.0],
    arrayEfficiency: [80.5, 81.0, 81.5, 82.0, 82.2, 82.5, 83.0],
    peakPower: { value: '12.5', unit: 'MW', date: '2026-04-03' },
    dayNightRatio: { day: '68.5', night: '31.5' },
    gridConnected: { total: '28.6', unit: 'GWh', growth: '+12.5' }
  }
}

// ============================================================
// 天气数据
// ============================================================

import type { WeatherInfo } from '@/api/weather'

export function getMockWeatherData(city: string = '广州'): WeatherInfo {
  return {
    city,
    temperature: 32,
    description: '晴',
    maxTemp: 33,
    minTemp: 26,
    weatherCode: 0
  }
}
