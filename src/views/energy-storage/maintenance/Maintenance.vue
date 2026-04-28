<template>
  <div class="maintenance-container">
    <ModuleTabs :tabs="energyStorageTabs" :embedded="embedded" />
    <WorkOrderManager :orders="mockOrders" />
  </div>
</template>

<script setup lang="ts">
import ModuleTabs from '@/components/common/ModuleTabs.vue'
import WorkOrderManager from '@/components/business/WorkOrderManager.vue'
import type { WorkOrder } from '@/components/business/WorkOrderManager.vue'

defineProps<{ embedded?: boolean }>()

const energyStorageTabs = [
  { name: '可视看板', path: '/energy-storage/dashboard' },
  { name: '实时监控', path: '/energy-storage/monitor' },
  { name: '策略控制', path: '/energy-storage/strategy' },
  { name: '电价管理', path: '/energy-storage/price' },
  { name: '抄表结算', path: '/energy-storage/settlement' },
  { name: '收益管理', path: '/energy-storage/revenue' },
  { name: '运维管理', path: '/energy-storage/maintenance' }
]

const mockOrders: WorkOrder[] = [
  {
    id: 'WO-20240312-001',
    title: 'BESS-08-电池簇温度异常告警处理',
    device: 'BESS-08-电池簇',
    deviceSN: 'BESS20230800128',
    level: 'urgent',
    createTime: '2024-03-12 09:23',
    status: 'processing',
    creator: '系统自动创建',
    alertId: 'ALT-20240312-087',
    handler: '张工',
    handlerTeam: '维修一组',
    estimatedCompleteTime: '2024-03-12 14:00:00',
    alertContent: '电池簇#8温度异常升高，当前温度48.5℃，超过安全阈值(45℃)。BMS系统已自动降低充放电功率，建议立即现场检查散热系统及电池单体状态。',
    alertTime: '2024-03-12 09:22:18',
    duration: '1小时 37分钟',
    monitorPoint: '电池簇#8-中部温度传感器(TS-08-M)',
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
    id: 'WO-20240312-002',
    title: 'BESS-05-PCS单元通信中断处理',
    device: 'BESS-05-PCS单元',
    deviceSN: 'BESS20230700095',
    level: 'important',
    createTime: '2024-03-12 10:15',
    status: 'dispatched',
    creator: '系统自动创建',
    alertId: 'ALT-20240312-088',
    handler: '王工',
    handlerTeam: '维修二组',
    estimatedCompleteTime: '2024-03-12 16:00:00',
    alertContent: 'PCS单元与BMS通信中断，逆变器无法接收调度指令。已切换至本地运行模式，需尽快恢复通信链路。',
    alertTime: '2024-03-12 10:12:05',
    duration: '2小时 58分钟',
    monitorPoint: 'PCS-05-通信端口(CP-05-E)',
    currentStatus: '通信仍未恢复，正在排查网线及协议配置',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-05 PCS单元通信中断', time: '10:12:05', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240312-002', time: '10:15:20', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [王工]', time: '10:25:08', status: 'done' },
      { name: '现场处理', description: '[王工] 正在检查通信链路和协议配置', time: '', status: 'pending' },
      { name: '处理验收', description: '待处理完成后由运维主管验收', time: '', status: 'pending' },
      { name: '工单归档', description: '验收通过后系统自动归档', time: '', status: 'pending' }
    ]
  },
  {
    id: 'WO-20240311-045',
    title: 'BESS-12-温控系统压缩机故障处理',
    device: 'BESS-12-温控系统',
    deviceSN: 'BESS20231100156',
    level: 'important',
    createTime: '2024-03-11 16:42',
    status: 'completed',
    creator: '系统自动创建',
    alertId: 'ALT-20240311-056',
    handler: '刘工',
    handlerTeam: '维修一组',
    estimatedCompleteTime: '2024-03-11 20:00:00',
    alertContent: '温控系统压缩机#2运行异常，制冷效率下降30%。环境温度持续上升，需尽快更换压缩机或启用备用制冷单元。',
    alertTime: '2024-03-11 16:38:22',
    duration: '3小时 55分钟',
    monitorPoint: '温控系统-压缩机#2(COMP-12-B)',
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
    id: 'WO-20240311-044',
    title: 'BESS-03-消防系统烟感误报处理',
    device: 'BESS-03-消防系统',
    deviceSN: 'BESS20230600078',
    level: 'urgent',
    createTime: '2024-03-11 14:30',
    status: 'archived',
    creator: '系统自动创建',
    alertId: 'ALT-20240311-055',
    handler: '赵工',
    handlerTeam: '安全组',
    estimatedCompleteTime: '2024-03-11 18:00:00',
    alertContent: '消防系统烟感探测器连续误报，已触发消防预警。经初步排查为灰尘积聚导致灵敏度异常，需清洁并重新校准。',
    alertTime: '2024-03-11 14:25:38',
    duration: '4小时 20分钟',
    monitorPoint: '消防系统-烟感探测器(SD-03-A)',
    currentStatus: '烟感已清洁校准，误报消除，系统正常',
    timeline: [
      { name: '告警触发', description: '消防系统烟感误报触发预警', time: '14:25:38', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240311-044', time: '14:30:05', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [赵工]', time: '14:40:20', status: 'done' },
      { name: '现场处理', description: '[赵工] 清洁烟感探测器并重新校准', time: '16:15:42', status: 'done' },
      { name: '处理验收', description: '运维主管 [李经理] 验收通过', time: '17:30:18', status: 'done' },
      { name: '工单归档', description: '系统自动归档', time: '18:00:00', status: 'done' }
    ]
  },
  {
    id: 'WO-20240311-043',
    title: 'BESS-09-电池管理系统SOC偏差校准',
    device: 'BESS-09-电池管理系统',
    deviceSN: 'BESS20230900112',
    level: 'normal',
    createTime: '2024-03-11 11:20',
    status: 'pending',
    creator: '系统自动创建',
    alertId: 'ALT-20240311-054',
    handler: '',
    handlerTeam: '',
    estimatedCompleteTime: '2024-03-11 17:00:00',
    alertContent: 'BMS检测到SOC估算值与实际容量偏差超过5%，建议进行SOC校准以确保调度准确性。',
    alertTime: '2024-03-11 11:15:55',
    duration: '5小时 10分钟',
    monitorPoint: 'BMS-09-SOC估算模块',
    currentStatus: '待处理',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-09 BMS SOC偏差超限', time: '11:15:55', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240311-043', time: '11:20:00', status: 'done' },
      { name: '工单派发', description: '待运维主管派发', time: '', status: 'pending' },
      { name: '现场处理', description: '待处理', time: '', status: 'pending' },
      { name: '处理验收', description: '待处理完成后由运维主管验收', time: '', status: 'pending' },
      { name: '工单归档', description: '验收通过后系统自动归档', time: '', status: 'pending' }
    ]
  },
  {
    id: 'WO-20240310-098',
    title: 'BESS-07-环境监控湿度超标处理',
    device: 'BESS-07-环境监控',
    deviceSN: 'BESS20231000134',
    level: 'normal',
    createTime: '2024-03-10 17:05',
    status: 'completed',
    creator: '系统自动创建',
    alertId: 'ALT-20240310-102',
    handler: '陈工',
    handlerTeam: '维修二组',
    estimatedCompleteTime: '2024-03-10 20:00:00',
    alertContent: '环境监控系统检测到储能舱内相对湿度达85%，超过安全阈值(80%)。需检查除湿设备及舱体密封性。',
    alertTime: '2024-03-10 17:00:12',
    duration: '3小时 15分钟',
    monitorPoint: '环境监控-湿度传感器(HU-07-A)',
    currentStatus: '除湿设备已修复，湿度降至65%',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-07环境湿度超标', time: '17:00:12', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240310-098', time: '17:05:22', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [陈工]', time: '17:15:40', status: 'done' },
      { name: '现场处理', description: '[陈工] 修复除湿设备，检查舱体密封', time: '18:45:10', status: 'done' },
      { name: '处理验收', description: '运维主管 [李经理] 验收通过', time: '19:30:25', status: 'done' },
      { name: '工单归档', description: '系统自动归档', time: '19:35:00', status: 'done' }
    ]
  },
  {
    id: 'WO-20240310-097',
    title: 'BESS-02-通信模块信号弱处理',
    device: 'BESS-02-通信模块',
    deviceSN: 'BESS20230500056',
    level: 'important',
    createTime: '2024-03-10 15:48',
    status: 'archived',
    creator: '系统自动创建',
    alertId: 'ALT-20240310-101',
    handler: '孙工',
    handlerTeam: '通信组',
    estimatedCompleteTime: '2024-03-10 19:00:00',
    alertContent: '4G通信模块信号强度降至-110dBm，数据传输出现丢包。需检查天线连接及信号覆盖情况。',
    alertTime: '2024-03-10 15:42:30',
    duration: '3小时 45分钟',
    monitorPoint: '通信模块-4G信号强度(CM-02-4G)',
    currentStatus: '天线已调整，信号恢复至-85dBm',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-02通信信号弱', time: '15:42:30', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240310-097', time: '15:48:15', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [孙工]', time: '15:55:20', status: 'done' },
      { name: '现场处理', description: '[孙工] 调整天线方向，信号恢复正常', time: '17:20:45', status: 'done' },
      { name: '处理验收', description: '运维主管 [李经理] 验收通过', time: '18:10:33', status: 'done' },
      { name: '工单归档', description: '系统自动归档', time: '18:30:00', status: 'done' }
    ]
  },
  {
    id: 'WO-20240310-096',
    title: 'BESS-11-主控单元风扇异响处理',
    device: 'BESS-11-主控单元',
    deviceSN: 'BESS20231100145',
    level: 'urgent',
    createTime: '2024-03-10 13:22',
    status: 'processing',
    creator: '系统自动创建',
    alertId: 'ALT-20240310-100',
    handler: '周工',
    handlerTeam: '维修一组',
    estimatedCompleteTime: '2024-03-10 17:00:00',
    alertContent: '主控单元散热风扇出现异常噪音，转速波动较大。存在过热风险，建议尽快更换风扇。',
    alertTime: '2024-03-10 13:18:05',
    duration: '4小时 05分钟',
    monitorPoint: '主控单元-散热风扇(FAN-11-A)',
    currentStatus: '风扇已更换，运行平稳',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-11主控单元风扇异响', time: '13:18:05', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240310-096', time: '13:22:10', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [周工]', time: '13:30:25', status: 'done' },
      { name: '现场处理', description: '[周工] 正在更换散热风扇', time: '14:50:18', status: 'active' },
      { name: '处理验收', description: '待处理完成后由运维主管验收', time: '', status: 'pending' },
      { name: '工单归档', description: '验收通过后系统自动归档', time: '', status: 'pending' }
    ]
  },
  {
    id: 'WO-20240310-095',
    title: 'BESS-04-能量管理系统数据同步异常',
    device: 'BESS-04-能量管理',
    deviceSN: 'BESS20230700089',
    level: 'important',
    createTime: '2024-03-10 09:17',
    status: 'dispatched',
    creator: '系统自动创建',
    alertId: 'ALT-20240310-099',
    handler: '吴工',
    handlerTeam: '软件组',
    estimatedCompleteTime: '2024-03-10 15:00:00',
    alertContent: '能量管理系统与调度中心数据同步延迟超过30秒，影响实时调度决策。需排查网络及数据库同步机制。',
    alertTime: '2024-03-10 09:12:44',
    duration: '5小时 40分钟',
    monitorPoint: '能量管理-数据同步服务(EM-04-SYNC)',
    currentStatus: '正在排查数据库同步延迟原因',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-04能量管理数据同步异常', time: '09:12:44', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240310-095', time: '09:17:05', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [吴工]', time: '09:25:30', status: 'done' },
      { name: '现场处理', description: '[吴工] 正在排查数据库同步延迟', time: '', status: 'pending' },
      { name: '处理验收', description: '待处理完成后由运维主管验收', time: '', status: 'pending' },
      { name: '工单归档', description: '验收通过后系统自动归档', time: '', status: 'pending' }
    ]
  },
  {
    id: 'WO-20240309-156',
    title: 'BESS-01-电池组单体电压不均处理',
    device: 'BESS-01-电池组',
    deviceSN: 'BESS20230500042',
    level: 'normal',
    createTime: '2024-03-09 16:40',
    status: 'archived',
    creator: '系统自动创建',
    alertId: 'ALT-20240309-098',
    handler: '郑工',
    handlerTeam: '维修二组',
    estimatedCompleteTime: '2024-03-09 22:00:00',
    alertContent: '电池组单体电压差异达到120mV，超过均衡阈值(100mV)。建议启动主动均衡程序并监测均衡效果。',
    alertTime: '2024-03-09 16:35:20',
    duration: '5小时 30分钟',
    monitorPoint: '电池组-单体电压监测(VM-01-CELL)',
    currentStatus: '主动均衡已完成，电压差异降至45mV',
    timeline: [
      { name: '告警触发', description: '系统检测到BESS-01电池组单体电压不均', time: '16:35:20', status: 'done' },
      { name: '工单创建', description: '系统自动生成工单 WO-20240309-156', time: '16:40:10', status: 'done' },
      { name: '工单派发', description: '运维主管 [李经理] 将工单派发给 [郑工]', time: '16:50:25', status: 'done' },
      { name: '现场处理', description: '[郑工] 启动主动均衡程序并监测效果', time: '18:30:15', status: 'done' },
      { name: '处理验收', description: '运维主管 [李经理] 验收通过', time: '20:15:40', status: 'done' },
      { name: '工单归档', description: '系统自动归档', time: '21:00:00', status: 'done' }
    ]
  }
]
</script>

<style scoped>
.maintenance-container {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
